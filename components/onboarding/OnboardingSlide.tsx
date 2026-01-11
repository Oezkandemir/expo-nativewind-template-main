import { View, Image, Animated } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useEffect, useRef } from 'react';

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

  return (
    <View className="flex-1 bg-background">
      {/* Image Section - Top Center */}
      <Animated.View
        className="flex-1 items-center justify-center px-6"
        style={{
          opacity: fadeAnim,
          transform: [{ scale: imageScaleAnim }],
        }}
      >
        <Image
          source={{ uri: image }}
          className="w-full max-w-sm h-96 rounded-3xl"
          resizeMode="cover"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
          }}
        />
      </Animated.View>

      {/* Text Section - Bottom */}
      <Animated.View
        className="px-6 pb-8"
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <Text variant="h1" className="text-center mb-4 font-bold">
          {title}
        </Text>
        <Text variant="p" className="text-center text-muted-foreground mb-8 text-lg leading-6">
          {description}
        </Text>

        {/* Navigation Buttons */}
        <View className="flex-row gap-3">
          {showBack && onBack && (
            <Button variant="outline" onPress={onBack} className="flex-1">
              <Text>Zurück</Text>
            </Button>
          )}
          <Button onPress={onNext} className={showBack ? 'flex-1' : 'w-full'}>
            <Text className="font-semibold">Weiter</Text>
          </Button>
        </View>
      </Animated.View>
    </View>
  );
}


