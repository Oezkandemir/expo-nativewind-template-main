import { supabaseAuthService } from '@/lib/supabase/auth-service';
import { initializeNotifications } from '@/lib/notifications/scheduler';
import { User, UserSession } from '@/types/user';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  session: UserSession | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentSession = await supabaseAuthService.getSession();
      const currentUser = await supabaseAuthService.getCurrentUser();

      if (currentSession && currentUser) {
        setSession(currentSession);
        setUser(currentUser);
        // Initialize notifications when user is authenticated
        initializeNotifications().catch((error) => {
          console.error('Failed to initialize notifications:', error);
        });
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, rememberMe: boolean = true) => {
    try {
      const response = await supabaseAuthService.login({ email, password }, rememberMe);
      if (response.success && response.user && response.session) {
        setUser(response.user);
        setSession(response.session);
        // Initialize notifications after login
        initializeNotifications().catch((error) => {
          console.error('Failed to initialize notifications:', error);
        });
        return { success: true };
      }
      return { success: false, error: response.error || 'Login failed' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    try {
      const response = await supabaseAuthService.register({ email, password, name });
      if (response.success) {
        // Don't set user/session yet - email confirmation required
        // User will login after confirming email
        return { success: true };
      }
      return { success: false, error: response.error || 'Registrierung fehlgeschlagen' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registrierung fehlgeschlagen',
      };
    }
  };

  const logout = async () => {
    await supabaseAuthService.logout();
    setUser(null);
    setSession(null);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = await supabaseAuthService.updateUser(user.id, updates);
    if (updatedUser) {
      setUser(updatedUser);
    }
  };

  const refreshUser = async () => {
    const currentUser = await supabaseAuthService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAuthenticated: !!user && !!session,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


