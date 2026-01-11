import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ReceivedNotification {
  id: string;
  title: string;
  body: string;
  receivedAt: string; // ISO timestamp
  data?: Record<string, any>;
}

interface NotificationState {
  hasPermission: boolean | null;
  setHasPermission: (hasPermission: boolean | null) => void;
  isInitialized: boolean;
  setIsInitialized: (isInitialized: boolean) => void;
  receivedNotifications: ReceivedNotification[];
  addReceivedNotification: (notification: ReceivedNotification) => void;
  clearReceivedNotifications: () => void;
  getRecentNotifications: (days?: number) => ReceivedNotification[];
  removeDuplicates: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      hasPermission: null,
      setHasPermission: (hasPermission) => set({ hasPermission }),
      isInitialized: false,
      setIsInitialized: (isInitialized) => set({ isInitialized }),
      receivedNotifications: [],
      addReceivedNotification: (notification) => {
        const current = get().receivedNotifications;
        // Check if notification already exists (by id or by identifier + timestamp within 5 seconds)
        const exists = current.some((notif) => {
          if (notif.id === notification.id) return true;
          // Also check if same identifier exists (to prevent duplicates from received + response listeners)
          const notifTime = new Date(notif.receivedAt).getTime();
          const newTime = new Date(notification.receivedAt).getTime();
          const timeDiff = Math.abs(newTime - notifTime);
          // If same identifier and received within 5 seconds, consider it duplicate
          if (notif.data?.identifier === notification.data?.identifier && timeDiff < 5000) {
            return true;
          }
          return false;
        });
        
        if (!exists) {
          // Add to beginning and limit to last 100 notifications
          const updated = [notification, ...current].slice(0, 100);
          set({ receivedNotifications: updated });
        }
      },
      clearReceivedNotifications: () => set({ receivedNotifications: [] }),
      getRecentNotifications: (days = 30) => {
        const notifications = get().receivedNotifications;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return notifications.filter((notif) => {
          const receivedDate = new Date(notif.receivedAt);
          return receivedDate >= cutoffDate;
        });
      },
      removeDuplicates: () => {
        const notifications = get().receivedNotifications;
        const seen = new Set<string>();
        const unique: ReceivedNotification[] = [];
        
        for (const notif of notifications) {
          // Use id as primary key, or identifier from data if available
          const key = notif.id || notif.data?.identifier || `${notif.title}_${notif.body}_${notif.receivedAt}`;
          if (!seen.has(key)) {
            seen.add(key);
            unique.push(notif);
          }
        }
        
        set({ receivedNotifications: unique });
      },
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);



