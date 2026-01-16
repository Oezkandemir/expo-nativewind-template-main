import { User, UserSession } from '@/types/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthCredentials, AuthResponse, RegisterData } from './types';

const STORAGE_KEYS = {
  USERS: '@spotx:users',
  SESSION: '@spotx:session',
  CURRENT_USER: '@spotx:current_user',
  ONBOARDING_COMPLETE: '@spotx:onboarding_complete',
} as const;

/**
 * Dummy authentication service using AsyncStorage
 * This will be replaced with Supabase Auth in Phase 2
 */
class DummyAuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Get existing users
      const usersJson = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      const users: User[] = usersJson ? JSON.parse(usersJson) : [];

      // Check if user already exists
      const existingUser = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
      if (existingUser) {
        return {
          success: false,
          error: 'User with this email already exists',
        };
      }

      // Create new user
      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: data.email.toLowerCase(),
        name: data.name || '',
        password: data.password, // In production, this would be hashed
        interests: [],
        demographics: {
          age: 0,
          gender: 'prefer-not-to-say',
        },
        preferences: {
          notificationsEnabled: true,
          adFrequencyPreference: 'standard',
          widgets: {
            historyEnabled: false,
          },
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save user
      users.push(newUser);
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      // Create session
      const session = await this.createSession(newUser);

      // Save current user
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));

      return {
        success: true,
        user: newUser,
        session,
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      };
    }
  }

  /**
   * Login with email and password
   */
  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    try {
      const usersJson = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      const users: User[] = usersJson ? JSON.parse(usersJson) : [];

      const user = users.find(
        (u) =>
          u.email.toLowerCase() === credentials.email.toLowerCase() &&
          u.password === credentials.password
      );

      if (!user) {
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }

      // Create session
      const session = await this.createSession(user);

      // Save current user
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));

      return {
        success: true,
        user,
        session,
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  }

  /**
   * Create a session for the user
   */
  private async createSession(user: User): Promise<UserSession> {
    const session: UserSession = {
      userId: user.id,
      email: user.email,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    };

    await AsyncStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    return session;
  }

  /**
   * Get current session
   */
  async getSession(): Promise<UserSession | null> {
    try {
      const sessionJson = await AsyncStorage.getItem(STORAGE_KEYS.SESSION);
      if (!sessionJson) return null;

      const session: UserSession = JSON.parse(sessionJson);

      // Check if session expired
      if (session.expiresAt < Date.now()) {
        await this.logout();
        return null;
      }

      return session;
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
      const session = await this.getSession();
      if (!session) return null;

      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (!userJson) return null;

      const user: User = JSON.parse(userJson);
      return user;
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
      const usersJson = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      const users: User[] = usersJson ? JSON.parse(usersJson) : [];

      const userIndex = users.findIndex((u) => u.id === userId);
      if (userIndex === -1) return null;

      const updatedUser: User = {
        ...users[userIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      users[userIndex] = updatedUser;
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));

      return updatedUser;
    } catch (error) {
      console.error('Update user error:', error);
      return null;
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.SESSION);
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  /**
   * Check if onboarding is complete
   */
  async isOnboardingComplete(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
      return value === 'true';
    } catch {
      return false;
    }
  }

  /**
   * Mark onboarding as complete
   */
  async setOnboardingComplete(complete: boolean): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, complete ? 'true' : 'false');
  }

  /**
   * Quick login for development - creates/uses a test user without credentials
   */
  async quickLogin(): Promise<AuthResponse> {
    try {
      const testEmail = 'dev@spotx.test';
      const testPassword = 'dev123';
      const testName = 'Dev User';

      // Check if test user already exists
      const usersJson = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      const users: User[] = usersJson ? JSON.parse(usersJson) : [];
      let testUser = users.find((u) => u.email.toLowerCase() === testEmail.toLowerCase());

      // Create test user if doesn't exist
      if (!testUser) {
        testUser = {
          id: `user_dev_${Date.now()}`,
          email: testEmail,
          name: testName,
          password: testPassword,
          interests: ['tech', 'gaming', 'sports'],
          demographics: {
            age: 25,
            gender: 'prefer-not-to-say',
          },
          preferences: {
            notificationsEnabled: true,
            adFrequencyPreference: 'standard',
            widgets: {
              historyEnabled: false,
            },
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        users.push(testUser as User);
        await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      }

      // Create session
      const session = await this.createSession(testUser as User);

      // Save current user
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(testUser));

      // Mark onboarding as complete for quick access
      await this.setOnboardingComplete(true);

      return {
        success: true,
        user: testUser,
        session,
      };
    } catch (error) {
      console.error('Quick login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Quick login failed',
      };
    }
  }
}

export const dummyAuthService = new DummyAuthService();


