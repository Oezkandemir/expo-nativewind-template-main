import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import * as SystemUI from 'expo-system-ui';

/**
 * StatusBar Utility Functions
 * 
 * Provides consistent StatusBar management across the app
 * for fullscreen, normal, and transparent modes.
 */

export type StatusBarMode = 'fullscreen' | 'normal' | 'transparent';

let currentMode: StatusBarMode = 'normal';

/**
 * Set StatusBar to fullscreen mode (hidden)
 * Use for immersive experiences like ad-view
 */
export async function setFullscreen(): Promise<void> {
  currentMode = 'fullscreen';
  
  if (Platform.OS === 'android') {
    // Android: Use SystemUI for immersive mode
    await SystemUI.setBackgroundColorAsync('#000000');
  }
  
  // StatusBar will be hidden via StatusBar component with hidden prop
}

/**
 * Set StatusBar to normal mode (visible with light content)
 * Use for standard screens with dark background
 */
export async function setNormal(): Promise<void> {
  currentMode = 'normal';
  
  if (Platform.OS === 'android') {
    await SystemUI.setBackgroundColorAsync('#0F172A');
  }
  
  // StatusBar will be shown via StatusBar component with style="light"
}

/**
 * Set StatusBar to transparent mode
 * Use for screens with custom header overlays
 */
export async function setTransparent(): Promise<void> {
  currentMode = 'transparent';
  
  if (Platform.OS === 'android') {
    await SystemUI.setBackgroundColorAsync('transparent');
  }
}

/**
 * Get current StatusBar mode
 */
export function getCurrentMode(): StatusBarMode {
  return currentMode;
}

/**
 * StatusBar component props based on mode
 */
export function getStatusBarProps(mode: StatusBarMode) {
  switch (mode) {
    case 'fullscreen':
      return {
        hidden: true,
        style: 'light' as const,
      };
    case 'transparent':
      return {
        hidden: false,
        style: 'light' as const,
        translucent: true,
      };
    case 'normal':
    default:
      return {
        hidden: false,
        style: 'light' as const,
      };
  }
}
