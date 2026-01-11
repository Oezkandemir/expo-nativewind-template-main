import { View, Animated as RNAnimated } from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import { useEffect, useMemo, useRef } from 'react';

interface OnboardingPaginationProps {
  totalPages: number;
  currentPage: number;
}

export function OnboardingPagination({ totalPages, currentPage }: OnboardingPaginationProps) {
  // Create refs for animated values
  const scaleAnimsRef = useRef<RNAnimated.Value[]>([]);
  const opacityAnimsRef = useRef<RNAnimated.Value[]>([]);
  
  // Initialize arrays synchronously if they don't exist or if totalPages changed
  if (scaleAnimsRef.current.length !== totalPages) {
    scaleAnimsRef.current = Array.from({ length: totalPages }, (_, i) => 
      new RNAnimated.Value(i === currentPage ? 1.2 : 1)
    );
  }
  
  if (opacityAnimsRef.current.length !== totalPages) {
    opacityAnimsRef.current = Array.from({ length: totalPages }, (_, i) => 
      new RNAnimated.Value(i === currentPage ? 1 : 0.4)
    );
  }

  const scaleAnims = scaleAnimsRef.current;
  const opacityAnims = opacityAnimsRef.current;

  // Animate all dots when currentPage changes
  useEffect(() => {
    if (scaleAnims.length === 0 || opacityAnims.length === 0) return;
    
    scaleAnims.forEach((scaleAnim, index) => {
      const isActive = index === currentPage;
      RNAnimated.spring(scaleAnim, {
        toValue: isActive ? 1.2 : 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    });

    opacityAnims.forEach((opacityAnim, index) => {
      const isActive = index === currentPage;
      RNAnimated.timing(opacityAnim, {
        toValue: isActive ? 1 : 0.4,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const dots = useMemo(() => Array.from({ length: totalPages }, (_, i) => i), [totalPages]);

  return (
    <View className="flex-row items-center justify-center gap-2 py-4">
      {dots.map((index) => {
        const isActive = index === currentPage;
        return (
          <RNAnimated.View
            key={index}
            style={{
              transform: [{ scale: scaleAnims[index] }],
              opacity: opacityAnims[index],
            }}
          >
            <Svg width={12} height={12} viewBox="0 0 12 12">
              <Circle
                cx="6"
                cy="6"
                r="5"
                fill={isActive ? '#8B5CF6' : '#9CA3AF'}
              />
            </Svg>
          </RNAnimated.View>
        );
      })}
    </View>
  );
}

