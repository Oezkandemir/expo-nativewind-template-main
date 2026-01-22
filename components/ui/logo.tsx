import { X } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import { Text } from './text';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showAnimation?: boolean;
  className?: string;
  variant?: 'light' | 'dark' | 'auto'; // 'light' = white text, 'dark' = dark text, 'auto' = adapts to theme
}

const sizeMap = {
  small: { text: 20, icon: 28, gap: 4, slogan: 10 },
  medium: { text: 32, icon: 45, gap: 6, slogan: 12 },
  large: { text: 72, icon: 101, gap: 12, slogan: 24 },
};

export function Logo({ size = 'medium', showAnimation = false, className, variant = 'auto', showSlogan = false }: LogoProps & { showSlogan?: boolean }) {
  const rotation = useSharedValue(0);
  const iconColor = '#EF4444'; // Red color for X icon

  // Ensure size is valid, fallback to 'medium' if not
  const validSize = typeof size === 'string' && size in sizeMap ? size : 'medium';
  const sizes = sizeMap[validSize];

  // Determine text color based on variant
  const getTextColor = () => {
    if (variant === 'light') return '#FFFFFF';
    if (variant === 'dark') return '#0F172A';
    return undefined; // 'auto'
  };

  const textColor = getTextColor();
  const textClassName = variant === 'auto' ? 'text-foreground' : '';
  const sloganClassName = variant === 'auto' ? 'text-muted-foreground' : variant === 'light' ? 'text-white/80' : 'text-slate-600';

  useEffect(() => {
    if (showAnimation) {
      // Continuous rotation animation (spinner effect)
      rotation.value = withRepeat(
        withTiming(360, {
          duration: 1000,
          easing: Easing.linear,
        }),
        -1, // Infinite repeat
        false // Don't reverse
      );
    } else {
      // Reset rotation when animation is disabled
      rotation.value = 0;
    }
  }, [showAnimation, rotation]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

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
      <View style={styles.logoRow}>
        <Text
          variant="h1"
          style={[
            styles.text,
            {
              fontSize: sizes.text,
              ...(textColor && { color: textColor }),
              fontWeight: '700',
              ...(validSize === 'large' && { lineHeight: sizes.text * 1.2 }),
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
      {showSlogan && (
        <Text
          style={[
            styles.slogan,
            {
              fontSize: sizes.slogan,
              marginTop: validSize === 'large' ? 4 : 0,
              ...(textColor && { color: textColor }),
            }
          ]}
          className={sloganClassName}
        >
          Popular App
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    // flexDirection default is column, which works for stacking LogoRow and Slogan
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    flexWrap: 'nowrap',
  },
  text: {
    letterSpacing: 0.5,
  },
  slogan: {
    fontWeight: '500',
    letterSpacing: 1,
    opacity: 0.9,
  },
  iconWrapper: {
    marginLeft: 0,
    paddingVertical: 8,
    paddingLeft: 0,
    paddingRight: 8,
    overflow: 'visible',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
