import { View, Image, Animated, Easing } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useEffect, useRef } from 'react';
import Svg, { Circle } from 'react-native-svg';

interface OnboardingSlideProps {
  image: string;
  title: string;
  description: string;
  onNext: () => void;
  onBack?: () => void;
  showBack?: boolean;
  isActive?: boolean;
}

export function OnboardingSlide({
  image,
  title,
  description,
  onNext,
  onBack,
  showBack = false,
  isActive = true,
}: OnboardingSlideProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const imageScaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (isActive) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(imageScaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(30);
      imageScaleAnim.setValue(0.9);
    }
  }, [isActive, fadeAnim, slideAnim, imageScaleAnim]);

  // App Icon in Circle Component
  const AppIconInCircle = ({ size = 280 }: { size?: number }) => {
    const iconSize = size * 0.65; // Icon ist 65% der Circle-Größe
    const circleRadius = size / 2;
    
    // Animation values for circles
    const circle1Opacity = useRef(new Animated.Value(0)).current;
    const circle2Opacity = useRef(new Animated.Value(0)).current;
    const circle3Opacity = useRef(new Animated.Value(0)).current;
    const circle1Scale = useRef(new Animated.Value(0.8)).current;
    const circle2Scale = useRef(new Animated.Value(0.8)).current;
    const circle3Scale = useRef(new Animated.Value(0.8)).current;
    const rotationAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      if (isActive) {
        // Staggered fade-in and scale animation for circles
        Animated.sequence([
          Animated.parallel([
            Animated.timing(circle1Opacity, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.spring(circle1Scale, {
              toValue: 1,
              tension: 40,
              friction: 6,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(circle2Opacity, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.spring(circle2Scale, {
              toValue: 1,
              tension: 40,
              friction: 6,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(circle3Opacity, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.spring(circle3Scale, {
              toValue: 1,
              tension: 40,
              friction: 6,
              useNativeDriver: true,
            }),
          ]),
        ]).start();

        // Continuous slow rotation animation
        Animated.loop(
          Animated.timing(rotationAnim, {
            toValue: 1,
            duration: 30000, // 30 seconds for full rotation
            easing: Easing.linear,
            useNativeDriver: true,
          })
        ).start();

        // Pulsing animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.08,
              duration: 2500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 2500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        ).start();
      } else {
        // Reset animations when not active
        circle1Opacity.setValue(0);
        circle2Opacity.setValue(0);
        circle3Opacity.setValue(0);
        circle1Scale.setValue(0.8);
        circle2Scale.setValue(0.8);
        circle3Scale.setValue(0.8);
        rotationAnim.setValue(0);
        pulseAnim.setValue(1);
      }
    }, [isActive, circle1Opacity, circle2Opacity, circle3Opacity, circle1Scale, circle2Scale, circle3Scale, rotationAnim, pulseAnim]);

    // Rotation interpolation
    const rotateInterpolate = rotationAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    // Combined scale animations (initial scale * pulse)
    const circle1CombinedScale = Animated.multiply(circle1Scale, pulseAnim);
    const circle2CombinedScale = Animated.multiply(circle2Scale, pulseAnim);
    const circle3CombinedScale = Animated.multiply(circle3Scale, pulseAnim);
    
    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        {/* Animated SVG Container with rotation */}
        <Animated.View 
          style={{
            position: 'absolute',
            width: size,
            height: size,
            transform: [{ rotate: rotateInterpolate }],
          }}
        >
          {/* Circle 1 - Outer */}
          <Animated.View
            style={{
              position: 'absolute',
              width: size,
              height: size,
              opacity: circle1Opacity,
              transform: [{ scale: circle1CombinedScale }],
            }}
          >
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              <Circle 
                cx={circleRadius} 
                cy={circleRadius} 
                r={circleRadius - 2} 
                fill="rgba(139, 92, 246, 0.15)" 
              />
            </Svg>
          </Animated.View>

          {/* Circle 2 - Middle */}
          <Animated.View
            style={{
              position: 'absolute',
              width: size,
              height: size,
              opacity: circle2Opacity,
              transform: [{ scale: circle2CombinedScale }],
            }}
          >
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              <Circle 
                cx={circleRadius} 
                cy={circleRadius} 
                r={circleRadius - 15} 
                fill="rgba(139, 92, 246, 0.08)" 
              />
            </Svg>
          </Animated.View>

          {/* Circle 3 - Inner */}
          <Animated.View
            style={{
              position: 'absolute',
              width: size,
              height: size,
              opacity: circle3Opacity,
              transform: [{ scale: circle3CombinedScale }],
            }}
          >
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              <Circle 
                cx={circleRadius} 
                cy={circleRadius} 
                r={circleRadius - 25} 
                fill="rgba(139, 92, 246, 0.03)" 
              />
            </Svg>
          </Animated.View>
        </Animated.View>

        {/* App Icon Container - Static, no rotation */}
        <View 
          style={{
            position: 'absolute',
            width: iconSize,
            height: iconSize,
            borderRadius: iconSize / 2,
            overflow: 'hidden',
            backgroundColor: '#1E293B',
            borderWidth: 3,
            borderColor: 'rgba(139, 92, 246, 0.4)',
            shadowColor: '#8B5CF6',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <Image
            source={require('@/assets/images/iconbgremoved.png')}
            style={{
              width: '100%',
              height: '100%',
              resizeMode: 'cover',
            }}
          />
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: '#0F172A' }}>
      {/* App Icon in Circle Section - Top Center */}
      <Animated.View
        className="flex-1 items-center justify-center px-6"
        style={{
          opacity: fadeAnim,
          transform: [{ scale: imageScaleAnim }],
        }}
      >
        <AppIconInCircle size={280} />
      </Animated.View>

      {/* Text Section - Bottom */}
      <Animated.View
        className="px-6 pb-8"
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <Text variant="h1" className="text-center mb-4 font-bold text-white" style={{ fontSize: 32 }}>
          {title}
        </Text>
        <Text variant="p" className="text-center mb-8 text-lg leading-6" style={{ color: '#9CA3AF', fontSize: 16 }}>
          {description}
        </Text>

        {/* Navigation Buttons */}
        <View className="flex-row gap-3">
          {showBack && onBack && (
            <Button 
              variant="outline" 
              onPress={onBack} 
              className="flex-1"
              style={{ borderColor: 'rgba(139, 92, 246, 0.3)', backgroundColor: 'transparent' }}
            >
              <Text className="text-white">Zurück</Text>
            </Button>
          )}
          <Button 
            onPress={onNext} 
            className={showBack ? 'flex-1' : 'w-full'}
            style={{ borderRadius: 12, minHeight: 52 }}
          >
            <Text className="font-semibold" style={{ fontSize: 16, fontWeight: '600' }}>Weiter</Text>
          </Button>
        </View>
      </Animated.View>
    </View>
  );
}


