import { Logo } from '@/components/ui/logo';
import { Text } from '@/components/ui/text';
import { useToast } from '@/components/ui/toast';
import { useAds } from '@/hooks/useAds';
import { useRewards } from '@/hooks/useRewards';
import { getCurrentActiveSlot } from '@/lib/ads/ad-scheduler';
import { USER_REWARD_PER_CAMPAIGN } from '@/lib/rewards/reward-calculator';
import { BlurView } from 'expo-blur';
import { router, useLocalSearchParams } from 'expo-router';
import { Sparkles, X } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, Dimensions, Easing, Image, Platform, Pressable, StatusBar, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AdViewScreen() {
  const params = useLocalSearchParams();
  const paramSlotId = params.slotId as string | undefined;
  const autoStart = params.autoStart === 'true';
  const fromNotification = params.fromNotification === 'true';
  const insets = useSafeAreaInsets();

  const { getAdForSlot, completeAdView, currentAd } = useAds();
  const { refreshSummary } = useRewards();
  const { showToast } = useToast();
  const [ad, setAd] = useState(currentAd);
  const [slotId, setSlotId] = useState<string | null>(paramSlotId || null);
  const [secondsRemaining, setSecondsRemaining] = useState(5);
  const [showCloseButton, setShowCloseButton] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [watchStartTime, setWatchStartTime] = useState<number | null>(null);
  const [closeButtonPosition, setCloseButtonPosition] = useState({ top: 0, right: 0 });
  const [isClosing, setIsClosing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showBlurOverlay, setShowBlurOverlay] = useState(false);
  const secondsRemainingRef = useRef(5);
  const executeCloseRef = useRef<(() => Promise<void>) | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Animation values - must be declared before any early returns
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const timerScaleAnim = useRef(new Animated.Value(1)).current;
  const closeButtonAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  
  // Success modal animations
  const modalFadeAnim = useRef(new Animated.Value(0)).current;
  const modalScaleAnim = useRef(new Animated.Value(0.5)).current;
  const modalIconScaleAnim = useRef(new Animated.Value(0)).current;
  const modalIconRotateAnim = useRef(new Animated.Value(0)).current;
  const blurOverlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadAd();
    // Smooth animate in on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramSlotId]);

  // Auto-start ad if coming from notification
  useEffect(() => {
    if (autoStart && ad && !isWatching) {
      // Small delay to ensure ad is loaded
      const timer = setTimeout(() => {
        handleStartWatching();
      }, 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ad, autoStart]);

  useEffect(() => {
    if (isWatching && secondsRemaining > 0) {
      // Animate progress bar
      const progress = (5 - secondsRemaining) / 5;
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();

      // Smooth pulse animation for timer
      Animated.sequence([
        Animated.timing(timerScaleAnim, {
          toValue: 1.15,
          duration: 150,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(timerScaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setInterval(() => {
        setSecondsRemaining((prev) => {
          const newValue = prev <= 1 ? 0 : prev - 1;
          secondsRemainingRef.current = newValue;
          
          // Show close button when 3 seconds remain (after 2 seconds have passed)
          if (prev === 3) {
            // Generate random position for close button
            const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
            const buttonSize = 48;
            const margin = 20;
            
            const maxTop = screenHeight - buttonSize - margin - 100;
            const maxRight = screenWidth - buttonSize - margin;
            
            const randomTop = Math.random() * maxTop + margin + 50;
            const randomRight = Math.random() * maxRight + margin;
            
            setCloseButtonPosition({
              top: randomTop,
              right: randomRight,
            });
            setShowCloseButton(true);
            
            // Animate close button in
            Animated.spring(closeButtonAnim, {
              toValue: 1,
              tension: 50,
              friction: 7,
              useNativeDriver: true,
            }).start();
          }
          
          // Stop timer at 0 but don't auto-close - user must click X to close
          // No automatic closing - user must manually click the X button
          if (newValue === 0 && timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
          
          return newValue;
        });
      }, 1000);
      
      timerIntervalRef.current = timer as any;

      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
      };
    }
  }, [isWatching, secondsRemaining, progressAnim, timerScaleAnim, closeButtonAnim, isClosing, executeCloseRef]);

  const loadAd = async () => {
    let targetSlotId = slotId;

    if (!targetSlotId) {
      // Try to get current active slot
      const activeSlot = getCurrentActiveSlot();
      if (!activeSlot) {
        showToast('Es ist aktuell kein Kampagnen-Zeitfenster aktiv', 'info', 3000);
        setTimeout(() => router.back(), 1000);
        return;
      }
      targetSlotId = activeSlot.id;
      setSlotId(targetSlotId);
    }

    const loadedAd = await getAdForSlot(targetSlotId);
    if (!loadedAd) {
      // No ad available - show message and go back
      showToast('Keine Kampagne verfügbar', 'info', 3000);
      setTimeout(() => router.back(), 1000);
      return;
    }
    setAd(loadedAd);
  };

  const handleStartWatching = () => {
    // Smooth transition to watching state
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 200,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setIsWatching(true);
      setWatchStartTime(Date.now());
      setSecondsRemaining(5);
    });
  };

  const executeClose = useCallback(async () => {
    if (!ad || !slotId) return;
    
    // Prevent multiple calls
    if (isClosing && secondsRemainingRef.current > 0) {
      return;
    }

    const watchDuration = watchStartTime ? (Date.now() - watchStartTime) / 1000 : 5;

    // Show blur overlay immediately to keep ad visible in background
    setShowBlurOverlay(true);
    blurOverlayAnim.setValue(0);
    
    // Animate blur overlay in quickly
    Animated.timing(blurOverlayAnim, {
      toValue: 1,
      duration: 150,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Complete ad view and show success immediately (no waiting for animations)
    (async () => {
      try {
        // Complete the ad view (this also records it)
        await completeAdView(slotId, ad.id, watchDuration);
        
        // Refresh rewards summary
        await refreshSummary();

        // Show success modal immediately
        setShowSuccessModal(true);
        
        // Reset and animate emoji in quickly
        modalFadeAnim.setValue(0);
        modalScaleAnim.setValue(0.3);
        modalIconScaleAnim.setValue(0);
        modalIconRotateAnim.setValue(0);
        
        // Start animations immediately with faster timing
        Animated.parallel([
          Animated.timing(modalFadeAnim, {
            toValue: 1,
            duration: 150,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.spring(modalScaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 5,
            useNativeDriver: true,
          }),
          Animated.parallel([
            Animated.spring(modalIconScaleAnim, {
              toValue: 1,
              tension: 60,
              friction: 3,
              useNativeDriver: true,
            }),
            Animated.timing(modalIconRotateAnim, {
              toValue: 1,
              duration: 200,
              easing: Easing.out(Easing.back(1.2)),
              useNativeDriver: true,
            }),
          ]),
        ]).start();

        // Close the app after showing the modal (2.5 seconds - faster)
        const closeDelay = fromNotification ? 3000 : 2500;
        setTimeout(() => {
          // Animate modal out quickly
          Animated.parallel([
            Animated.timing(modalFadeAnim, {
              toValue: 0,
              duration: 200,
              easing: Easing.in(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(modalScaleAnim, {
              toValue: 0.8,
              duration: 200,
              easing: Easing.in(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(blurOverlayAnim, {
              toValue: 0,
              duration: 200,
              easing: Easing.in(Easing.cubic),
              useNativeDriver: true,
            }),
          ]).start(() => {
            setShowSuccessModal(false);
            setShowBlurOverlay(false);
            // Only close the app if user came from a notification (app was closed)
            // If user was already in the app (test notifications), just navigate back
            if (fromNotification) {
              if (Platform.OS === 'android') {
                // On Android, exit the app only if opened from notification
                BackHandler.exitApp();
              } else {
                // On iOS, apps can't be programmatically closed
                // Instead, we'll just navigate back (iOS users can manually close)
                router.replace('/(tabs)');
              }
            } else {
              // User was already in the app, just navigate back
              router.replace('/(tabs)');
            }
          });
        }, closeDelay);
      } catch (error) {
        console.error('Complete ad view error:', error);
        showToast('Die Kampagne konnte nicht abgeschlossen werden', 'error', 3000);
        // Reset animations on error
        setShowBlurOverlay(false);
        blurOverlayAnim.setValue(0);
        fadeAnim.setValue(1);
        scaleAnim.setValue(1);
        slideAnim.setValue(0);
        setIsClosing(false);
      }
    })();
  }, [ad, slotId, watchStartTime, fromNotification, isClosing, completeAdView, refreshSummary, showToast, router, fadeAnim, scaleAnim, slideAnim, modalFadeAnim, modalScaleAnim, modalIconScaleAnim, modalIconRotateAnim, blurOverlayAnim]);

  // Store executeClose in ref so it can be accessed in timer
  useEffect(() => {
    executeCloseRef.current = executeClose;
  }, [executeClose]);

  const handleClose = async () => {
    if (!ad || !slotId || isClosing) return;

    // User can close anytime after the close button appears (from 3rd second onwards)
    // No need to wait - close immediately when X is clicked
    setIsClosing(true);
    executeClose();
  };

  // Update ref when secondsRemaining changes
  useEffect(() => {
    secondsRemainingRef.current = secondsRemaining;
  }, [secondsRemaining]);

  // Spin animation for loading state
  useEffect(() => {
    if (!ad) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [ad, spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Loading state with colorful animation
  if (!ad) {
    return (
      <View className="flex-1 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 items-center justify-center">
        <StatusBar hidden={true} />
        
        {/* SpotX Logo at top left */}
        <View 
          className="absolute left-6 z-10 items-center justify-center"
          style={{
            top: Math.max(insets.top, Platform.OS === 'ios' ? 20 : 0) + 12,
          }}
        >
          <Logo size="medium" showAnimation={false} variant="light" />
        </View>
        
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { rotate: spin }],
          }}
        >
          <View className="items-center">
            <View className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 items-center justify-center mb-6 shadow-2xl">
              <Sparkles size={40} color="#FFFFFF" />
            </View>
            <Text className="text-white text-2xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
              Lade Kampagne...
            </Text>
            <View className="flex-row gap-2 mt-4">
              <View className="w-2 h-2 rounded-full bg-purple-400" />
              <View className="w-2 h-2 rounded-full bg-pink-400" />
              <View className="w-2 h-2 rounded-full bg-blue-400" />
            </View>
          </View>
        </Animated.View>
      </View>
    );
  }

  // Pre-watching state (only shown if not auto-starting)
  if (!isWatching && !autoStart) {
    return (
      <Animated.View 
        className="flex-1 items-center justify-center px-6"
        style={{
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { translateY: slideAnim },
          ],
          backgroundColor: '#000000',
        }}
      >
        <StatusBar hidden={true} />
        
        {/* SpotX Logo at top left */}
        <View 
          className="absolute left-6 z-10 items-center justify-center"
          style={{
            top: Math.max(insets.top, Platform.OS === 'ios' ? 20 : 0) + 12,
          }}
        >
          <Logo size="medium" showAnimation={false} variant="light" />
        </View>
        
        {/* Animated background gradient */}
        <View 
          className="absolute inset-0"
          style={{
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
          }}
        />
        
        <Animated.View 
          className="items-center mb-8"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Text className="text-white text-3xl font-bold mb-4 text-center">
            {ad.title}
          </Text>
          <Text className="text-gray-400 text-lg mb-2 text-center">
            {ad.campaignName}
          </Text>
          <Animated.View 
            className="px-6 py-3 rounded-full mb-8"
            style={{
              transform: [{ scale: scaleAnim }],
              backgroundColor: 'rgba(139, 92, 246, 0.2)',
              borderWidth: 2,
              borderColor: 'rgba(168, 85, 247, 0.5)',
            }}
          >
            <View className="flex-row items-center gap-2">
              <Text className="text-2xl">💰</Text>
              <Text className="text-purple-300 text-xl font-bold">
                €{USER_REWARD_PER_CAMPAIGN.toFixed(2)} Belohnung
              </Text>
            </View>
          </Animated.View>
        </Animated.View>

        <Animated.View 
          className="w-full max-w-md mb-8"
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
          {ad.type === 'image' ? (
            <Image
              source={{ uri: ad.content }}
              className="w-full h-96 rounded-2xl shadow-2xl"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-96 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl items-center justify-center border border-gray-700 shadow-2xl">
              <Text className="text-white text-6xl mb-4">🎬</Text>
              <Text className="text-gray-400 text-lg">Video-Kampagne</Text>
            </View>
          )}
        </Animated.View>

        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Pressable
            onPress={handleStartWatching}
            className="w-full max-w-md rounded-xl overflow-hidden shadow-2xl"
          >
            <View 
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 px-8 py-4 items-center justify-center"
              style={{
                shadowColor: '#9333EA',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.5,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <Text className="text-white text-lg font-bold">🚀 Kampagne starten</Text>
            </View>
          </Pressable>
        </Animated.View>
      </Animated.View>
    );
  }

  // Watching state - Fullscreen immersive experience
  const isFinished = secondsRemaining === 0;
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View 
      className="flex-1 bg-black"
      style={{
        opacity: fadeAnim,
      }}
    >
      <StatusBar hidden={true} />
      
      {/* SpotX Logo at top left - aligned with timer */}
      <View 
        className="absolute left-6 z-10 items-center justify-center"
        style={{
          top: Math.max(insets.top, Platform.OS === 'ios' ? 20 : 0) + 12,
        }}
      >
        <Logo size="medium" showAnimation={false} variant="light" />
      </View>
      
      {/* Timer in top right corner - colorful and animated */}
      {!isFinished && (
        <Animated.View 
          className="absolute right-6 z-20"
          style={{
            top: Math.max(insets.top, Platform.OS === 'ios' ? 20 : 0) + 12,
            transform: [{ scale: timerScaleAnim }],
          }}
        >
          <View 
            className="w-20 h-20 rounded-full items-center justify-center shadow-2xl"
            style={{
              backgroundColor: secondsRemaining <= 2 
                ? 'rgba(239, 68, 68, 0.3)' 
                : secondsRemaining <= 3
                ? 'rgba(251, 146, 60, 0.3)'
                : 'rgba(59, 130, 246, 0.3)',
              borderWidth: 3,
              borderColor: secondsRemaining <= 2 
                ? 'rgba(239, 68, 68, 0.6)' 
                : secondsRemaining <= 3
                ? 'rgba(251, 146, 60, 0.6)'
                : 'rgba(59, 130, 246, 0.6)',
            }}
          >
            <Text 
              className="text-2xl font-bold"
              style={{
                color: secondsRemaining <= 2 
                  ? '#FCA5A5' 
                  : secondsRemaining <= 3
                  ? '#FCD34D'
                  : '#93C5FD',
              }}
            >
              {secondsRemaining}
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Close button - colorful with smooth animation */}
      {showCloseButton && (
        <Animated.View
          style={{
            position: 'absolute',
            top: closeButtonPosition.top,
            right: closeButtonPosition.right,
            zIndex: 30,
            opacity: closeButtonAnim,
            transform: [
              { scale: closeButtonAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1.2],
                })
              },
              { rotate: closeButtonAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['-180deg', '0deg'],
                })
              },
            ],
          }}
        >
          <Pressable
            onPress={handleClose}
            className="w-16 h-16 rounded-full items-center justify-center shadow-2xl"
            style={{
              backgroundColor: 'rgba(34, 197, 94, 0.3)',
              borderWidth: 3,
              borderColor: 'rgba(34, 197, 94, 0.8)',
              shadowColor: '#22C55E',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.6,
              shadowRadius: 12,
              elevation: 12,
            }}
          >
            <X size={32} color="#22C55E" strokeWidth={3} />
          </Pressable>
        </Animated.View>
      )}

      {/* Animated colorful Progress bar at top */}
      <View className="absolute top-0 left-0 right-0 h-2 bg-black/30 z-10">
        <Animated.View 
          className="h-full"
          style={{ 
            width: progressWidth,
            backgroundColor: secondsRemaining <= 2 
              ? '#EF4444' 
              : secondsRemaining <= 3
              ? '#F97316'
              : '#3B82F6',
            shadowColor: secondsRemaining <= 2 
              ? '#EF4444' 
              : secondsRemaining <= 3
              ? '#F97316'
              : '#3B82F6',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 8,
          }}
        />
      </View>

      {/* Ad content - centered and fullscreen with animation */}
      <Animated.View 
        className="flex-1 items-center justify-center px-4"
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        {ad.type === 'image' ? (
          <Image
            source={{ uri: ad.content }}
            className="w-full h-full"
            resizeMode="contain"
          />
        ) : (
          <View className="w-full h-full items-center justify-center">
            {/* Animated background particles */}
            <View className="absolute inset-0 opacity-20">
              {[...Array(5)].map((_, i) => (
                <Animated.View
                  key={i}
                  className="absolute w-32 h-32 rounded-full"
                  style={{
                    backgroundColor: ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B'][i],
                    left: `${20 + i * 15}%`,
                    top: `${10 + i * 20}%`,
                    opacity: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.3],
                    }),
                    transform: [
                      { scale: scaleAnim },
                      { rotate: slideAnim.interpolate({
                          inputRange: [0, 50],
                          outputRange: ['0deg', '360deg'],
                        })
                      },
                    ],
                  }}
                />
              ))}
            </View>
            
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              <Text 
                className="text-5xl mb-6 font-bold text-center"
                style={{
                  color: '#FFFFFF',
                  textShadowColor: 'rgba(139, 92, 246, 0.8)',
                  textShadowOffset: { width: 0, height: 4 },
                  textShadowRadius: 12,
                }}
              >
                {ad.title}
              </Text>
            </Animated.View>
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              <Text className="text-purple-300 text-2xl mb-8 text-center font-semibold">
                {ad.campaignName}
              </Text>
            </Animated.View>
            <Animated.View 
              className="mt-8"
              style={{
                transform: [{ scale: scaleAnim }],
              }}
            >
              <Text className="text-white text-9xl">🎬</Text>
            </Animated.View>
          </View>
        )}
      </Animated.View>

      {/* Bottom info with colorful gradient */}
      <Animated.View 
        className="absolute bottom-0 left-0 right-0 p-6 pb-12"
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          borderTopWidth: 2,
          borderTopColor: showCloseButton ? '#22C55E' : '#3B82F6',
        }}
      >
        <Text className="text-white text-2xl font-bold text-center mb-2">
          {ad.title}
        </Text>
        <Text className="text-gray-300 text-center text-lg">
          {ad.campaignName}
        </Text>
        {!showCloseButton && (
          <View className="mt-4 items-center">
            <View className="flex-row items-center gap-3">
              <Animated.View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#3B82F6',
                  transform: [{ scale: timerScaleAnim }],
                }}
              />
              <Text className="text-blue-300 text-sm font-medium">Kampagne wird abgespielt...</Text>
            </View>
          </View>
        )}
      </Animated.View>

      {/* Blur Overlay - zeigt die Werbung im Hintergrund mit starkem Blur */}
      {showBlurOverlay && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: blurOverlayAnim,
            zIndex: 5000,
            elevation: 5000,
          }}
          pointerEvents="none"
        >
          {/* Ad content im Hintergrund - sehr stark verblasst */}
          <View style={{ flex: 1, opacity: 0.05 }}>
            {ad.type === 'image' ? (
              <Image
                source={{ uri: ad.content }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full items-center justify-center bg-black">
                <Text className="text-white text-9xl">🎬</Text>
              </View>
            )}
          </View>
          
          {/* Mehrfacher Blur-Layer für stärkeren Effekt */}
          <BlurView
            intensity={100}
            tint="dark"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
          
          {/* Zusätzlicher Blur-Layer */}
          <BlurView
            intensity={100}
            tint="dark"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
          
          {/* Dunkler Overlay für zusätzliche Abschattung */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
            }}
          />
        </Animated.View>
      )}

      {/* Success Modal - zeigt Belohnung und Erfolgsmeldung */}
      {showSuccessModal && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10000,
            elevation: 10000,
          }}
          pointerEvents="none"
        >
          <Animated.View
            style={{
              flex: 1,
              opacity: modalFadeAnim,
              alignItems: 'center',
              justifyContent: 'flex-start',
              paddingTop: Math.max(insets.top + 150, 180),
              paddingBottom: Math.max(insets.bottom, 60),
              paddingHorizontal: 20,
              overflow: 'visible',
            }}
          >
            {/* Container für gesamten Content - mit sehr viel mehr Platz oben */}
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'flex-start',
                width: '100%',
                flex: 1,
                minHeight: 0,
                overflow: 'visible',
              }}
            >
              {/* Daumen-hoch Emoji - mit sehr viel mehr Platz oben */}
              <Animated.View
                style={{
                  transform: [
                    { 
                      scale: modalIconScaleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      })
                    },
                    {
                      rotate: modalIconRotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['-180deg', '0deg'],
                      }),
                    },
                  ],
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 25,
                  marginTop: 120,
                  paddingTop: 40,
                  overflow: 'visible',
                }}
              >
                <Text 
                  style={{ 
                    fontSize: 160, 
                    textAlign: 'center',
                    includeFontPadding: false,
                    textAlignVertical: 'center',
                    lineHeight: 200,
                    paddingTop: 20,
                    paddingBottom: 0,
                  }}
                >
                  👍
                </Text>
              </Animated.View>
              
              {/* Erfolgsmeldung - zentriert mit genug Platz */}
              <Animated.View
                style={{
                  opacity: modalFadeAnim,
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  flexShrink: 1,
                }}
              >
                <Text 
                  style={{ 
                    fontSize: 36,
                    fontWeight: 'bold',
                    color: '#FFFFFF',
                    textAlign: 'center',
                    marginBottom: 20,
                    textShadowColor: 'rgba(0, 0, 0, 0.8)',
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 8,
                    paddingHorizontal: 10,
                    lineHeight: 44,
                  }}
                >
                  Alles geklappt!
                </Text>
                <View
                  style={{
                    backgroundColor: 'rgba(34, 197, 94, 0.25)',
                    borderWidth: 3,
                    borderColor: 'rgba(34, 197, 94, 0.7)',
                    borderRadius: 24,
                    paddingHorizontal: 28,
                    paddingVertical: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    maxWidth: 380,
                  }}
                >
                  <Text 
                    style={{ 
                      fontSize: 30,
                      fontWeight: 'bold',
                      color: '#22C55E',
                      textAlign: 'center',
                      lineHeight: 36,
                    }}
                  >
                    €{USER_REWARD_PER_CAMPAIGN.toFixed(2)} Belohnung
                  </Text>
                  <Text 
                    style={{ 
                      fontSize: 18,
                      color: '#D1D5DB',
                      textAlign: 'center',
                      marginTop: 10,
                      lineHeight: 24,
                    }}
                  >
                    wurde gutgeschrieben
                  </Text>
                </View>
              </Animated.View>
            </View>
          </Animated.View>
        </View>
      )}
    </Animated.View>
  );
}

