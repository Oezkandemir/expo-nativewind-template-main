import { User, UserSession } from '@/types/user';
import { AuthCredentials, AuthResponse, RegisterData } from '../auth/types';
import { supabase } from './client';

/**
 * Real Supabase Authentication Service
 * Replaces dummy auth with real authentication
 */
class SupabaseAuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Extract username from email prefix (part before @)
      const emailPrefix = data.email.split('@')[0];
      const defaultName = emailPrefix || 'User';
      
      // Sign up with Supabase Auth
      // Use app deep link scheme for email confirmation redirect
      // This will open the app when user clicks confirmation link in email
      const emailRedirectTo = 'spotx://auth/callback';
      
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name || defaultName,
          },
          // Email confirmation redirects to app deep link
          emailRedirectTo: emailRedirectTo,
        },
      });

      if (signUpError) {
        // Translate common errors to German
        let errorMessage = signUpError.message;
        
        if (errorMessage.includes('already registered') || errorMessage.includes('already exists')) {
          errorMessage = 'Diese E-Mail-Adresse ist bereits registriert';
        } else if (errorMessage.includes('Password should be at least')) {
          errorMessage = 'Das Passwort muss mindestens 6 Zeichen lang sein';
        } else if (errorMessage.includes('Invalid email')) {
          errorMessage = 'Ungültige E-Mail-Adresse';
        }

        return {
          success: false,
          error: errorMessage,
        };
      }

      if (!authData.user) {
        return {
          success: false,
          error: 'Registrierung fehlgeschlagen',
        };
      }

      // Note: User profile will be automatically created by the database trigger
      // Session will be null until email is confirmed
      
      return {
        success: true,
        user: undefined, // User can't login until email is confirmed
        session: undefined,
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registrierung fehlgeschlagen',
      };
    }
  }

  /**
   * Login with email and password
   * @param credentials - Email and password
   * @param rememberMe - Whether to persist the session (default: true)
   */
  async login(credentials: AuthCredentials, rememberMe: boolean = true): Promise<AuthResponse> {
    try {
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (signInError) {
        // Translate common errors to German
        let errorMessage = signInError.message;
        
        if (errorMessage.includes('Email not confirmed')) {
          errorMessage = 'Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse. Prüfen Sie Ihr Postfach.';
        } else if (errorMessage.includes('Invalid login credentials')) {
          errorMessage = 'Ungültige E-Mail-Adresse oder Passwort';
        } else if (errorMessage.includes('Email link is invalid')) {
          errorMessage = 'Der E-Mail-Link ist ungültig oder abgelaufen';
        }

        return {
          success: false,
          error: errorMessage,
        };
      }

      if (!authData.user) {
        return {
          success: false,
          error: 'Anmeldung fehlgeschlagen',
        };
      }

      // Get user profile from database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (userError || !userData) {
        return {
          success: false,
          error: 'Benutzerprofil konnte nicht geladen werden',
        };
      }

      const user = this.mapDatabaseUserToUser(userData);
      const session = authData.session ? this.mapSupabaseSessionToSession(authData.session) : null;

      // If rememberMe is true, ensure session is persisted (already handled by Supabase client config)
      // If rememberMe is false, we could clear the session on app close, but for now we'll keep it
      // as Supabase handles session persistence automatically via AsyncStorage
      // The main difference is that with rememberMe=false, users might want to logout on app close
      // but for now, we'll rely on Supabase's built-in session management

      return {
        success: true,
        user,
        session: session || undefined,
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Anmeldung fehlgeschlagen',
      };
    }
  }

  /**
   * Get current session
   */
  async getSession(): Promise<UserSession | null> {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        return null;
      }

      return this.mapSupabaseSessionToSession(data.session);
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser) {
        return null;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (userError || !userData) {
        return null;
      }

      return this.mapDatabaseUserToUser(userData);
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Update user data
   */
  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const dbUpdates: any = {
        updated_at: new Date().toISOString(),
      };

      // Map User type to database columns
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.interests !== undefined) dbUpdates.interests = updates.interests;
      if (updates.demographics?.age !== undefined) dbUpdates.age = updates.demographics.age;
      if (updates.demographics?.gender !== undefined) dbUpdates.gender = updates.demographics.gender;
      if (updates.demographics?.location !== undefined) dbUpdates.location = updates.demographics.location;
      if (updates.demographics?.country !== undefined) dbUpdates.country = updates.demographics.country;
      if (updates.preferences?.notificationsEnabled !== undefined) {
        dbUpdates.notifications_enabled = updates.preferences.notificationsEnabled;
      }
      if (updates.preferences?.adFrequencyPreference !== undefined) {
        dbUpdates.ad_frequency_preference = updates.preferences.adFrequencyPreference;
      }
      if (updates.preferences?.widgets?.historyEnabled !== undefined) {
        dbUpdates.history_widget_enabled = updates.preferences.widgets.historyEnabled;
      }

      const { data, error } = await supabase
        .from('users')
        // @ts-ignore
        .update(dbUpdates as any)
        .eq('id', userId)
        .select()
        .single();

      if (error || !data) {
        console.error('Update user error:', error);
        return null;
      }

      return this.mapDatabaseUserToUser(data);
    } catch (error) {
      console.error('Update user error:', error);
      return null;
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    await supabase.auth.signOut();
  }

  /**
   * Resend confirmation email
   */
  async resendConfirmationEmail(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error('Resend confirmation email error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Fehler beim Senden der Bestätigungs-Email',
      };
    }
  }

  /**
   * Check if onboarding is complete
   */
  async isOnboardingComplete(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return false;

      const { data, error } = await supabase
        .from('users')
        .select('onboarding_complete')
        .eq('id', user.id)
        .single();

      if (error || !data) return false;

      return (data as any).onboarding_complete || false;
    } catch {
      return false;
    }
  }

  /**
   * Mark onboarding as complete
   */
  async setOnboardingComplete(complete: boolean): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      await supabase
        .from('users')
        // @ts-ignore
        .update({ onboarding_complete: complete } as any)
        .eq('id', user.id);
    } catch (error) {
      console.error('Set onboarding complete error:', error);
    }
  }

  /**
   * Map database user to User type
   */
  private mapDatabaseUserToUser(dbUser: any): User {
    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name || 'User',
      interests: dbUser.interests || [],
      demographics: {
        age: dbUser.age || 0,
        gender: dbUser.gender || 'prefer-not-to-say',
        location: dbUser.location,
        country: dbUser.country,
      },
      preferences: {
        notificationsEnabled: dbUser.notifications_enabled || false,
        adFrequencyPreference: dbUser.ad_frequency_preference || 'standard',
        widgets: {
          historyEnabled: dbUser.history_widget_enabled || false,
        },
      },
      createdAt: dbUser.created_at,
      updatedAt: dbUser.updated_at,
    };
  }

  /**
   * Map Supabase session to UserSession type
   */
  private mapSupabaseSessionToSession(session: any): UserSession {
    return {
      userId: session.user.id,
      email: session.user.email || '',
      expiresAt: new Date(session.expires_at || 0).getTime(),
    };
  }
}

export const supabaseAuthService = new SupabaseAuthService();
