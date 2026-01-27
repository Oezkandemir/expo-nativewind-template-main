import { useState, useRef, useEffect } from 'react';
import { View, ScrollView, Pressable, Keyboard, Platform, TextInput } from 'react-native';
import { router, Link } from 'expo-router';
import Animated, { FadeInDown, FadeIn, SlideInDown } from 'react-native-reanimated';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { KeyboardAvoidingView } from '@/components/ui/keyboard-avoiding-view';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/useAuth';
import { supabaseAuthService } from '@/lib/supabase/auth-service';
import { useToast } from '@/components/ui/toast';
import { Logo } from '@/components/ui/logo';
import { useKeyboard } from '@/hooks/useKeyboard';

export default function LoginScreen() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const { keyboardVisible } = useKeyboard();
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Refs for input fields to enable navigation between them
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Focus password field when step changes to password
  useEffect(() => {
    if (step === 'password') {
      // Small delay to ensure animation has started
      setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 200);
    }
  }, [step]);

  const handleEmailNext = () => {
    if (!formData.email.trim()) {
      showToast('Bitte geben Sie Ihre E-Mail-Adresse ein', 'error', 3000);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      showToast('Bitte geben Sie eine gültige E-Mail-Adresse ein', 'error', 3000);
      return;
    }

    // Move to password step
    setStep('password');
    Keyboard.dismiss();
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      showToast('Bitte füllen Sie alle Felder aus', 'error', 3000);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast('Bitte geben Sie eine gültige E-Mail-Adresse ein', 'error', 3000);
      return;
    }

    setLoading(true);
    try {
      const result = await login(formData.email, formData.password, rememberMe);

      if (!result.success) {
        showToast(result.error || 'Anmeldung fehlgeschlagen', 'error', 3000);
        return;
      }

      showToast('✓ Erfolgreich angemeldet', 'success', 2000);

      // Check if onboarding is complete
      const onboardingComplete = await supabaseAuthService.isOnboardingComplete();
      if (!onboardingComplete) {
        router.replace('/(onboarding)/welcome');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.', 'error', 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F1F5F9' }}>
      <SafeAreaView className="flex-1" style={{ backgroundColor: '#F1F5F9' }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          autoOffset={true}
          style={{ flex: 1 }}
        >
          <ScrollView 
            ref={scrollViewRef}
            className="flex-1" 
            contentContainerStyle={{ 
              paddingHorizontal: 24, 
              paddingTop: 40, 
              paddingBottom: keyboardVisible ? 20 : 40,
              flexGrow: 1,
              justifyContent: 'center'
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            style={{ backgroundColor: '#F1F5F9' }}
          >
            {/* SpotX Logo - Top Center */}
            <Animated.View 
              entering={FadeIn.duration(400)}
              className="mb-10 items-center"
            >
              <Logo size="large" showAnimation={true} variant="auto" />
            </Animated.View>

            {/* Welcome Text */}
            <Animated.View 
              entering={FadeInDown.delay(200).duration(400)}
              className="mb-8 items-center"
            >
              <Text variant="h2" className="text-center text-foreground mb-2">
                Willkommen zurück
              </Text>
              <Text variant="p" className="text-center text-muted-foreground">
                Melden Sie sich an, um fortzufahren
              </Text>
            </Animated.View>

            {/* Form Card */}
            <Animated.View entering={FadeInDown.delay(300).duration(400)}>
              <Card className="shadow-lg border-0" style={{ backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8, minHeight: step === 'email' ? 200 : 400 }}>
                <CardContent className="gap-6 pt-6 pb-6">
                  {/* Email Field - Always visible */}
                  <View>
                    <Label>
                      <Text>E-Mail</Text>
                    </Label>
                    <Input
                      ref={emailInputRef}
                      placeholder="ihre.email@example.com"
                      value={formData.email}
                      onChangeText={(text) => setFormData({ ...formData, email: text.trim() })}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      spellCheck={false}
                      autoComplete="email"
                      textContentType="emailAddress"
                      returnKeyType={step === 'email' ? 'done' : 'next'}
                      blurOnSubmit={false}
                      onSubmitEditing={() => {
                        if (step === 'email') {
                          handleEmailNext();
                        } else {
                          passwordInputRef.current?.focus();
                        }
                      }}
                      className="mt-2"
                      editable={!loading}
                    />
                  </View>

                  {/* Password Field - Only visible when step is 'password' */}
                  {step === 'password' && (
                    <Animated.View entering={SlideInDown.duration(350).springify()}>
                      <View>
                        <Label>
                          <Text>Passwort</Text>
                        </Label>
                        <Input
                          ref={passwordInputRef}
                          placeholder="Ihr Passwort"
                          value={formData.password}
                          onChangeText={(text) => setFormData({ ...formData, password: text })}
                          secureTextEntry
                          autoCapitalize="none"
                          autoCorrect={false}
                          spellCheck={false}
                          autoComplete="password"
                          textContentType="password"
                          returnKeyType="done"
                          blurOnSubmit={true}
                          onSubmitEditing={() => {
                            Keyboard.dismiss();
                            if (!loading && formData.email && formData.password) {
                              handleLogin();
                            }
                          }}
                          className="mt-2"
                          editable={!loading}
                        />
                      </View>
                    </Animated.View>
                  )}

                  {/* Remember Me - Only visible when step is 'password' */}
                  {step === 'password' && (
                    <Animated.View entering={SlideInDown.delay(100).duration(350).springify()}>
                      <View className="flex-row items-center">
                        <Checkbox
                          checked={rememberMe}
                          onCheckedChange={setRememberMe}
                          accessibilityLabel="Login merken"
                          disabled={loading}
                        />
                        <Pressable
                          onPress={() => {
                            if (!loading) {
                              setRememberMe(!rememberMe);
                            }
                          }}
                          className="ml-2 flex-1"
                          disabled={loading}
                        >
                          <Text variant="small" className="text-foreground">
                            Login merken
                          </Text>
                        </Pressable>
                      </View>
                    </Animated.View>
                  )}

                  {/* Action Buttons */}
                  {step === 'email' ? (
                    <Button
                      onPress={handleEmailNext}
                      className="w-full mt-2"
                      disabled={loading || !formData.email.trim()}
                    >
                      <Text>Weiter</Text>
                    </Button>
                  ) : (
                    <Animated.View entering={SlideInDown.delay(150).duration(350).springify()}>
                      <View className="gap-3">
                        <Button
                          onPress={handleLogin}
                          className="w-full"
                          disabled={loading || !formData.email || !formData.password}
                        >
                          {loading ? (
                            <View className="flex-row items-center gap-2">
                              <Spinner size="small" color="#FFFFFF" />
                              <Text>Wird angemeldet...</Text>
                            </View>
                          ) : (
                            <Text>Anmelden</Text>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onPress={() => {
                            setStep('email');
                            Keyboard.dismiss();
                          }}
                          className="w-full"
                          disabled={loading}
                        >
                          <Text>Zurück</Text>
                        </Button>
                      </View>
                    </Animated.View>
                  )}

                  {/* Register Link - Only visible when step is 'email' */}
                  {step === 'email' && (
                    <View className="mt-4 items-center gap-2">
                      <Text variant="small" className="text-muted-foreground">
                        Noch kein Konto?
                      </Text>
                      <Link href="/(auth)/register" asChild>
                        <Pressable disabled={loading}>
                          <Text variant="p" className="text-primary font-semibold">
                            Jetzt registrieren
                          </Text>
                        </Pressable>
                      </Link>
                    </View>
                  )}
                </CardContent>
              </Card>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}


