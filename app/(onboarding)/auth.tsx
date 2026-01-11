import { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabaseAuthService } from '@/lib/supabase/auth-service';
import { useToast } from '@/components/ui/toast';
import { Logo } from '@/components/ui/logo';
import { Mail, AlertCircle } from 'lucide-react-native';
import { iconWithClassName } from '@/components/ui/lib/icons/icon-with-classname';

const MailIcon = iconWithClassName(Mail);
const AlertIcon = iconWithClassName(AlertCircle);

export default function AuthScreen() {
  const { register, login } = useAuth();
  const { showToast } = useToast();
  const [isSignUp, setIsSignUp] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showEmailSentMessage, setShowEmailSentMessage] = useState(false);

  const validateForm = () => {
    if (isSignUp) {
      // Sign up validation
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        showToast('Bitte füllen Sie alle Felder aus', 'error', 3000);
        return false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        showToast('Bitte geben Sie eine gültige E-Mail-Adresse ein', 'error', 3000);
        return false;
      }

      if (formData.password.length < 6) {
        showToast('Das Passwort muss mindestens 6 Zeichen lang sein', 'error', 3000);
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        showToast('Die Passwörter stimmen nicht überein', 'error', 3000);
        return false;
      }
    } else {
      // Login validation
      if (!formData.email || !formData.password) {
        showToast('Bitte E-Mail und Passwort eingeben', 'error', 3000);
        return false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        showToast('Bitte gültige E-Mail eingeben', 'error', 3000);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        // Register user with real Supabase - username will be derived from email prefix
        const result = await register(formData.email, formData.password);

        if (!result.success) {
          if (result.error?.includes('already registered') || result.error?.includes('already exists')) {
            showToast('Diese E-Mail-Adresse ist bereits registriert', 'error', 4000);
          } else {
            showToast(result.error || 'Registrierung fehlgeschlagen', 'error', 3000);
          }
          return;
        }

        // Show email confirmation message
        setShowEmailSentMessage(true);
        showToast('✓ Registrierung erfolgreich! Bitte bestätigen Sie Ihre E-Mail', 'success', 5000);
      } else {
        // Login
        const result = await login(formData.email, formData.password);

        if (!result.success) {
          showToast(result.error || 'Anmeldung fehlgeschlagen', 'error', 3000);
          return;
        }

        showToast('✓ Erfolgreich angemeldet!', 'success', 2000);

        // Check if onboarding is complete
        const onboardingComplete = await supabaseAuthService.isOnboardingComplete();
        if (!onboardingComplete) {
          // User hasn't completed onboarding, send to interests
          router.push('/(onboarding)/interests');
        } else {
          router.replace('/(tabs)');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      showToast('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.', 'error', 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      const result = await supabaseAuthService.resendConfirmationEmail(formData.email);
      
      if (result.success) {
        showToast('✓ Bestätigungs-Email wurde erneut gesendet', 'success', 3000);
      } else {
        showToast(result.error || 'Fehler beim Senden der Email', 'error', 3000);
      }
    } catch (error) {
      console.error('Resend email error:', error);
      showToast('Fehler beim Senden der Email', 'error', 3000);
    }
  };

  const handleBack = () => {
    router.back();
  };

  // Show email confirmation screen after registration
  if (showEmailSentMessage) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScrollView className="flex-1" contentContainerClassName="px-6 py-8 justify-center min-h-full">
          <View className="mb-8 items-center">
            <Logo size="large" />
          </View>

          <Card>
            <CardContent className="gap-4 py-8 items-center">
              <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4">
                <MailIcon className="w-8 h-8 text-primary" />
              </View>

              <Text variant="h2" className="text-center">
                Bestätigungs-E-Mail gesendet!
              </Text>

              <Text variant="p" className="text-center text-muted-foreground mt-2">
                Wir haben eine E-Mail an
              </Text>
              <Text variant="p" className="text-center font-semibold">
                {formData.email}
              </Text>
              <Text variant="p" className="text-center text-muted-foreground">
                gesendet. Bitte klicken Sie auf den Link in der E-Mail, um Ihr Konto zu bestätigen.
              </Text>

              <View className="mt-4 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <View className="flex-row items-start gap-2">
                  <AlertIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <Text variant="small" className="flex-1 text-amber-700 dark:text-amber-300">
                    Sie können sich erst anmelden, nachdem Sie Ihre E-Mail-Adresse bestätigt haben.
                  </Text>
                </View>
              </View>

              <View className="w-full gap-3 mt-6">
                <Button
                  variant="outline"
                  onPress={handleResendEmail}
                  className="w-full"
                >
                  <Text>Bestätigungs-Email erneut senden</Text>
                </Button>

                <Button
                  onPress={() => {
                    setShowEmailSentMessage(false);
                    setIsSignUp(false);
                    setFormData({ email: '', password: '', confirmPassword: '' });
                  }}
                  className="w-full"
                >
                  <Text>Zur Anmeldung</Text>
                </Button>
              </View>
            </CardContent>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
      <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerClassName="px-6 py-8 justify-center min-h-full">
        <View className="mb-8 items-center">
          <Logo size="large" />
          <Text variant="h1" className="text-center mt-4">
            SpotX
          </Text>
          <Text variant="p" className="text-center text-muted-foreground mt-2">
            {isSignUp ? 'Erstellen Sie Ihr Konto' : 'Willkommen zurück'}
          </Text>
        </View>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              <Text variant="h3" className="text-center">
                {isSignUp ? 'Registrieren' : 'Anmelden'}
              </Text>
            </CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
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
                className="mt-2"
              />
            </View>

            <View>
              <Label>
                <Text>Passwort</Text>
              </Label>
              <Input
                placeholder={isSignUp ? "Mindestens 6 Zeichen" : "Ihr Passwort"}
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                className="mt-2"
              />
              {isSignUp && (
                <Text variant="small" className="text-muted-foreground mt-1">
                  Mindestens 6 Zeichen
                </Text>
              )}
            </View>

            {isSignUp && (
              <View>
                <Label>
                  <Text>Passwort bestätigen</Text>
                </Label>
                <Input
                  placeholder="Passwort wiederholen"
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="mt-2"
                />
              </View>
            )}
          </CardContent>
        </Card>

        <Button
          onPress={handleSubmit}
          className="w-full mb-4"
          disabled={loading}
        >
          <Text>{loading ? 'Wird verarbeitet...' : isSignUp ? 'Account erstellen' : 'Anmelden'}</Text>
        </Button>

        <Button
          variant="outline"
          onPress={() => {
            setIsSignUp(!isSignUp);
            setFormData({ email: '', password: '', confirmPassword: '' });
          }}
          className="w-full mb-4"
          disabled={loading}
        >
          <Text>
            {isSignUp
              ? 'Bereits ein Account? Hier anmelden'
              : 'Noch kein Account? Hier registrieren'}
          </Text>
        </Button>

        {isSignUp && (
          <Text variant="small" className="text-center text-muted-foreground mb-4">
            Mit der Registrierung stimmen Sie unseren Nutzungsbedingungen und Datenschutzrichtlinien zu.
          </Text>
        )}

        <Button variant="ghost" onPress={handleBack} className="w-full" disabled={loading}>
          <Text>Zurück</Text>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

