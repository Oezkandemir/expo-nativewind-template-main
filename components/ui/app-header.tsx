import { router, usePathname } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { iconWithClassName } from './lib/icons/icon-with-classname';
import { Logo } from './logo';

const ChevronLeftIcon = iconWithClassName(ChevronLeft);

interface AppHeaderProps {
  showLogo?: boolean;
  className?: string;
}

export function AppHeader({ showLogo = true, className }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  
  // Check if we're on the home screen (index tab)
  // Home screen paths: /(tabs), /(tabs)/, /(tabs)/index
  const isHomeScreen = 
    pathname === '/(tabs)' || 
    pathname === '/(tabs)/' || 
    pathname === '/(tabs)/index' ||
    pathname === '/';
  
  // Show back button only when NOT on home screen
  const showBackButton = !isHomeScreen;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      // If can't go back, navigate to home
      router.replace('/(tabs)');
    }
  };

  if (!showLogo) {
    return null;
  }

  // Always use dark background to match Android
  const backgroundColor = '#0F172A';
  const borderBottomColor = 'rgba(139, 92, 246, 0.1)';

  return (
    <View
      className={className}
      style={[
        styles.container,
        {
          backgroundColor,
          borderBottomColor,
          paddingTop: insets.top, // Use actual safe area insets instead of hardcoded value
        },
      ]}
    >
      <View style={styles.headerContent}>
        {showBackButton && (
          <Pressable
            onPress={handleBack}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronLeftIcon className="w-6 h-6 text-white" />
          </Pressable>
        )}
        <View style={[styles.logoContainer, !showBackButton && styles.logoContainerCentered]}>
          <Logo size="medium" showAnimation={true} variant="light" showSlogan={true} />
        </View>
        {showBackButton && <View style={styles.backButtonPlaceholder} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: 12, // Compact bottom padding
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButtonPlaceholder: {
    width: 40,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainerCentered: {
    flex: 1,
  },
});
