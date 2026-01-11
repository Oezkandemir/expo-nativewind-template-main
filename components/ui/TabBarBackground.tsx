import { View, StyleSheet } from 'react-native';

// Custom tab bar background for Android/Web with dark theme
export default function TabBarBackground() {
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
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
