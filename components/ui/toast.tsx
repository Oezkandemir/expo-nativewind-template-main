import * as React from 'react';
import { View, Animated, Platform } from 'react-native';
import { Text } from './text';
import { cn } from './utils/cn';
import { XCircle, Info, AlertCircle, ThumbsUp } from 'lucide-react-native';
import { iconWithClassName } from './lib/icons/icon-with-classname';

const XCircleIcon = iconWithClassName(XCircle);
const InfoIcon = iconWithClassName(Info);
const AlertCircleIcon = iconWithClassName(AlertCircle);
const ThumbsUpIcon = iconWithClassName(ThumbsUp);

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const fadeAnim = React.useRef<{ [key: string]: Animated.Value }>({});

  const dismissToast = React.useCallback((id: string) => {
    if (fadeAnim.current[id]) {
      Animated.timing(fadeAnim.current[id], {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
        delete fadeAnim.current[id];
      });
    }
  }, []);

  const showToast = React.useCallback(
    (message: string, type: ToastType = 'success', duration: number = 3000) => {
      const id = Math.random().toString(36).substring(7);
      const newToast: Toast = { id, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      // Animate in
      fadeAnim.current[id] = new Animated.Value(0);
      Animated.spring(fadeAnim.current[id], {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();

      // Auto dismiss
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    },
    [dismissToast]
  );

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <ThumbsUpIcon className="h-12 w-12 text-green-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircleIcon className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <InfoIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <ThumbsUpIcon className="h-12 w-12 text-green-500" />;
    }
  };

  const getBackgroundColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/20';
      case 'error':
        return 'bg-red-500/10 border-red-500/20';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/20';
      default:
        return 'bg-green-500/10 border-green-500/20';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View
        className="absolute top-12 left-0 right-0 px-4 z-50 pointer-events-none"
        style={{ pointerEvents: 'box-none' }}
      >
        {toasts.map((toast) => {
          const animatedStyle = fadeAnim.current[toast.id]
            ? {
                opacity: fadeAnim.current[toast.id],
                transform: [
                  {
                    translateY: fadeAnim.current[toast.id].interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    }),
                  },
                ],
              }
            : {};

          const isSuccessToast = toast.type === 'success';

          return (
            <Animated.View
              key={toast.id}
              style={[
                animatedStyle,
                {
                  pointerEvents: 'auto',
                },
              ]}
              className={cn(
                'mb-3',
                isSuccessToast ? 'ml-auto mr-4 w-5/6 max-w-lg' : 'mx-auto w-full max-w-md',
                Platform.select({
                  ios: 'shadow-lg shadow-foreground/25',
                  android: 'elevation-8',
                })
              )}
            >
              <View
                className={cn(
                  isSuccessToast 
                    ? 'items-center px-6 py-5 rounded-xl border' 
                    : 'flex-row items-center px-4 py-3 rounded-lg border',
                  'bg-background/95 backdrop-blur-sm',
                  getBackgroundColor(toast.type || 'success')
                )}
              >
                {isSuccessToast ? (
                  <>
                    {getIcon(toast.type || 'success')}
                    <Text className="mt-3 text-center text-foreground font-semibold text-xl">
                      {toast.message}
                    </Text>
                  </>
                ) : (
                  <>
                    {getIcon(toast.type || 'success')}
                    <Text className="ml-3 flex-1 text-foreground font-medium">
                      {toast.message}
                    </Text>
                  </>
                )}
              </View>
            </Animated.View>
          );
        })}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}


