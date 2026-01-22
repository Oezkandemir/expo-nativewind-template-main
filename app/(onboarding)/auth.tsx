import { useState } from 'react';
import { View, Keyboard, Platform, Pressable, TextInput } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { KeyboardAvoidingView } from '@/components/ui/keyboard-avoiding-view';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/useAuth';
import { supabaseAuthService } from '@/lib/supabase/auth-service';
import { useToast } from '@/components/ui/toast';
import { Logo } from '@/components/ui/logo';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ChevronLeft } from 'lucide-react-native';
import { iconWithClassName } from '@/components/ui/lib/icons/icon-with-classname';

const MailIcon = iconWithClassName(Mail);
const LockIcon = iconWithClassName(Lock);
const EyeIcon = iconWithClassName(Eye);
const EyeOffIcon = iconWithClassName(EyeOff);
const AlertIcon = iconWithClassName(AlertCircle);
const ChevronLeftIcon = iconWithClassName(ChevronLeft);

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
  const [resendingEmail, setResendingEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const handleBack = () => {
    router.back();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Show email confirmation screen after registration
  if (showEmailSentMessage) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0F172A' }}>
        <SafeAreaView className="flex-1" style={{ backgroundColor: '#0F172A' }}>
          <KeyboardAvoidingView
            className="flex-1"
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            style={{ backgroundColor: '#0F172A' }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View className="flex-1 px-6 justify-center">
              {/* Back Button */}
              <Pressable 
                onPress={handleBack}
                className="absolute top-12 left-6 z-10"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <ChevronLeftIcon size={24} color="#FFFFFF" />
              </Pressable>

              {/* SpotX Logo - Top Center */}
              <Animated.View 
                entering={FadeIn.duration(400)}
                className="mb-8 items-center"
              >
                <Logo size="large" showAnimation={false} variant="light" />
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(200).duration(400)}>
                <View className="gap-6 items-center">
                  <Animated.View 
                    entering={FadeInDown.delay(300).duration(400)}
                    className="w-16 h-16 rounded-full items-center justify-center mb-2"
                    style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
                  >
                    <MailIcon size={32} color="#8B5CF6" />
                  </Animated.View>

                  <Text variant="h2" className="text-center text-white font-bold">
                    Bestätigungs-E-Mail gesendet!
                  </Text>

                  <View className="gap-2 items-center">
                    <Text variant="p" className="text-center" style={{ color: '#9CA3AF', fontSize: 16 }}>
                      Wir haben eine E-Mail an
                    </Text>
                    <Text variant="p" className="text-center font-semibold text-white" style={{ fontSize: 16 }}>
                      {formData.email}
                    </Text>
                    <Text variant="p" className="text-center" style={{ color: '#9CA3AF', fontSize: 16 }}>
                      gesendet. Bitte klicken Sie auf den Link in der E-Mail, um Ihr Konto zu bestätigen.
                    </Text>
                  </View>

                  <View className="mt-2 p-4 rounded-xl w-full" style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)', borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.2)' }}>
                    <View className="flex-row items-start gap-3">
                      <AlertIcon size={20} color="#FBBF24" style={{ marginTop: 2 }} />
                      <Text variant="small" className="flex-1 text-amber-300" style={{ fontSize: 14, lineHeight: 20 }}>
                        Sie können sich erst anmelden, nachdem Sie Ihre E-Mail-Adresse bestätigt haben.
                      </Text>
                    </View>
                  </View>

                  <View className="w-full gap-3 mt-2">
                    <Button
                      variant="outline"
                      onPress={handleResendEmail}
                      className="w-full"
                      disabled={resendingEmail}
                      style={{ borderColor: 'rgba(139, 92, 246, 0.3)', backgroundColor: 'transparent' }}
                    >
                      {resendingEmail ? (
                        <View className="flex-row items-center gap-2">
                          <Spinner size="small" color="#8B5CF6" />
                          <Text className="text-white">Wird gesendet...</Text>
                        </View>
                      ) : (
                        <Text className="text-white">Bestätigungs-Email erneut senden</Text>
                      )}
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
                </View>
              </Animated.View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0F172A' }}>
      <SafeAreaView className="flex-1" style={{ backgroundColor: '#0F172A' }}>
        <KeyboardAvoidingView
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          style={{ backgroundColor: '#0F172A' }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View className="flex-1 px-6 justify-center">
            {/* Back Button */}
            <Pressable 
              onPress={handleBack}
              className="absolute top-12 left-6 z-10"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ChevronLeftIcon size={24} color="#FFFFFF" />
            </Pressable>

            {/* SpotX Logo - Top Center */}
            <Animated.View 
              entering={FadeIn.duration(400)}
              className="mb-8 items-center"
            >
              <Logo size="large" showAnimation={false} variant="light" />
            </Animated.View>

            {/* Welcome Text */}
            <Animated.View 
              entering={FadeInDown.delay(200).duration(400)}
              className="mb-8 items-center"
            >
              <Text variant="h1" className="text-center text-white mb-3" style={{ fontSize: 32, fontWeight: '700' }}>
                {isSignUp ? 'Registrieren' : 'Willkommen zurück'}
              </Text>
              <Text variant="p" className="text-center" style={{ color: '#9CA3AF', fontSize: 16 }}>
                {isSignUp ? 'Beginnen Sie Ihre Reise' : 'Melden Sie sich an, um fortzufahren'}
              </Text>
            </Animated.View>

            {/* Form */}
            <Animated.View entering={FadeInDown.delay(300).duration(400)} className="gap-5">
              {/* Email Input */}
              <View>
                <View className="flex-row items-center mb-2">
                  <MailIcon size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
                  <Text className="text-white" style={{ fontSize: 14, fontWeight: '500' }}>E-Mail</Text>
                </View>
                <View className="flex-row items-center" style={{ 
                  backgroundColor: '#1E293B', 
                  borderRadius: 12, 
                  borderWidth: 1, 
                  borderColor: 'rgba(139, 92, 246, 0.2)',
                  paddingHorizontal: 16,
                  paddingVertical: Platform.OS === 'ios' ? 16 : 12,
                  minHeight: 52
                }}>
                  <MailIcon size={20} color="#6B7280" style={{ marginRight: 12 }} />
                  <TextInput
                    placeholder="ihre.email@example.com"
                    placeholderTextColor="#6B7280"
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text.trim() })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    textContentType="emailAddress"
                    returnKeyType="next"
                    blurOnSubmit={false}
                    style={{ flex: 1, color: '#FFFFFF', fontSize: 16 }}
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View>
                <View className="flex-row items-center mb-2">
                  <LockIcon size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
                  <Text className="text-white" style={{ fontSize: 14, fontWeight: '500' }}>Passwort</Text>
                </View>
                <View className="flex-row items-center" style={{ 
                  backgroundColor: '#1E293B', 
                  borderRadius: 12, 
                  borderWidth: 1, 
                  borderColor: 'rgba(139, 92, 246, 0.2)',
                  paddingHorizontal: 16,
                  paddingVertical: Platform.OS === 'ios' ? 16 : 12,
                  minHeight: 52
                }}>
                  <LockIcon size={20} color="#6B7280" style={{ marginRight: 12 }} />
                  <TextInput
                    placeholder={isSignUp ? "Mindestens 6 Zeichen" : "Ihr Passwort"}
                    placeholderTextColor="#6B7280"
                    value={formData.password}
                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete={isSignUp ? "password-new" : "password"}
                    textContentType={isSignUp ? "newPassword" : "password"}
                    returnKeyType={isSignUp ? "next" : "done"}
                    blurOnSubmit={false}
                    onSubmitEditing={isSignUp ? undefined : handleSubmit}
                    style={{ flex: 1, color: '#FFFFFF', fontSize: 16 }}
                    editable={!loading}
                  />
                  <Pressable onPress={togglePasswordVisibility} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    {showPassword ? (
                      <EyeOffIcon size={20} color="#6B7280" />
                    ) : (
                      <EyeIcon size={20} color="#6B7280" />
                    )}
                  </Pressable>
                </View>
                {isSignUp && (
                  <Text variant="small" className="mt-2 ml-8" style={{ color: '#9CA3AF', fontSize: 12 }}>
                    Mindestens 6 Zeichen
                  </Text>
                )}
              </View>

              {/* Confirm Password Input (Sign Up only) */}
              {isSignUp && (
                <View>
                  <View className="flex-row items-center mb-2">
                    <LockIcon size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
                    <Text className="text-white" style={{ fontSize: 14, fontWeight: '500' }}>Passwort bestätigen</Text>
                  </View>
                  <View className="flex-row items-center" style={{ 
                    backgroundColor: '#1E293B', 
                    borderRadius: 12, 
                    borderWidth: 1, 
                    borderColor: 'rgba(139, 92, 246, 0.2)',
                    paddingHorizontal: 16,
                    paddingVertical: Platform.OS === 'ios' ? 16 : 12,
                    minHeight: 52
                  }}>
                    <LockIcon size={20} color="#6B7280" style={{ marginRight: 12 }} />
                    <TextInput
                      placeholder="Passwort wiederholen"
                      placeholderTextColor="#6B7280"
                      value={formData.confirmPassword}
                      onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="password-new"
                      textContentType="newPassword"
                      returnKeyType="done"
                      onSubmitEditing={handleSubmit}
                      style={{ flex: 1, color: '#FFFFFF', fontSize: 16 }}
                      editable={!loading}
                    />
                    <Pressable onPress={toggleConfirmPasswordVisibility} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                      {showConfirmPassword ? (
                        <EyeOffIcon size={20} color="#6B7280" />
                      ) : (
                        <EyeIcon size={20} color="#6B7280" />
                      )}
                    </Pressable>
                  </View>
                </View>
              )}

              {/* Primary Button */}
              <Button
                onPress={handleSubmit}
                className="w-full mt-2"
                disabled={loading || (isSignUp && (!formData.email || !formData.password || !formData.confirmPassword)) || (!isSignUp && (!formData.email || !formData.password))}
                style={{ borderRadius: 12, minHeight: 52 }}
              >
                {loading ? (
                  <View className="flex-row items-center gap-2">
                    <Spinner size="small" color="#FFFFFF" />
                    <Text style={{ fontSize: 16, fontWeight: '600' }}>{isSignUp ? 'Wird registriert...' : 'Wird angemeldet...'}</Text>
                  </View>
                ) : (
                  <Text style={{ fontSize: 16, fontWeight: '600' }}>{isSignUp ? 'Konto erstellen' : 'Anmelden'}</Text>
                )}
              </Button>

              {/* Toggle Sign Up/Login */}
              <View className="mt-4 items-center">
                <Pressable
                  onPress={() => {
                    setIsSignUp(!isSignUp);
                    setFormData({ email: '', password: '', confirmPassword: '' });
                    Keyboard.dismiss();
                  }}
                  disabled={loading}
                >
                  <Text className="text-center" style={{ color: '#9CA3AF', fontSize: 14 }}>
                    {isSignUp ? 'Bereits ein Konto? ' : 'Noch kein Konto? '}
                    <Text style={{ color: '#8B5CF6', fontWeight: '600' }}>
                      {isSignUp ? 'Jetzt anmelden' : 'Jetzt registrieren'}
                    </Text>
                  </Text>
                </Pressable>
              </View>

              {/* Terms (Sign Up only) */}
              {isSignUp && (
                <Text variant="small" className="text-center mt-2" style={{ color: '#6B7280', fontSize: 12, lineHeight: 16 }}>
                  Mit der Registrierung stimmen Sie unseren{'\n'}Nutzungsbedingungen und Datenschutzrichtlinien zu.
                </Text>
              )}
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

