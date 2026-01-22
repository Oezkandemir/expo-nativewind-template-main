import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Custom tab bar background for Android/Web with dark theme
// Extends fully to bottom edge - no visible safe area gap
export default function TabBarBackground() {
  const insets = useSafeAreaInsets();
  
  return (
    <View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: -insets.bottom, // Extend beyond bottom to cover safe area
          backgroundColor: '#0F172A',
          borderTopWidth: 1,
          borderTopColor: 'rgba(139, 92, 246, 0.2)',
        },
      ]}
    />
  );
}

export function useBottomTabOverflow() {
  return 0;
}
