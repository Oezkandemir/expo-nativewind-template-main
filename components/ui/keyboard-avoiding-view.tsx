import * as React from "react";
import { 
  KeyboardAvoidingView as RNKeyboardAvoidingView,
  type KeyboardAvoidingViewProps as RNKeyboardAvoidingViewProps,
  Platform
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cn } from "./utils/cn";

interface KeyboardAvoidingViewProps extends Omit<RNKeyboardAvoidingViewProps, "behavior" | "keyboardVerticalOffset"> {
  behavior?: RNKeyboardAvoidingViewProps["behavior"];
  keyboardVerticalOffset?: number;
  /**
   * Automatically calculate keyboardVerticalOffset based on safe area insets
   * Default: true for iOS, false for Android
   */
  autoOffset?: boolean;
}

const KeyboardAvoidingView = React.forwardRef<
  React.ElementRef<typeof RNKeyboardAvoidingView>,
  KeyboardAvoidingViewProps
>(({ className, behavior, keyboardVerticalOffset, autoOffset = Platform.OS === 'ios', ...props }, ref) => {
  const insets = useSafeAreaInsets();
  
  // Platform-specific behavior
  const defaultBehavior = behavior || Platform.select({
    ios: "padding",
    android: "height",
    default: "padding",
  });

  // Calculate keyboardVerticalOffset with safe area support
  const calculatedOffset = React.useMemo(() => {
    if (keyboardVerticalOffset !== undefined) {
      return keyboardVerticalOffset;
    }
    if (autoOffset && Platform.OS === 'ios') {
      // Add safe area top inset to account for notch/status bar
      return insets.top;
    }
    return 0;
  }, [keyboardVerticalOffset, autoOffset, insets.top]);

  return (
    <RNKeyboardAvoidingView
      ref={ref}
      behavior={defaultBehavior}
      keyboardVerticalOffset={calculatedOffset}
      className={cn("flex-1", className)}
      {...props}
    />
  );
});
KeyboardAvoidingView.displayName = "KeyboardAvoidingView";

export { KeyboardAvoidingView };
export type { KeyboardAvoidingViewProps };