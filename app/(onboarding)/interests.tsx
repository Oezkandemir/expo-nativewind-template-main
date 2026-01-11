import { useState, useEffect, useRef } from 'react';
import { View, ScrollView, Pressable, Platform, Animated } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabaseAuthService } from '@/lib/supabase/auth-service';
import { useToast } from '@/components/ui/toast';

const INTEREST_CATEGORIES = [
  { id: 'tech', label: 'Technologie', icon: '💻', color: '#3B82F6' },
  { id: 'sports', label: 'Sport', icon: '⚽', color: '#10B981' },
  { id: 'fashion', label: 'Mode', icon: '👗', color: '#EC4899' },
  { id: 'food', label: 'Essen & Trinken', icon: '🍕', color: '#F59E0B' },
  { id: 'travel', label: 'Reisen', icon: '✈️', color: '#06B6D4' },
  { id: 'music', label: 'Musik', icon: '🎵', color: '#8B5CF6' },
  { id: 'gaming', label: 'Gaming', icon: '🎮', color: '#EF4444' },
  { id: 'fitness', label: 'Fitness & Gesundheit', icon: '💪', color: '#14B8A6' },
  { id: 'movies', label: 'Filme & Serien', icon: '🎬', color: '#6366F1' },
  { id: 'books', label: 'Bücher', icon: '📚', color: '#A855F7' },
  { id: 'art', label: 'Kunst & Design', icon: '🎨', color: '#F97316' },
  { id: 'cars', label: 'Autos', icon: '🚗', color: '#64748B' },
  { id: 'photography', label: 'Fotografie', icon: '📷', color: '#EC4899' },
  { id: 'cooking', label: 'Kochen', icon: '👨‍🍳', color: '#F59E0B' },
  { id: 'nature', label: 'Natur', icon: '🌲', color: '#10B981' },
  { id: 'pets', label: 'Haustiere', icon: '🐕', color: '#F97316' },
  { id: 'science', label: 'Wissenschaft', icon: '🔬', color: '#3B82F6' },
  { id: 'business', label: 'Business', icon: '💼', color: '#6366F1' },
];

interface InterestCardProps {
  category: typeof INTEREST_CATEGORIES[0];
  isSelected: boolean;
  onPress: () => void;
}

function InterestCard({ category, isSelected, onPress }: InterestCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for selected cards
  useEffect(() => {
    if (isSelected) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isSelected]);

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.92,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isSelected ? 1.02 : 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const androidRipple = Platform.select({
    android: {
      android_ripple: {
        color: isSelected ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.1)',
        borderless: false,
      },
    },
    default: {},
  });

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...androidRipple}
    >
      <Animated.View
        className="rounded-2xl p-4 justify-center items-center border-2"
        style={[
          {
            transform: [
              { scale: Animated.multiply(scaleAnim, pulseAnim) },
            ],
            opacity: opacityAnim,
            backgroundColor: isSelected ? category.color : `${category.color}15`,
            borderColor: isSelected ? category.color : `${category.color}50`,
            borderWidth: isSelected ? 3 : 2,
            minHeight: 95,
          },
          Platform.select({
            ios: {
              shadowColor: isSelected ? category.color : '#000',
              shadowOffset: { width: 0, height: isSelected ? 4 : 2 },
              shadowOpacity: isSelected ? 0.4 : 0.1,
              shadowRadius: isSelected ? 8 : 4,
            },
            android: {
              elevation: isSelected ? 8 : 3,
            },
          }),
        ]}
      >
        <View className="items-center justify-center gap-2">
          <Animated.View
            style={{
              transform: [{ scale: isSelected ? pulseAnim : 1 }],
            }}
          >
            <Text className="text-4xl">{category.icon}</Text>
          </Animated.View>
          <Text
            variant="small"
            className={`font-semibold text-center ${
              isSelected ? 'text-white' : 'text-foreground'
            }`}
            style={{ 
              color: isSelected ? '#FFFFFF' : undefined,
              fontSize: 11,
              lineHeight: 14,
            }}
            numberOfLines={2}
          >
            {category.label}
          </Text>
          {isSelected && (
            <Animated.View
              className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white items-center justify-center"
              style={{
                transform: [{ scale: pulseAnim }],
              }}
            >
              <Text className="text-[11px] font-bold" style={{ color: category.color }}>
                ✓
              </Text>
            </Animated.View>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

export default function InterestsScreen() {
  const { updateUser } = useAuth();
  const { showToast } = useToast();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleInterest = (interestId: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleNext = async () => {
    if (selectedInterests.length === 0) {
      showToast('Bitte wählen Sie mindestens ein Interesse aus', 'error', 3000);
      return;
    }

    setLoading(true);
    try {
      // Update user with selected interests
      await updateUser({
        interests: selectedInterests,
      });

      // Mark onboarding as complete
      await supabaseAuthService.setOnboardingComplete(true);

      showToast(`${selectedInterests.length} Interessen gespeichert!`, 'success', 2000);
      router.replace('/(onboarding)/complete');
    } catch (error) {
      console.error('Error saving interests:', error);
      showToast('Fehler beim Speichern der Interessen', 'error', 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-4 py-3">
        {/* Header Section */}
        <View className="mb-4">
          <Text variant="h2" className="mb-2 font-bold text-center">
            Ihre Interessen
          </Text>
          <Text variant="small" className="text-muted-foreground text-center mb-2">
            Wählen Sie Ihre Interessen für personalisierte Werbung
          </Text>
          {selectedInterests.length > 0 && (
            <View className="mt-2 px-4 py-2 rounded-full self-center bg-primary/10">
              <Text variant="small" className="text-primary font-semibold text-center text-xs">
                {selectedInterests.length} {selectedInterests.length === 1 ? 'Interesse' : 'Interessen'} ausgewählt
              </Text>
            </View>
          )}
        </View>

        {/* Scrollable Grid Layout - 3 columns */}
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row flex-wrap gap-2.5">
            {INTEREST_CATEGORIES.map((category) => (
              <View
                key={category.id}
                style={{ width: '31.5%' }}
              >
                <InterestCard
                  category={category}
                  isSelected={selectedInterests.includes(category.id)}
                  onPress={() => toggleInterest(category.id)}
                />
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Fixed Action Buttons at Bottom */}
        <View className="flex-row gap-2 pt-3 pb-4 bg-background">
          <Button variant="outline" onPress={handleBack} className="flex-1" disabled={loading}>
            <Text className="text-sm">Zurück</Text>
          </Button>
          <Button
            onPress={handleNext}
            className="flex-[2]"
            disabled={loading || selectedInterests.length === 0}
          >
            <Text className="text-sm">
              {loading ? 'Wird gespeichert...' : 'Fertig'}
            </Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
