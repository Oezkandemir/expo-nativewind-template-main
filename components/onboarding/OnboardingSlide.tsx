import { View, Image, Animated, Easing } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useEffect, useRef } from 'react';
import Svg, { Circle } from 'react-native-svg';
import { X } from 'lucide-react-native';

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
  const fadeAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;
  const slideAnim = useRef(new Animated.Value(isActive ? 0 : 30)).current;
  const imageScaleAnim = useRef(new Animated.Value(isActive ? 1 : 0.9)).current;

  useEffect(() => {
    if (isActive) {
      // Stop any existing animations first
      fadeAnim.stopAnimation();
      slideAnim.stopAnimation();
      imageScaleAnim.stopAnimation();
      
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
      fadeAnim.stopAnimation();
      slideAnim.stopAnimation();
      imageScaleAnim.stopAnimation();
      
      fadeAnim.setValue(0);
      slideAnim.setValue(30);
      imageScaleAnim.setValue(0.9);
    }
  }, [isActive, fadeAnim, slideAnim, imageScaleAnim]);

  // App Icon in Circle Component
  const AppIconInCircle = ({ size = 280 }: { size?: number }) => {
    const iconSize = size * 0.65; // Icon ist 65% der Circle-Größe
    const xIconSize = size * 0.4; // X Icon Größe (ähnlich wie im Logo)
    const circleRadius = size / 2;
    
    // Animation values for circles
    const circle1Opacity = useRef(new Animated.Value(0)).current;
    const circle2Opacity = useRef(new Animated.Value(0)).current;
    const circle3Opacity = useRef(new Animated.Value(0)).current;
    const circle1Scale = useRef(new Animated.Value(0.8)).current;
    const circle2Scale = useRef(new Animated.Value(0.8)).current;
    const circle3Scale = useRef(new Animated.Value(0.8)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
      if (!isActive) {
        // Reset values when not active
        circle1Opacity.setValue(0);
        circle2Opacity.setValue(0);
        circle3Opacity.setValue(0);
        circle1Scale.setValue(0.8);
        circle2Scale.setValue(0.8);
        circle3Scale.setValue(0.8);
        pulseAnim.setValue(1);
        glowAnim.setValue(0.5);
        return;
      }

      // Stop any existing animations first to prevent conflicts
      circle1Opacity.stopAnimation();
      circle2Opacity.stopAnimation();
      circle3Opacity.stopAnimation();
      circle1Scale.stopAnimation();
      circle2Scale.stopAnimation();
      circle3Scale.stopAnimation();
      pulseAnim.stopAnimation();
      glowAnim.stopAnimation();

      // Reset values before starting new animations
      circle1Opacity.setValue(0);
      circle2Opacity.setValue(0);
      circle3Opacity.setValue(0);
      circle1Scale.setValue(0.8);
      circle2Scale.setValue(0.8);
      circle3Scale.setValue(0.8);
      pulseAnim.setValue(1);
      glowAnim.setValue(0.5);

      // Staggered fade-in and scale animation for circles
      const circleAnimation = Animated.sequence([
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
      ]);
      circleAnimation.start();

      // Pulsing animation for X letter - smoother and more modern
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      // Glow animation for X letter
      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false, // opacity needs false for shadow
          }),
          Animated.timing(glowAnim, {
            toValue: 0.5,
            duration: 1200,
            easing: Easing.in(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      );
      glowAnimation.start();

      // Cleanup function to stop animations when component unmounts or isActive changes
      return () => {
        circleAnimation.stop();
        pulseAnimation.stop();
        glowAnimation.stop();
      };
    }, [isActive, circle1Opacity, circle2Opacity, circle3Opacity, circle1Scale, circle2Scale, circle3Scale, pulseAnim, glowAnim]);

    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        {/* Animated SVG Container (no rotation) */}
        <Animated.View 
          style={{
            position: 'absolute',
            width: size,
            height: size,
          }}
        >
          {/* Circle 1 - Outer */}
          <Animated.View
            style={{
              position: 'absolute',
              width: size,
              height: size,
              opacity: circle1Opacity,
              transform: [{ scale: circle1Scale }],
            }}
          >
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              <Circle 
                cx={circleRadius} 
                cy={circleRadius} 
                r={circleRadius - 2} 
                fill="rgba(15, 23, 42, 0.9)" 
                stroke="rgba(239, 68, 68, 0.1)"
                strokeWidth="2"
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
              transform: [{ scale: circle2Scale }],
            }}
          >
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              <Circle 
                cx={circleRadius} 
                cy={circleRadius} 
                r={circleRadius - 15} 
                fill="rgba(15, 23, 42, 0.7)" 
                stroke="rgba(239, 68, 68, 0.08)"
                strokeWidth="1.5"
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
              transform: [{ scale: circle3Scale }],
            }}
          >
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              <Circle 
                cx={circleRadius} 
                cy={circleRadius} 
                r={circleRadius - 25} 
                fill="rgba(15, 23, 42, 0.5)" 
                stroke="rgba(239, 68, 68, 0.05)"
                strokeWidth="1"
              />
            </Svg>
          </Animated.View>
        </Animated.View>

        {/* X Letter - Modern pulsing animation with glow */}
        <Animated.View 
          style={{
            position: 'absolute',
            width: iconSize,
            height: iconSize,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: glowAnim,
          }}
        >
          <Animated.View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ scale: pulseAnim }],
              shadowColor: '#EF4444',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 20,
              elevation: 20,
            }}
          >
            <Text style={{ 
              fontSize: xIconSize, 
              fontWeight: '800', 
              color: '#EF4444',
              lineHeight: xIconSize,
              textShadowColor: 'rgba(239, 68, 68, 0.8)',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 15,
              letterSpacing: -2,
            }}>
              X
            </Text>
          </Animated.View>
        </Animated.View>
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
            variant="outline"
            onPress={onNext} 
            className={showBack ? 'flex-1' : 'w-full'}
            style={{ borderRadius: 12, minHeight: 52, borderColor: 'rgba(139, 92, 246, 0.5)', backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
          >
            <Text className="text-white font-semibold" style={{ fontSize: 16, fontWeight: '600' }}>Weiter</Text>
          </Button>
        </View>
      </Animated.View>
    </View>
  );
}


