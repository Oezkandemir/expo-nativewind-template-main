import { View, Image } from 'react-native';
import { Ad } from '@/types/ad';
import { Text } from '@/components/ui/text';

interface AdPlayerProps {
  ad: Ad;
}

export function AdPlayer({ ad }: AdPlayerProps) {
  return (
    <View className="flex-1 items-center justify-center bg-muted rounded-lg p-4 mb-6">
      {ad.type === 'image' ? (
        <Image
          source={{ uri: ad.content }}
          className="w-full h-96 rounded-lg"
          resizeMode="contain"
        />
      ) : (
        <View className="w-full h-96 items-center justify-center bg-background rounded-lg">
          <Text variant="h3">{ad.title}</Text>
          <Text variant="p" className="text-muted-foreground mt-2">
            Video-Kampagne
          </Text>
        </View>
      )}
      <View className="mt-4">
        <Text variant="h4" className="text-center">
          {ad.title}
        </Text>
        <Text variant="small" className="text-muted-foreground text-center mt-1">
          {ad.campaignName}
        </Text>
      </View>
    </View>
  );
}



