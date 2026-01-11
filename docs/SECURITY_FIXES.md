# 🔒 Kritische Sicherheitsfixes - Implementierungsanleitung

**Priorität:** 🔴 KRITISCH  
**Aufwand:** 3-4 Stunden  
**Deadline:** Diese Woche

---

## ⚠️ WICHTIG: Diese Fixes müssen SOFORT umgesetzt werden!

Die App hat aktuell kritische Sicherheitslücken, die behoben werden müssen bevor die App in den Google Play Store kommt.

---

## Fix #1: Password Hashing (KRITISCH)

### Problem
Passwörter werden aktuell im **Klartext** in AsyncStorage gespeichert. Das ist extrem unsicher!

### Lösung

#### Schritt 1: Security Utility erstellen

Erstelle neue Datei: `lib/auth/security.ts`

```typescript
import * as Crypto from 'expo-crypto';

/**
 * Security utilities for password hashing and secure storage
 * 
 * WICHTIG: In Production sollte bcrypt oder Argon2 verwendet werden.
 * Diese Implementierung ist für MVP ausreichend, aber nicht optimal.
 */

// TODO: In Production: Salt aus Secure Env Variable laden
const PASSWORD_SALT = process.env.EXPO_PUBLIC_PASSWORD_SALT || 'spotx-salt-change-in-production';

/**
 * Hash a password using SHA-256
 * 
 * @param password - Plain text password
 * @returns Hashed password string
 * 
 * @example
 * const hashed = await hashPassword('myPassword123');
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length === 0) {
    throw new Error('Password cannot be empty');
  }

  // SHA-256 Hashing mit Salt
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password + PASSWORD_SALT
  );
  
  return digest;
}

/**
 * Verify a password against a hash
 * 
 * @param password - Plain text password to verify
 * @param hashedPassword - Stored hash to compare against
 * @returns True if password matches hash
 * 
 * @example
 * const isValid = await verifyPassword('myPassword123', storedHash);
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  if (!password || !hashedPassword) {
    return false;
  }

  const hash = await hashPassword(password);
  return hash === hashedPassword;
}

/**
 * Generate a secure random token
 * 
 * @param length - Token length in bytes (default: 32)
 * @returns Random token string
 */
export async function generateSecureToken(length: number = 32): Promise<string> {
  const randomBytes = await Crypto.getRandomBytesAsync(length);
  return Array.from(randomBytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}
```

#### Schritt 2: Dummy Auth Service anpassen

Ändere `lib/auth/dummy-auth.ts`:

```typescript
// Am Anfang der Datei hinzufügen:
import { hashPassword, verifyPassword } from './security';

// In der register() Methode ändern:
async register(data: RegisterData): Promise<AuthResponse> {
  try {
    // ... existing code ...
    
    // Passwort hashen BEVOR es gespeichert wird
    const hashedPassword = await hashPassword(data.password);
    
    const newUser: User = {
      // ... existing fields ...
      password: hashedPassword, // ✅ Gehasht statt Klartext
      // ... rest of user object ...
    };
    
    // ... rest of method ...
  }
}

// In der login() Methode ändern:
async login(credentials: AuthCredentials): Promise<AuthResponse> {
  try {
    const usersJson = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];

    // Finde User
    const user = users.find(
      (u) => u.email.toLowerCase() === credentials.email.toLowerCase()
    );

    if (!user) {
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    // ✅ Passwort VERIFY statt direkt vergleichen
    const isValidPassword = await verifyPassword(
      credentials.password,
      user.password
    );

    if (!isValidPassword) {
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    // ... rest of method ...
  }
}
```

#### Schritt 3: Migration Script (Optional)

Falls bereits User-Daten vorhanden sind, erstelle Migration:

```typescript
// scripts/migrate-passwords.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hashPassword } from '../lib/auth/security';

const STORAGE_KEYS = {
  USERS: '@spotx:users',
} as const;

/**
 * Migriert alle Passwörter von Klartext zu Hash
 * 
 * WICHTIG: Dieses Script sollte nur EINMAL ausgeführt werden!
 */
export async function migratePasswords(): Promise<void> {
  try {
    const usersJson = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
    if (!usersJson) {
      console.log('No users to migrate');
      return;
    }

    const users = JSON.parse(usersJson);
    let migrated = 0;

    for (const user of users) {
      // Prüfe ob Passwort bereits gehasht ist (SHA-256 Hash ist 64 Zeichen)
      if (user.password && user.password.length !== 64) {
        console.log(`Migrating password for user: ${user.email}`);
        user.password = await hashPassword(user.password);
        migrated++;
      }
    }

    if (migrated > 0) {
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      console.log(`✅ Migrated ${migrated} passwords`);
    } else {
      console.log('✅ All passwords already migrated');
    }
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
}

// Nur in Development ausführen:
if (__DEV__) {
  // migratePasswords().catch(console.error);
}
```

#### Schritt 4: Tests schreiben

Erstelle `__tests__/lib/auth/security.test.ts`:

```typescript
import { hashPassword, verifyPassword } from '@/lib/auth/security';

describe('Security Utils', () => {
  it('should hash password', async () => {
    const password = 'testPassword123';
    const hash = await hashPassword(password);
    
    expect(hash).toBeDefined();
    expect(hash.length).toBe(64); // SHA-256 produces 64 char hex string
    expect(hash).not.toBe(password);
  });

  it('should verify correct password', async () => {
    const password = 'testPassword123';
    const hash = await hashPassword(password);
    
    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });

  it('should reject incorrect password', async () => {
    const password = 'testPassword123';
    const hash = await hashPassword(password);
    
    const isValid = await verifyPassword('wrongPassword', hash);
    expect(isValid).toBe(false);
  });

  it('should produce different hashes for same password (due to salt)', async () => {
    const password = 'testPassword123';
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);
    
    // Mit Salt sollten Hashes gleich sein
    expect(hash1).toBe(hash2);
  });
});
```

---

## Fix #2: Secure Storage für Sessions

### Problem
Sessions werden in AsyncStorage gespeichert, was nicht sicher ist.

### Lösung

#### Schritt 1: Secure Storage Utility

Erstelle `lib/storage/secure-storage.ts`:

```typescript
import * as SecureStore from 'expo-secure-store';
import { UserSession } from '@/types/user';

const SECURE_KEYS = {
  SESSION: 'spotx_session_secure',
  USER_ID: 'spotx_user_id_secure',
  AUTH_TOKEN: 'spotx_auth_token_secure',
} as const;

/**
 * Secure storage wrapper using expo-secure-store
 * Uses device Keychain (iOS) or Keystore (Android)
 */
export const secureStorage = {
  /**
   * Store user session securely
   */
  async setSession(session: UserSession): Promise<void> {
    try {
      await SecureStore.setItemAsync(
        SECURE_KEYS.SESSION,
        JSON.stringify(session)
      );
    } catch (error) {
      console.error('Failed to store session securely:', error);
      throw error;
    }
  },

  /**
   * Get user session from secure storage
   */
  async getSession(): Promise<UserSession | null> {
    try {
      const data = await SecureStore.getItemAsync(SECURE_KEYS.SESSION);
      if (!data) return null;
      return JSON.parse(data) as UserSession;
    } catch (error) {
      console.error('Failed to get session from secure storage:', error);
      return null;
    }
  },

  /**
   * Clear session from secure storage
   */
  async clearSession(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(SECURE_KEYS.SESSION);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  },

  /**
   * Check if secure storage is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      // Try to set and get a test value
      const testKey = '__secure_storage_test__';
      await SecureStore.setItemAsync(testKey, 'test');
      await SecureStore.deleteItemAsync(testKey);
      return true;
    } catch {
      return false;
    }
  },
};
```

#### Schritt 2: Dummy Auth Service anpassen

In `lib/auth/dummy-auth.ts`:

```typescript
// Import hinzufügen:
import { secureStorage } from '@/lib/storage/secure-storage';

// In createSession() ändern:
private async createSession(user: User): Promise<UserSession> {
  const session: UserSession = {
    userId: user.id,
    email: user.email,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  };

  // ✅ Secure Storage statt AsyncStorage
  await secureStorage.setSession(session);
  return session;
}

// In getSession() ändern:
async getSession(): Promise<UserSession | null> {
  try {
    // ✅ Secure Storage statt AsyncStorage
    const session = await secureStorage.getSession();
    if (!session) return null;

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

// In logout() ändern:
async logout(): Promise<void> {
  await secureStorage.clearSession();
  await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}
```

---

## Fix #3: Environment Variables für Secrets

### Problem
Secrets sind hardcoded im Code.

### Lösung

#### Schritt 1: .env.example erstellen

```bash
# .env.example
EXPO_PUBLIC_PASSWORD_SALT=your-secure-salt-here-change-this
EXPO_PUBLIC_SENTRY_DSN=your-sentry-dsn-here
EXPO_PUBLIC_API_URL=https://api.yourapp.com
```

#### Schritt 2: .env.local erstellen (nicht committen!)

```bash
# .env.local
EXPO_PUBLIC_PASSWORD_SALT=generate-random-string-here
```

#### Schritt 3: .gitignore prüfen

Stelle sicher, dass `.env.local` in `.gitignore` ist:

```gitignore
# local env files
.env*.local
.env.local
```

---

## ✅ Checkliste

Nach Implementierung prüfen:

- [ ] `lib/auth/security.ts` erstellt
- [ ] `lib/auth/dummy-auth.ts` angepasst (hashPassword/verifyPassword)
- [ ] `lib/storage/secure-storage.ts` erstellt
- [ ] Sessions verwenden SecureStore
- [ ] Tests geschrieben und bestanden
- [ ] Migration Script erstellt (falls nötig)
- [ ] `.env.example` erstellt
- [ ] `.env.local` erstellt (nicht committen!)
- [ ] Code Review durchgeführt

---

## 🧪 Testing

Nach den Fixes testen:

1. **Neue Registrierung:**
   ```typescript
   // Passwort sollte gehasht sein
   const result = await dummyAuthService.register({
     email: 'test@example.com',
     password: 'test123',
     name: 'Test User'
   });
   // Prüfe: user.password sollte Hash sein (64 Zeichen)
   ```

2. **Login:**
   ```typescript
   // Login sollte funktionieren
   const result = await dummyAuthService.login({
     email: 'test@example.com',
     password: 'test123'
   });
   // Sollte erfolgreich sein
   ```

3. **Falsches Passwort:**
   ```typescript
   // Falsches Passwort sollte abgelehnt werden
   const result = await dummyAuthService.login({
     email: 'test@example.com',
     password: 'wrongPassword'
   });
   // Sollte fehlschlagen
   ```

---

## ⚠️ WICHTIGE HINWEISE

1. **Salt ändern:** Der Default Salt in `security.ts` muss in Production geändert werden!

2. **Migration:** Falls bereits User existieren, muss Migration durchgeführt werden.

3. **Backup:** Vor Migration Backup der User-Daten erstellen!

4. **Testing:** Alle Auth-Flows nach den Fixes testen!

5. **Production:** In Production sollte bcrypt oder Argon2 statt SHA-256 verwendet werden (für bessere Sicherheit).

---

## 🚀 Nächste Schritte

Nach diesen Fixes:
1. Privacy Policy erstellen
2. Release Keystore generieren
3. Google Play Console Setup
4. Sentry Integration

Siehe `ACTION_PLAN.md` für weitere Schritte.
