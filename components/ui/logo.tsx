import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { X } from 'lucide-react-native';
import { Text } from './text';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showAnimation?: boolean;
  className?: string;
  variant?: 'light' | 'dark' | 'auto'; // 'light' = white text, 'dark' = dark text, 'auto' = adapts to theme
}

const sizeMap = {
  small: { text: 20, icon: 28, gap: 4 }, // X is 40% larger than text
  medium: { text: 32, icon: 45, gap: 6 }, // X is 40% larger than text
  large: { text: 72, icon: 101, gap: 12 }, // X is 40% larger than text - bigger for splash screen
};

export function Logo({ size = 'medium', showAnimation = false, className, variant = 'auto' }: LogoProps) {
  const rotation = useSharedValue(0);
  const iconColor = '#EF4444'; // Red color for X icon

  // Ensure size is valid, fallback to 'medium' if not
  const validSize = typeof size === 'string' && size in sizeMap ? size : 'medium';
  const sizes = sizeMap[validSize];

  // Determine text color based on variant
  // 'auto' uses foreground color (adapts to theme), 'light' uses white, 'dark' uses dark
  const getTextColor = () => {
    if (variant === 'light') return '#FFFFFF';
    if (variant === 'dark') return '#0F172A';
    return undefined; // 'auto' - let NativeWind handle it with text-foreground
  };

  const textColor = getTextColor();
  const textClassName = variant === 'auto' ? 'text-foreground' : '';

  useEffect(() => {
    if (showAnimation) {
      // Rotate X icon once clockwise (360 degrees)
      rotation.value = withDelay(
        400,
        withTiming(360, {
          duration: 800,
          easing: Easing.out(Easing.cubic),
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAnimation]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  // Padding only for large size (splash screen), not for medium/small (header)
  const containerStyle = [
    styles.container,
    validSize === 'large' && {
      paddingHorizontal: 20,
      paddingTop: 30,
      paddingBottom: 30,
    },
    validSize !== 'large' && {
      paddingHorizontal: 4,
      paddingVertical: 0,
    },
  ];

  return (
    <View style={containerStyle} className={className}>
      <Text
        variant="h1"
        style={[
          styles.text,
          {
            fontSize: sizes.text,
            ...(textColor && { color: textColor }), // Only set color if variant is not 'auto'
            fontWeight: '700',
            // Add line height for large size to prevent clipping
            ...(validSize === 'large' && { lineHeight: sizes.text * 1.2 }),
            // Remove any margin/padding that could create gap
            marginRight: 0,
            paddingRight: 0,
          },
        ]}
        className={textClassName || (variant === 'light' ? 'text-white' : variant === 'dark' ? 'text-slate-900' : 'text-foreground')}
      >
        Spot
      </Text>
      <Animated.View style={[styles.iconWrapper, iconStyle]}>
        <X size={sizes.icon} strokeWidth={validSize === 'large' ? 4 : 3} color={iconColor} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible', // Ensure X is not clipped
    flexWrap: 'nowrap', // Prevent wrapping
    // Base container - padding will be set dynamically based on size
  },
  text: {
    letterSpacing: 0.5,
    // Base text styles - line height adjustments only for large size
  },
  iconWrapper: {
    marginLeft: 0, // No gap between text and X icon
    paddingVertical: 8, // Vertical padding to prevent clipping
    paddingLeft: 0, // No left padding - zero gap
    paddingRight: 8, // Right padding to prevent clipping
    overflow: 'visible', // Ensure X is not clipped
    justifyContent: 'center',
    alignItems: 'center',
  },
});
