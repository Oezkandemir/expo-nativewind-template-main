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
        return <ThumbsUpIcon className="h-6 w-6 text-white" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-white" />;
      case 'warning':
        return <AlertCircleIcon className="h-5 w-5 text-white" />;
      case 'info':
        return <InfoIcon className="h-5 w-5 text-white" />;
      default:
        return <ThumbsUpIcon className="h-6 w-6 text-white" />;
    }
  };

  const getBackgroundColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-green-600/95 border-green-400';
      case 'error':
        return 'bg-red-600/95 border-red-400';
      case 'warning':
        return 'bg-yellow-600/95 border-yellow-400';
      case 'info':
        return 'bg-blue-600/95 border-blue-400';
      default:
        return 'bg-green-600/95 border-green-400';
    }
  };

  const getTextColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'text-white';
      case 'error':
        return 'text-white';
      case 'warning':
        return 'text-white';
      case 'info':
        return 'text-white';
      default:
        return 'text-white';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View
        className="absolute bottom-24 left-0 right-0 px-4 z-50 pointer-events-none"
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
                      outputRange: [20, 0],
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
                'mx-auto w-[85%] max-w-xs',
                Platform.select({
                  ios: 'shadow-2xl shadow-black/40',
                  android: 'elevation-12',
                })
              )}
            >
              <View
                className={cn(
                  isSuccessToast 
                    ? 'items-center px-5 py-4 rounded-2xl border-2' 
                    : 'flex-row items-center px-4 py-4 rounded-xl border-2',
                  'min-h-[56px]',
                  getBackgroundColor(toast.type || 'success')
                )}
              >
                {isSuccessToast ? (
                  <>
                    {getIcon(toast.type || 'success')}
                    <Text 
                      className={cn(
                        'mt-2.5 text-center font-bold text-base leading-6',
                        getTextColor(toast.type || 'success')
                      )}
                      numberOfLines={3}
                    >
                      {toast.message}
                    </Text>
                  </>
                ) : (
                  <>
                    <View className="flex-shrink-0">
                      {getIcon(toast.type || 'success')}
                    </View>
                    <Text 
                      className={cn(
                        'ml-3 flex-1 font-bold text-sm leading-5',
                        getTextColor(toast.type || 'success')
                      )}
                      numberOfLines={2}
                    >
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


