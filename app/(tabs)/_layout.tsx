import { Tabs, useRouter } from "expo-router";
import React, { useEffect } from "react";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { useAuth } from "@/hooks/useAuth";

export default function TabLayout() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  // Protect tabs - redirect to onboarding if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/(onboarding)/welcome');
    }
  }, [isAuthenticated, authLoading, router]);
  
  // Don't render tabs if not authenticated
  if (!authLoading && !isAuthenticated) {
    return null;
  }
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#8B5CF6',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopWidth: 1,
          borderTopColor: 'rgba(139, 92, 246, 0.2)',
          height: 85,
          paddingBottom: 20,
          paddingTop: 10,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
          marginBottom: 0,
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={focused ? 32 : 28} name="house.fill" color={focused ? '#8B5CF6' : color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Benachrichtigungen",
          tabBarLabel: "Benachrichtigungen",
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 2,
            marginBottom: 0,
          },
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={focused ? 32 : 28} name="bell.fill" color={focused ? '#8B5CF6' : color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Einstellungen",
          tabBarLabel: "Einstellungen",
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 2,
            marginBottom: 0,
          },
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={focused ? 32 : 28} name="gearshape.fill" color={focused ? '#8B5CF6' : color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={focused ? 32 : 28} name="person.fill" color={focused ? '#8B5CF6' : color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ad-view"
        options={{
          title: "Kampagne",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={22} name="play.circle.fill" color={color} />
          ),
          href: null,
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="permissions-demo"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
