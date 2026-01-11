import { View } from 'react-native';
import { Text } from '@/components/ui/text';

interface AdTimerProps {
  secondsRemaining: number;
  totalSeconds: number;
}

export function AdTimer({ secondsRemaining, totalSeconds }: AdTimerProps) {
  const progress = (totalSeconds - secondsRemaining) / totalSeconds;

  return (
    <View className="items-center justify-center mb-6">
      <View className="w-32 h-32 rounded-full border-4 border-primary items-center justify-center mb-4 relative">
        {/* Progress circle */}
        <View
          className="absolute inset-0 rounded-full"
          style={{
            borderColor: 'transparent',
            borderTopColor: '#4F46E5',
            borderWidth: 4,
            transform: [{ rotate: `${-90 + progress * 360}deg` }],
          }}
        />
        <Text variant="h1" className="text-primary">
          {secondsRemaining}
        </Text>
      </View>
      <Text variant="p" className="text-muted-foreground">
        Kampagne wird abgespielt...
      </Text>
    </View>
  );
}



