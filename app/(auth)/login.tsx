import { useState, useRef } from 'react';
import { View, ScrollView, Pressable, Keyboard, Platform, TextInput, TouchableWithoutFeedback } from 'react-native';
import { router, Link } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
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

export default function LoginScreen() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Refs for input fields to enable navigation between them
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{ flex: 1, backgroundColor: '#F1F5F9' }}>
        <SafeAreaView className="flex-1" style={{ backgroundColor: '#F1F5F9' }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            style={{ flex: 1 }}
          >
            <ScrollView 
              className="flex-1" 
              contentContainerStyle={{ 
                paddingHorizontal: 24, 
                paddingTop: 32, 
                paddingBottom: 32,
                flexGrow: 1,
                justifyContent: 'center'
              }}
              keyboardShouldPersistTaps="always"
              showsVerticalScrollIndicator={false}
              onScrollBeginDrag={Keyboard.dismiss}
              keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
              style={{ backgroundColor: '#F1F5F9' }}
            >
          {/* SpotX Logo - Top Center */}
          <Animated.View 
            entering={FadeIn.duration(400)}
            className="mb-12 items-center"
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
            <Card className="shadow-lg border-0" style={{ backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8 }}>
              <CardContent className="gap-5 pt-6">
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
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => {
                      passwordInputRef.current?.focus();
                    }}
                    className="mt-2"
                    editable={!loading}
                  />
                </View>

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
                    onSubmitEditing={handleLogin}
                    className="mt-2"
                    editable={!loading}
                  />
                </View>

                <View className="flex-row items-center mt-1">
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
                        Keyboard.dismiss();
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

                <Button
                  onPress={handleLogin}
                  className="w-full mt-4"
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

                <View className="mt-6 items-center gap-2">
                  <Text variant="small" className="text-muted-foreground">
                    Noch kein Konto?
                  </Text>
                  <Link href="/(auth)/register" asChild>
                    <Pressable 
                      onPress={Keyboard.dismiss}
                      disabled={loading}
                    >
                      <Text variant="p" className="text-primary font-semibold">
                        Jetzt registrieren
                      </Text>
                    </Pressable>
                  </Link>
                </View>
              </CardContent>
            </Card>
          </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  );
}


