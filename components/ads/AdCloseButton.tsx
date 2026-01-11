import { View, Pressable } from 'react-native';
import { X } from 'lucide-react-native';

interface AdCloseButtonProps {
  onPress: () => void;
  visible: boolean;
}

export function AdCloseButton({ onPress, visible }: AdCloseButtonProps) {
  if (!visible) return null;

  return (
    <View className="absolute top-4 right-4">
      <Pressable
        onPress={onPress}
        className="w-12 h-12 rounded-full bg-background/90 border-2 border-primary items-center justify-center shadow-lg"
      >
        <X size={24} color="#4F46E5" />
      </Pressable>
    </View>
  );
}


