import { createServiceRoleClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin-helpers'
import { NextResponse } from 'next/server'

// Import Expo Server SDK for sending push notifications
let Expo: any;
let expoServerSdkInstalled = false;
try {
  const expoServerSdk = require('expo-server-sdk');
  // expo-server-sdk exports Expo as a named export (function/class)
  Expo = expoServerSdk.Expo || expoServerSdk.default;
  expoServerSdkInstalled = Expo && typeof Expo === 'function';
} catch (error) {
  console.warn('expo-server-sdk not installed. Run: npm install expo-server-sdk');
  expoServerSdkInstalled = false;
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
    
    const body = await request.json()
    const { type, userIds: requestedUserIds, campaignId, title, body: notificationBody } = body
    
    if (!title || !notificationBody) {
      return NextResponse.json(
        { error: 'Titel und Nachricht sind erforderlich' },
        { status: 400 }
      )
    }
    
    const adminSupabase = createServiceRoleClient()
    
    // Get target users
    let targetUsers: any[] = []
    
    if (type === 'all') {
      const { data: users, error } = await adminSupabase
        .from('users')
        .select('id, email, name, notifications_enabled')
        .eq('notifications_enabled', true)
      
      if (error) {
        console.error('Error fetching users:', error)
        return NextResponse.json(
          { error: 'Fehler beim Laden der User' },
          { status: 500 }
        )
      }
      
      targetUsers = users || []
    } else if (type === 'selected' && requestedUserIds && requestedUserIds.length > 0) {
      const { data: users, error } = await adminSupabase
        .from('users')
        .select('id, email, name, notifications_enabled')
        .in('id', requestedUserIds)
        .eq('notifications_enabled', true)
      
      if (error) {
        console.error('Error fetching selected users:', error)
        return NextResponse.json(
          { error: 'Fehler beim Laden der ausgewählten User' },
          { status: 500 }
        )
      }
      
      targetUsers = users || []
    }
    
    // Filter users with notifications enabled
    const usersToNotify = targetUsers.filter(u => u.notifications_enabled)
    
    if (usersToNotify.length === 0) {
      return NextResponse.json({
        success: true,
        sentCount: 0,
        message: 'Keine User mit aktivierten Benachrichtigungen gefunden',
      })
    }
    
    // Check if expo-server-sdk is available
    if (!expoServerSdkInstalled || !Expo) {
      return NextResponse.json(
        { 
          error: 'expo-server-sdk nicht installiert oder nicht korrekt importiert. Bitte installieren Sie es mit: npm install expo-server-sdk',
          note: 'Installieren Sie expo-server-sdk im merchant-portal Verzeichnis und starten Sie den Server neu',
        },
        { status: 500 }
      )
    }
    
    // Create Expo instance
    const expo = new Expo()
    
    // Get push tokens for users
    const targetUserIds = usersToNotify.map(u => u.id)
    console.log(`Fetching push tokens for ${targetUserIds.length} users:`, targetUserIds)
    
    const { data: pushTokens, error: tokensError } = await adminSupabase
      .from('push_tokens')
      .select('token, user_id, platform')
      .in('user_id', targetUserIds)
    
    if (tokensError) {
      console.error('Error fetching push tokens:', tokensError)
      return NextResponse.json(
        { error: 'Fehler beim Laden der Push-Tokens', details: tokensError.message },
        { status: 500 }
      )
    }
    
    console.log(`Found ${pushTokens?.length || 0} push tokens`)
    
    // Log platform distribution
    const platformCounts = pushTokens?.reduce((acc: any, token: any) => {
      acc[token.platform] = (acc[token.platform] || 0) + 1;
      return acc;
    }, {}) || {};
    console.log('Platform distribution:', platformCounts);
    
    if (!pushTokens || pushTokens.length === 0) {
      return NextResponse.json({
        success: true,
        sentCount: 0,
        message: 'Keine Push-Tokens für die ausgewählten User gefunden',
        note: 'User müssen die App öffnen und Benachrichtigungen aktivieren, damit ihre Tokens gespeichert werden',
        userIdsRequested: targetUserIds.length,
        usersToNotify: usersToNotify.length,
      })
    }
    
    // Create messages for Expo Push API
    // expo-server-sdk v4+ has isExpoPushToken as a static method on Expo class
    const validTokens = pushTokens.filter(tokenData => {
      // Use Expo.isExpoPushToken if available, otherwise check token format
      if (Expo.isExpoPushToken) {
        return Expo.isExpoPushToken(tokenData.token);
      }
      // Fallback: check if token starts with ExponentPushToken
      const isValid = tokenData.token.startsWith('ExponentPushToken[') || 
                      tokenData.token.startsWith('ExpoPushToken[');
      if (!isValid) {
        console.warn(`Invalid token format for user ${tokenData.user_id}: ${tokenData.token.substring(0, 50)}...`);
      }
      return isValid;
    });
    
    console.log(`Valid tokens: ${validTokens.length} of ${pushTokens.length}`);
    
    const messages = validTokens.map(tokenData => ({
      to: tokenData.token,
      sound: 'default',
      title: title,
      body: notificationBody,
      data: {
        campaignId: campaignId || null,
        type: 'admin_notification',
        timestamp: new Date().toISOString(),
      },
      badge: 1,
    }));
    
    if (messages.length === 0) {
      return NextResponse.json({
        success: true,
        sentCount: 0,
        message: 'Keine gültigen Expo Push Tokens gefunden',
        totalTokens: pushTokens.length,
        validTokens: 0,
      })
    }
    
    // Send notifications in chunks
    const chunks = expo.chunkPushNotifications(messages)
    console.log(`Sending ${messages.length} messages in ${chunks.length} chunks`)
    let sentCount = 0
    const errors: string[] = []
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      try {
        console.log(`Sending chunk ${i + 1}/${chunks.length} with ${chunk.length} messages`)
        const tickets = await expo.sendPushNotificationsAsync(chunk)
        
        tickets.forEach((ticket, index) => {
          if (ticket.status === 'ok') {
            sentCount++
          } else if (ticket.status === 'error') {
            const token = chunk[index].to;
            const errorMsg = `Token ${token}: ${ticket.message}`;
            errors.push(errorMsg)
            
            // Check for specific credential errors
            if (ticket.message?.includes('APNs credentials') || ticket.message?.includes('InvalidCredentials')) {
              console.error('❌ APNs Credentials fehlen für iOS Push-Benachrichtigungen!');
              console.error('   Option 1: Apple Developer Account ($99/Jahr) → eas credentials → iOS → Push Notifications');
              console.error('   Option 2: Expo Go verwenden (funktioniert ohne Credentials, nur für Development)');
              console.error('   Option 3: Lokale Notifications verwenden (bereits implementiert, funktioniert ohne Credentials)');
              console.error('   Siehe: PUSH_NOTIFICATIONS_WITHOUT_APPLE_ACCOUNT.md für Details');
            } else if (ticket.message?.includes('FCM') || ticket.message?.includes('Firebase')) {
              console.error('❌ FCM Credentials fehlen für Android Push-Benachrichtigungen!');
              console.error('   Lösung: Firebase Setup erforderlich');
            }
            
            console.error('Push notification error:', errorMsg, ticket.details)
          }
        })
        console.log(`Chunk ${i + 1} completed: ${sentCount} sent so far`)
      } catch (error: any) {
        console.error(`Error sending push notifications chunk ${i + 1}:`, error)
        errors.push(`Chunk ${i + 1} error: ${error.message}`)
      }
    }
    
    console.log(`Push notification send completed: ${sentCount} sent, ${errors.length} errors`)
    
    // Check if all errors are credential-related
    const credentialErrors = errors.filter(e => 
      e.includes('APNs credentials') || 
      e.includes('InvalidCredentials') ||
      e.includes('FCM') ||
      e.includes('Firebase')
    );
    
    let helpfulMessage = `Benachrichtigung an ${sentCount} von ${messages.length} User gesendet`;
    
    if (sentCount === 0 && credentialErrors.length > 0) {
      const hasIOS = platformCounts.ios > 0;
      const hasAndroid = platformCounts.android > 0;
      
      if (hasIOS && credentialErrors.some(e => e.includes('APNs'))) {
        helpfulMessage = `❌ iOS Credentials fehlen! Optionen: 1) Apple Developer Account + eas credentials, 2) Expo Go verwenden, 3) Lokale Notifications. Siehe PUSH_NOTIFICATIONS_WITHOUT_APPLE_ACCOUNT.md`;
      } else if (hasAndroid && credentialErrors.some(e => e.includes('FCM') || e.includes('Firebase'))) {
        helpfulMessage = `❌ Android FCM Credentials fehlen! Firebase Setup erforderlich.`;
      } else {
        helpfulMessage = `❌ Push-Credentials fehlen! Siehe APNS_CREDENTIALS_SETUP.md für Setup-Anleitung.`;
      }
    }
    
    return NextResponse.json({
      success: sentCount > 0,
      sentCount,
      totalTokens: pushTokens.length,
      messagesCreated: messages.length,
      platformDistribution: platformCounts,
      errors: errors.length > 0 ? errors : undefined,
      message: helpfulMessage,
      ...(credentialErrors.length > 0 && {
        credentialError: true,
        setupGuide: 'Siehe PUSH_NOTIFICATIONS_WITHOUT_APPLE_ACCOUNT.md für Alternativen ohne Apple Developer Account'
      })
    })
  } catch (error: any) {
    console.error('Error in POST /api/admin/notifications/send:', error)
    return NextResponse.json(
      { error: error.message || 'Fehler beim Senden der Benachrichtigung' },
      { status: 500 }
    )
  }
}
