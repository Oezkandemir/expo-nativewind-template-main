import { router } from 'expo-router';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { OnboardingSlide } from '@/components/onboarding/OnboardingSlide';

export default function WelcomeScreen() {
  const handleNext = () => {
    router.push('/(onboarding)/auth');
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <OnboardingSlide
        image="https://images.pexels.com/photos/3184436/pexels-photo-3184436.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&fit=crop"
        title="Willkommen bei SpotX"
        description="Die Plattform für wichtige Kampagnen. Unterstützen Sie Kampagnen und erhalten Sie Belohnungen für Ihre Teilnahme."
        onNext={handleNext}
        isActive={true}
      />
    </SafeAreaView>
  );
}
