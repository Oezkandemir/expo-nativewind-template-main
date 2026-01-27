import { useState, useEffect } from 'react';
import { Keyboard, Platform, KeyboardEvent } from 'react-native';

interface UseKeyboardReturn {
  keyboardVisible: boolean;
  keyboardHeight: number;
}

/**
 * Hook to track keyboard visibility and height
 * Provides real-time keyboard state for better UX handling
 */
export function useKeyboard(): UseKeyboardReturn {
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    let keyboardWillShowListener: ReturnType<typeof Keyboard.addListener>;
    let keyboardWillHideListener: ReturnType<typeof Keyboard.addListener>;
    let keyboardDidShowListener: ReturnType<typeof Keyboard.addListener>;
    let keyboardDidHideListener: ReturnType<typeof Keyboard.addListener>;

    if (Platform.OS === 'ios') {
      // iOS: Use willShow/willHide for smoother animations
      keyboardWillShowListener = Keyboard.addListener(
        'keyboardWillShow',
        (e: KeyboardEvent) => {
          setKeyboardVisible(true);
          setKeyboardHeight(e.endCoordinates.height);
        }
      );

      keyboardWillHideListener = Keyboard.addListener(
        'keyboardWillHide',
        () => {
          setKeyboardVisible(false);
          setKeyboardHeight(0);
        }
      );
    } else {
      // Android: Use didShow/didHide
      keyboardDidShowListener = Keyboard.addListener(
        'keyboardDidShow',
        (e: KeyboardEvent) => {
          setKeyboardVisible(true);
          setKeyboardHeight(e.endCoordinates.height);
        }
      );

      keyboardDidHideListener = Keyboard.addListener(
        'keyboardDidHide',
        () => {
          setKeyboardVisible(false);
          setKeyboardHeight(0);
        }
      );
    }

    return () => {
      keyboardWillShowListener?.remove();
      keyboardWillHideListener?.remove();
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  return { keyboardVisible, keyboardHeight };
}
