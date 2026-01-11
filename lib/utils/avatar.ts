/**
 * Avatar Utilities
 * 
 * Generates avatar URLs using RoboHash
 * RoboHash creates unique robot/monster avatars based on any string (like user ID)
 */

export type AvatarStyle = 'robots' | 'monsters' | 'heads' | 'cats';

interface AvatarOptions {
  size?: number;
  style?: AvatarStyle;
  background?: string;
}

/**
 * Get avatar URL for a user
 * Uses RoboHash to generate unique avatars based on user ID
 * 
 * @param userId - Unique user identifier
 * @param options - Avatar customization options
 * @returns URL to the generated avatar image
 */
export function getAvatarUrl(
  userId: string,
  options: AvatarOptions = {}
): string {
  const {
    size = 200,
    style = 'robots', // robots, monsters, heads, cats
    background = '',
  } = options;

  // RoboHash API: https://robohash.org/
  // Format: https://robohash.org/{identifier}?size={size}x{size}&set={style}&bgset={background}
  
  let url = `https://robohash.org/${encodeURIComponent(userId)}`;
  const params: string[] = [];

  // Size
  params.push(`size=${size}x${size}`);

  // Style sets:
  // set1 = robots (default)
  // set2 = monsters
  // set3 = robot heads
  // set4 = cats
  const setMap: Record<AvatarStyle, string> = {
    robots: 'set1',
    monsters: 'set2',
    heads: 'set3',
    cats: 'set4',
  };
  params.push(`set=${setMap[style]}`);

  // Background (optional)
  // bgset=bg1 (random gradient)
  // bgset=bg2 (solid colors)
  if (background) {
    params.push(`bgset=${background}`);
  }

  return `${url}?${params.join('&')}`;
}

/**
 * Get user's display name from full name
 * Returns first name or fallback
 */
export function getDisplayName(fullName?: string): string {
  if (!fullName) return 'Nutzer';
  const firstName = fullName.split(' ')[0];
  return firstName || fullName;
}

/**
 * Get initials from name for fallback display
 */
export function getInitials(name?: string): string {
  if (!name) return 'U';
  
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
