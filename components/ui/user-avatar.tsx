import { View, Image, ImageStyle, ViewStyle } from 'react-native';
import { Text } from './text';
import { getAvatarUrl, getInitials, AvatarStyle } from '@/lib/utils/avatar';
import { useState } from 'react';

interface UserAvatarProps {
  userId: string;
  name?: string;
  size?: number;
  style?: AvatarStyle;
  customUrl?: string;
  className?: string;
  showBorder?: boolean;
  borderColor?: string;
}

/**
 * UserAvatar Component
 * 
 * Displays user avatar using RoboHash or custom URL
 * Falls back to initials if image fails to load
 */
export function UserAvatar({
  userId,
  name,
  size = 100,
  style = 'robots',
  customUrl,
  className,
  showBorder = true,
  borderColor = '#8B5CF6',
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);
  
  const avatarUrl = customUrl || getAvatarUrl(userId, { size: size * 2, style }); // 2x for retina
  const initials = getInitials(name);

  const containerStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    overflow: 'hidden',
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    ...(showBorder && {
      borderWidth: 3,
      borderColor: borderColor,
    }),
  };

  const imageStyle: ImageStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  // Show initials if image failed to load
  if (imageError) {
    return (
      <View style={containerStyle} className={className}>
        <Text
          style={{
            fontSize: size * 0.4,
            color: '#FFFFFF',
            fontWeight: 'bold',
          }}
        >
          {initials}
        </Text>
      </View>
    );
  }

  return (
    <View style={containerStyle} className={className}>
      <Image
        source={{ uri: avatarUrl }}
        style={imageStyle}
        onError={() => setImageError(true)}
        resizeMode="cover"
      />
    </View>
  );
}
