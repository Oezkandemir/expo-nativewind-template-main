import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { Logo } from './logo';

interface SplashScreenProps {
  onFinish?: () => void;
  isLoading?: boolean; // New prop to control spinner animation
}

export function SplashScreen({ onFinish, isLoading = false }: SplashScreenProps) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Fade in immediately - smooth and fast
    opacity.value = withTiming(1, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });

    // Only call onFinish if not loading (when everything is ready)
    if (!isLoading && onFinish) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        onFinish?.();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [onFinish, opacity, isLoading]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, animatedStyle]}>
        <Logo size="large" showAnimation={true} variant="light" showSlogan={false} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Dark blue background matching app.json
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
