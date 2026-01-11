import { useState } from 'react';
import { View, ScrollView, Pressable, Keyboard, Platform } from 'react-native';
import { router, Link } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { KeyboardAvoidingView } from '@/components/ui/keyboard-avoiding-view';
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
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          className="flex-1" 
          contentContainerClassName="px-6 py-8 justify-center min-h-full"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={Keyboard.dismiss}
        >
          <Animated.View 
            entering={FadeIn.duration(400)}
            className="mb-8 items-center"
          >
            <View className="mb-6">
              <Logo size="large" showAnimation={false} variant="auto" />
            </View>
            <Animated.View entering={FadeInDown.delay(200).duration(400)}>
              <Text variant="h2" className="text-center text-foreground mb-2">
                Willkommen zurück
              </Text>
              <Text variant="p" className="text-center text-muted-foreground">
                Melden Sie sich an, um fortzufahren
              </Text>
            </Animated.View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <Card>
              <CardHeader>
                <CardTitle>
                  <Text variant="h3" className="text-center">
                    Anmelden
                  </Text>
                </CardTitle>
              </CardHeader>
              <CardContent className="gap-4 mt-4">
                <View>
                  <Label>
                    <Text>E-Mail</Text>
                  </Label>
                  <Input
                    placeholder="ihre.email@example.com"
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text.trim() })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    textContentType="emailAddress"
                    returnKeyType="next"
                    blurOnSubmit={false}
                    className="mt-2"
                  />
                </View>

                <View>
                  <Label>
                    <Text>Passwort</Text>
                  </Label>
                  <Input
                    placeholder="Ihr Passwort"
                    value={formData.password}
                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                    secureTextEntry
                    autoComplete="password"
                    textContentType="password"
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                    className="mt-2"
                  />
                </View>

                <View className="flex-row items-center mt-2">
                  <Checkbox
                    checked={rememberMe}
                    onCheckedChange={setRememberMe}
                    accessibilityLabel="Login merken"
                  />
                  <Pressable
                    onPress={() => {
                      setRememberMe(!rememberMe);
                      Keyboard.dismiss();
                    }}
                    className="ml-2 flex-1"
                  >
                    <Text variant="small" className="text-foreground">
                      Login merken
                    </Text>
                  </Pressable>
                </View>

                <Button
                  onPress={handleLogin}
                  className="w-full mt-6"
                  disabled={loading || !formData.email || !formData.password}
                >
                  <Text>{loading ? 'Wird angemeldet...' : 'Anmelden'}</Text>
                </Button>

                <View className="mt-6 items-center">
                  <Text variant="small" className="text-muted-foreground">
                    Noch kein Konto?
                  </Text>
                  <Link href="/(auth)/register" asChild>
                    <Pressable 
                      className="mt-2"
                      onPress={Keyboard.dismiss}
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
  );
}


