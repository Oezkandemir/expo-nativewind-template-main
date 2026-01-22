#!/usr/bin/env tsx
/**
 * Script zum manuellen Senden von Push-Benachrichtigungen
 * 
 * Verwendung:
 *   npx tsx scripts/send-test-push.ts "Titel" "Nachricht"
 * 
 * Oder mit autoStart Flag (für Kampagnen):
 *   npx tsx scripts/send-test-push.ts "Titel" "Nachricht" --autoStart
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

// Funktion zum Laden von .env Dateien
function loadEnvFiles() {
  const envFiles = [
    join(process.cwd(), '.env.local'),
    join(process.cwd(), '.env'),
    join(process.cwd(), 'apps/merchant-portal/.env.local'),
    join(process.cwd(), 'apps/merchant-portal/.env'),
  ]

  for (const envFile of envFiles) {
    if (existsSync(envFile)) {
      try {
        const content = readFileSync(envFile, 'utf-8')
        const lines = content.split('\n')
        
        for (const line of lines) {
          const trimmedLine = line.trim()
          // Ignoriere Kommentare und leere Zeilen
          if (!trimmedLine || trimmedLine.startsWith('#')) continue
          
          const equalIndex = trimmedLine.indexOf('=')
          if (equalIndex === -1) continue
          
          const key = trimmedLine.substring(0, equalIndex).trim()
          let value = trimmedLine.substring(equalIndex + 1).trim()
          
          // Entferne Anführungszeichen falls vorhanden
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1)
          }
          
          // Setze nur wenn noch nicht gesetzt (spätere Dateien überschreiben frühere)
          if (!process.env[key]) {
            process.env[key] = value
          }
        }
      } catch (error) {
        // Ignoriere Fehler beim Lesen
      }
    }
  }
}

// Lade .env Dateien
loadEnvFiles()

// Lade Umgebungsvariablen
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Fehlende Umgebungsvariablen!')
  console.error('Benötigt:')
  console.error('  - NEXT_PUBLIC_SUPABASE_URL oder EXPO_PUBLIC_SUPABASE_URL')
  console.error('  - SUPABASE_SERVICE_ROLE_KEY')
  console.error('')
  console.error('Setze diese Variablen in einer .env Datei oder als Umgebungsvariablen.')
  process.exit(1)
}

// Parse Argumente
const args = process.argv.slice(2)
const autoStart = args.includes('--autoStart') || args.includes('--autostart')
const title = args.find(arg => !arg.startsWith('--')) || 'Test Benachrichtigung'
const body = args.filter(arg => !arg.startsWith('--')).slice(1).join(' ') || 'Dies ist eine Test-Benachrichtigung'

async function sendPushNotification() {
  try {
    // Erstelle Supabase Client mit Service Role Key
    // TypeScript assertion: We know these are defined due to check above
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // Hole alle Push-Tokens
    console.log('📱 Lade Push-Tokens aus der Datenbank...')
    const { data: pushTokens, error } = await supabase
      .from('push_tokens')
      .select('token, platform, user_id')

    if (error) {
      console.error('❌ Fehler beim Laden der Push-Tokens:', error)
      process.exit(1)
    }

    if (!pushTokens || pushTokens.length === 0) {
      console.warn('⚠️  Keine Push-Tokens gefunden!')
      console.warn('   Stelle sicher, dass:')
      console.warn('   1. User sich in der App angemeldet haben')
      console.warn('   2. Benachrichtigungen aktiviert wurden')
      console.warn('   3. Die App den Push-Token registriert hat')
      process.exit(0)
    }

    console.log(`✅ ${pushTokens.length} Push-Token(s) gefunden`)

    // Erstelle Expo Client
    const expo = new Expo()

    // Erstelle Nachrichten
    const messages = pushTokens
      .filter(tokenData => {
        // Validiere Token-Format
        if (Expo.isExpoPushToken && Expo.isExpoPushToken(tokenData.token)) {
          return true
        }
        // Fallback: Prüfe Token-Format manuell
        const isValid = tokenData.token.startsWith('ExponentPushToken[') || 
                        tokenData.token.startsWith('ExpoPushToken[')
        if (!isValid) {
          console.warn(`⚠️  Ungültiges Token-Format für User ${tokenData.user_id}: ${tokenData.token.substring(0, 50)}...`)
        }
        return isValid
      })
      .map(tokenData => ({
        to: tokenData.token,
        sound: 'default' as const,
        title: title,
        body: body,
        data: {
          autoStart: autoStart,
          type: autoStart ? 'campaign' : 'admin_notification',
          timestamp: new Date().toISOString(),
        },
        badge: 1,
      }))

    if (messages.length === 0) {
      console.error('❌ Keine gültigen Expo Push Tokens gefunden!')
      process.exit(1)
    }

    console.log(`📤 Sende ${messages.length} Benachrichtigung(en)...`)

    // Sende in Chunks
    const chunks = expo.chunkPushNotifications(messages)
    let sentCount = 0
    const errors: string[] = []

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      try {
        console.log(`   Chunk ${i + 1}/${chunks.length} (${chunk.length} Nachrichten)...`)
        const tickets = await expo.sendPushNotificationsAsync(chunk)

        tickets.forEach((ticket: any, index: number) => {
          if (ticket.status === 'ok') {
            sentCount++
          } else {
            const token = chunk[index].to
            const errorMsg = `Token ${token.substring(0, 30)}...: ${ticket.message}`
            errors.push(errorMsg)
            console.error(`   ❌ ${errorMsg}`)
          }
        })
      } catch (error: any) {
        console.error(`   ❌ Fehler beim Senden von Chunk ${i + 1}:`, error.message)
        errors.push(`Chunk ${i + 1}: ${error.message}`)
      }
    }

    // Ergebnis
    console.log('')
    console.log('📊 Ergebnis:')
    console.log(`   ✅ Erfolgreich gesendet: ${sentCount}/${messages.length}`)
    if (errors.length > 0) {
      console.log(`   ❌ Fehler: ${errors.length}`)
      errors.forEach(err => console.log(`      - ${err}`))
    }

    if (sentCount > 0) {
      console.log('')
      console.log('✅ Push-Benachrichtigungen wurden gesendet!')
      console.log(`   Titel: "${title}"`)
      console.log(`   Nachricht: "${body}"`)
      if (autoStart) {
        console.log('   ⚠️  autoStart Flag gesetzt - wird Kampagne automatisch starten')
      }
    } else {
      console.log('')
      console.error('❌ Keine Benachrichtigungen konnten gesendet werden!')
      if (errors.some(e => e.includes('APNs') || e.includes('credentials'))) {
        console.error('')
        console.error('💡 Tipp: Push-Credentials fehlen möglicherweise.')
        console.error('   Siehe: docs/setup/PUSH_NOTIFICATIONS_SETUP_GUIDE.md')
      }
      process.exit(1)
    }
  } catch (error: any) {
    console.error('❌ Fehler:', error.message)
    console.error(error)
    process.exit(1)
  }
}

// Prüfe ob expo-server-sdk installiert ist
let Expo: any
let expoServerSdkInstalled = false

// Versuche verschiedene Pfade für expo-server-sdk
const possiblePaths: string[] = [
  'expo-server-sdk', // Standard require (sollte funktionieren wenn NODE_PATH gesetzt ist)
  join(process.cwd(), 'apps/merchant-portal/node_modules/expo-server-sdk'),
  join(process.cwd(), 'node_modules/expo-server-sdk'),
  join(__dirname, '../apps/merchant-portal/node_modules/expo-server-sdk'),
  join(__dirname, '../node_modules/expo-server-sdk'),
]

// Versuche auch require.resolve mit verschiedenen Suchpfaden
try {
  const resolvedPath = require.resolve('expo-server-sdk', { paths: [
    join(process.cwd(), 'apps/merchant-portal/node_modules'),
    join(process.cwd(), 'node_modules'),
    ...(require.resolve.paths?.('expo-server-sdk') || []),
  ]})
  if (resolvedPath) {
    possiblePaths.unshift(resolvedPath) // Füge am Anfang hinzu für höhere Priorität
  }
} catch (e) {
  // Ignoriere Fehler bei resolve
}

for (const modulePath of possiblePaths) {
  try {
    const expoServerSdk = require(modulePath)
    Expo = expoServerSdk.Expo || expoServerSdk.default || expoServerSdk
    if (Expo && typeof Expo === 'function') {
      expoServerSdkInstalled = true
      break
    }
  } catch (e) {
    // Versuche nächsten Pfad
    continue
  }
}

if (!expoServerSdkInstalled) {
  console.error('❌ expo-server-sdk ist nicht installiert!')
  console.error('')
  console.error('Installiere es mit:')
  console.error('  cd apps/merchant-portal')
  console.error('  npm install expo-server-sdk')
  console.error('')
  console.error('ODER verwende das Wrapper-Script:')
  console.error('  bash scripts/send-push.sh "Titel" "Nachricht"')
  process.exit(1)
}

sendPushNotification()
