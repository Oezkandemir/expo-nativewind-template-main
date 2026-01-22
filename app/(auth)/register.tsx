import { useState, useRef } from 'react';
import { View, ScrollView, Pressable, Keyboard, TextInput, Platform, TouchableWithoutFeedback } from 'react-native';
import { router, Link } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { KeyboardAvoidingView } from '@/components/ui/keyboard-avoiding-view';
import { Spinner } from '@/components/ui/spinner';
import { useColorScheme } from '@/components/ui/utils/use-color-scheme';
import { useAuth } from '@/hooks/useAuth';
import { supabaseAuthService } from '@/lib/supabase/auth-service';
import { useToast } from '@/components/ui/toast';
import { Logo } from '@/components/ui/logo';
import { Mail, AlertCircle } from 'lucide-react-native';
import { iconWithClassName } from '@/components/ui/lib/icons/icon-with-classname';

const MailIcon = iconWithClassName(Mail);
const AlertIcon = iconWithClassName(AlertCircle);

export default function RegisterScreen() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const colorScheme = useColorScheme();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showEmailSentMessage, setShowEmailSentMessage] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  
  // Refs for input fields to enable navigation between them
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const validateForm = () => {
    // Check all fields are filled
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      showToast('Bitte füllen Sie alle Felder aus', 'error', 3000);
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast('Bitte geben Sie eine gültige E-Mail-Adresse ein', 'error', 3000);
      return false;
    }

    // Validate password length
    if (formData.password.length < 6) {
      showToast('Das Passwort muss mindestens 6 Zeichen lang sein', 'error', 3000);
      return false;
    }

    // Check passwords match
    if (formData.password !== formData.confirmPassword) {
      showToast('Die Passwörter stimmen nicht überein', 'error', 3000);
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Username will be automatically derived from email prefix
      const result = await register(formData.email, formData.password);

      if (!result.success) {
        // Check for common Supabase errors
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

      // Note: User won't be able to login until they confirm their email
      // Supabase will automatically send a confirmation email
    } catch (error) {
      console.error('Registration error:', error);
      showToast('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.', 'error', 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setResendingEmail(true);
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
    } finally {
      setResendingEmail(false);
    }
  };

  if (showEmailSentMessage) {
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

            <Animated.View entering={FadeInDown.delay(200).duration(400)}>
              <Card className="shadow-lg border-0" style={{ backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8 }}>
                <CardContent className="gap-5 py-8 items-center">
                  <Animated.View 
                    entering={FadeInDown.delay(300).duration(400)}
                    className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4"
                  >
                    <MailIcon className="w-8 h-8 text-primary" />
                  </Animated.View>

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

                  <View className="mt-4 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20 w-full">
                    <View className="flex-row items-start gap-2">
                      <AlertIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                      <Text variant="small" className="flex-1 text-amber-700 dark:text-amber-300">
                        Sie können sich erst anmelden, nachdem Sie Ihre E-Mail-Adresse bestätigt haben.
                      </Text>
                    </View>
                  </View>

                  <Button
                    onPress={() => router.replace('/(auth)/login')}
                    className="w-full mt-6"
                  >
                    <Text>Zur Anmeldung</Text>
                  </Button>

                  <View className="mt-4 items-center gap-2 w-full">
                    <Text variant="small" className="text-muted-foreground">
                      E-Mail nicht erhalten?
                    </Text>
                    <Button
                      variant="outline"
                      onPress={handleResendEmail}
                      disabled={resendingEmail}
                      className="w-full"
                    >
                      {resendingEmail ? (
                        <View className="flex-row items-center gap-2">
                          <Spinner size="small" color={colorScheme === 'dark' ? '#E2E8F0' : '#1E293B'} />
                          <Text>Wird gesendet...</Text>
                        </View>
                      ) : (
                        <Text>Bestätigungs-Email erneut senden</Text>
                      )}
                    </Button>
                  </View>

                  <Pressable 
                    onPress={() => {
                      setShowEmailSentMessage(false);
                      Keyboard.dismiss();
                    }}
                    className="mt-4"
                  >
                    <Text variant="small" className="text-primary">
                      Zurück zur Registrierung
                    </Text>
                  </Pressable>
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
              ref={scrollViewRef}
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
              Registrieren
            </Text>
            <Text variant="p" className="text-center text-muted-foreground">
              Beginnen Sie Ihre Reise
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
                    onFocus={() => {
                      // Scroll to show input when keyboard appears
                      setTimeout(() => {
                        scrollViewRef.current?.scrollTo({ y: 100, animated: true });
                      }, 300);
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
                    placeholder="Mindestens 6 Zeichen"
                    value={formData.password}
                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    spellCheck={false}
                    autoComplete="password-new"
                    textContentType="newPassword"
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => {
                      confirmPasswordInputRef.current?.focus();
                    }}
                    onFocus={() => {
                      setTimeout(() => {
                        scrollViewRef.current?.scrollTo({ y: 200, animated: true });
                      }, 300);
                    }}
                    className="mt-2"
                    editable={!loading}
                  />
                  <Text variant="small" className="text-muted-foreground mt-1">
                    Mindestens 6 Zeichen
                  </Text>
                </View>

                <View>
                  <Label>
                    <Text>Passwort bestätigen</Text>
                  </Label>
                  <Input
                    ref={confirmPasswordInputRef}
                    placeholder="Passwort wiederholen"
                    value={formData.confirmPassword}
                    onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    spellCheck={false}
                    autoComplete="password-new"
                    textContentType="newPassword"
                    returnKeyType="done"
                    blurOnSubmit={true}
                    onSubmitEditing={() => {
                      Keyboard.dismiss();
                      if (!loading && formData.email && formData.password && formData.confirmPassword) {
                        handleRegister();
                      }
                    }}
                    onFocus={() => {
                      setTimeout(() => {
                        scrollViewRef.current?.scrollToEnd({ animated: true });
                      }, 300);
                    }}
                    className="mt-2"
                    editable={!loading}
                  />
                </View>

                <Button
                  onPress={handleRegister}
                  className="w-full mt-4"
                  disabled={loading || !formData.email || !formData.password || !formData.confirmPassword}
                >
                  {loading ? (
                    <View className="flex-row items-center gap-2">
                      <Spinner size="small" color="#FFFFFF" />
                      <Text>Wird registriert...</Text>
                    </View>
                  ) : (
                    <Text>Konto erstellen</Text>
                  )}
                </Button>

                <View className="mt-6 items-center gap-2">
                  <Text variant="small" className="text-muted-foreground">
                    Bereits ein Konto?
                  </Text>
                  <Link href="/(auth)/login" asChild>
                    <Pressable 
                      onPress={Keyboard.dismiss}
                      disabled={loading}
                    >
                      <Text variant="p" className="text-primary font-semibold">
                        Jetzt anmelden
                      </Text>
                    </Pressable>
                  </Link>
                </View>

                <Text variant="small" className="text-center text-muted-foreground mt-4">
                  Mit der Registrierung stimmen Sie unseren Nutzungsbedingungen und Datenschutzrichtlinien zu.
                </Text>
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
