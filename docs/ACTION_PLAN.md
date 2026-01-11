# 🎯 SpotX App - Priorisierter Aktionsplan

**Erstellt:** $(date)  
**Status:** 🚀 Bereit zur Umsetzung

---

## 🔴 KRITISCH - Sofort umsetzen (Diese Woche)

### 1. Password Security Fix ⚠️ KRITISCH
**Priorität:** 🔴 Höchste  
**Aufwand:** 2-3 Stunden  
**Risiko:** Extrem hoch wenn nicht behoben

**Problem:**
- Passwörter werden im Klartext in AsyncStorage gespeichert
- Bei Gerätekompromittierung sind alle Passwörter lesbar

**Lösung:**
```typescript
// lib/auth/security.ts - NEU ERSTELLEN
import * as Crypto from 'expo-crypto';

const PASSWORD_SALT = process.env.EXPO_PUBLIC_PASSWORD_SALT || 'default-salt-change-me';

export async function hashPassword(password: string): Promise<string> {
  // SHA-256 Hashing mit Salt
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password + PASSWORD_SALT
  );
  return digest;
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  const hash = await hashPassword(password);
  return hash === hashedPassword;
}
```

**Migration Script:**
```typescript
// scripts/migrate-passwords.ts
// Führt einmalige Migration durch
```

**Tasks:**
- [ ] `lib/auth/security.ts` erstellen
- [ ] `lib/auth/dummy-auth.ts` anpassen (hashPassword verwenden)
- [ ] Migration Script erstellen
- [ ] Tests schreiben
- [ ] Code Review

---

### 2. Secure Storage für Sensitive Data
**Priorität:** 🔴 Hoch  
**Aufwand:** 1-2 Stunden

**Problem:**
- User-Daten unverschlüsselt in AsyncStorage
- Sessions können einfach extrahiert werden

**Lösung:**
```typescript
// lib/storage/secure-storage.ts - NEU ERSTELLEN
import * as SecureStore from 'expo-secure-store';

const SECURE_KEYS = {
  SESSION: 'spotx_session',
  USER_ID: 'spotx_user_id',
  AUTH_TOKEN: 'spotx_auth_token',
} as const;

export const secureStorage = {
  async setSession(session: UserSession): Promise<void> {
    await SecureStore.setItemAsync(
      SECURE_KEYS.SESSION,
      JSON.stringify(session)
    );
  },
  
  async getSession(): Promise<UserSession | null> {
    const data = await SecureStore.getItemAsync(SECURE_KEYS.SESSION);
    return data ? JSON.parse(data) : null;
  },
  
  async clearSession(): Promise<void> {
    await SecureStore.deleteItemAsync(SECURE_KEYS.SESSION);
  },
};
```

**Tasks:**
- [ ] `lib/storage/secure-storage.ts` erstellen
- [ ] `lib/auth/dummy-auth.ts` anpassen (SecureStore verwenden)
- [ ] Migration von AsyncStorage zu SecureStore
- [ ] Tests schreiben

---

### 3. Google Play Console - Privacy Policy
**Priorität:** 🔴 Hoch  
**Aufwand:** 2-3 Stunden

**Problem:**
- Keine Privacy Policy vorhanden
- Google Play erfordert Privacy Policy URL

**Lösung:**
- [ ] Privacy Policy erstellen (Template verwenden)
- [ ] Auf Website/Server hosten
- [ ] URL in `app.json` hinzufügen
- [ ] In App verlinken (Settings Screen)

**Privacy Policy Template Points:**
- Datenerfassung (welche Daten?)
- Verwendungszweck
- Datenweitergabe
- User Rechte (GDPR)
- Cookies & Tracking
- Kontaktinformationen

---

### 4. Release Keystore Setup
**Priorität:** 🔴 Hoch  
**Aufwand:** 1 Stunde

**Problem:**
- Aktuell wird debug keystore für Release verwendet
- Unsicher und Google Play wird das ablehnen

**Lösung:**
```bash
# Release Keystore generieren
keytool -genkeypair -v -storetype PKCS12 \
  -keystore android/app/release.keystore \
  -alias spotx-release \
  -keyalg RSA -keysize 2048 -validity 10000

# In android/gradle.properties speichern (NICHT committen!)
SPOTX_RELEASE_STORE_FILE=release.keystore
SPOTX_RELEASE_KEY_ALIAS=spotx-release
SPOTX_RELEASE_STORE_PASSWORD=<secure-password>
SPOTX_RELEASE_KEY_PASSWORD=<secure-password>
```

**Tasks:**
- [ ] Release Keystore generieren
- [ ] Passwörter sicher speichern (1Password/LastPass)
- [ ] `android/app/build.gradle` anpassen
- [ ] `.gitignore` prüfen (keystore nicht committen!)
- [ ] EAS Build Secrets konfigurieren

---

## 🟡 HOCH - Diese Woche (Optional aber empfohlen)

### 5. Error Logging & Crash Reporting
**Priorität:** 🟡 Hoch  
**Aufwand:** 3-4 Stunden

**Setup Sentry:**
```bash
npm install @sentry/react-native
```

```typescript
// lib/monitoring/sentry.ts - NEU ERSTELLEN
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: __DEV__ ? 'development' : 'production',
  enableAutoSessionTracking: true,
  tracesSampleRate: 1.0,
});
```

**Tasks:**
- [ ] Sentry Account erstellen
- [ ] DSN in `.env` speichern
- [ ] Sentry Integration
- [ ] Error Boundary erweitern
- [ ] Test Crashes senden

---

### 6. ProGuard/R8 Aktivierung
**Priorität:** 🟡 Hoch  
**Aufwand:** 2 Stunden

**Problem:**
- ProGuard ist deaktiviert
- Code ist nicht obfuskiert
- Reverse Engineering möglich

**Lösung:**
```gradle
// android/app/build.gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro"
    }
}
```

**Tasks:**
- [ ] ProGuard aktivieren
- [ ] ProGuard Rules testen
- [ ] Build testen
- [ ] Crash Reports prüfen (mapping.txt für Sentry)

---

### 7. Console Log Removal für Production
**Priorität:** 🟡 Mittel  
**Aufwand:** 1 Stunde

**Problem:**
- Console.logs in Production Code
- Potentiell sensitive Informationen

**Lösung:**
```typescript
// lib/utils/logger.ts - NEU ERSTELLEN
const isDev = __DEV__;

export const logger = {
  log: (...args: any[]) => {
    if (isDev) console.log(...args);
  },
  error: (...args: any[]) => {
    if (isDev) console.error(...args);
    // In Production: Sentry
  },
  warn: (...args: any[]) => {
    if (isDev) console.warn(...args);
  },
};
```

**Tasks:**
- [ ] Logger Utility erstellen
- [ ] Alle console.log durch logger.log ersetzen
- [ ] Babel Plugin für automatische Entfernung (optional)

---

## 🟢 MITTEL - Nächste Woche

### 8. Performance Optimierung - Code Splitting
**Priorität:** 🟢 Mittel  
**Aufwand:** 4-6 Stunden

**Lazy Loading für Screens:**
```typescript
// app/(tabs)/_layout.tsx
const StatisticsScreen = lazy(() => import('./statistics'));
const HistoryScreen = lazy(() => import('./history'));

// Mit Suspense wrappen
<Suspense fallback={<LoadingScreen />}>
  <StatisticsScreen />
</Suspense>
```

**Tasks:**
- [ ] React.lazy für große Screens
- [ ] Loading States hinzufügen
- [ ] Bundle Size messen (vorher/nachher)
- [ ] Performance testen

---

### 9. Image Optimization
**Priorität:** 🟢 Mittel  
**Aufwand:** 2-3 Stunden

**Optimiertes Image Component:**
```typescript
// components/ui/optimized-image.tsx - NEU ERSTELLEN
import { Image } from 'expo-image';

export function OptimizedImage({ source, ...props }) {
  return (
    <Image
      source={source}
      cachePolicy="memory-disk"
      contentFit="cover"
      transition={200}
      placeholder={require('@/assets/images/placeholder.png')}
      {...props}
    />
  );
}
```

**Tasks:**
- [ ] OptimizedImage Component erstellen
- [ ] Alle Image Components ersetzen
- [ ] Placeholder Images hinzufügen
- [ ] Caching testen

---

### 10. Unit Tests Setup
**Priorität:** 🟢 Mittel  
**Aufwand:** 4-6 Stunden

**Jest Configuration:**
```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "jest": {
    "preset": "jest-expo",
    "transformIgnorePatterns": [
      "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)"
    ]
  }
}
```

**Tasks:**
- [ ] Jest Setup
- [ ] Erste Tests für Auth Service
- [ ] Tests für Reward Calculator
- [ ] CI Integration

---

## 📋 Checkliste für Google Play Submission

### Vor Submission prüfen:

#### App Information
- [ ] App Name finalisiert
- [ ] Short Description (80 Zeichen)
- [ ] Full Description (4000 Zeichen)
- [ ] App Icon (512x512)
- [ ] Feature Graphic (1024x500)
- [ ] Screenshots (mind. 2, max. 8)
  - [ ] Phone Screenshots
  - [ ] Tablet Screenshots (optional)
- [ ] Promotional Video (optional)

#### Content Rating
- [ ] IARC Rating durchgeführt
- [ ] Content Descriptors angegeben

#### Privacy & Security
- [ ] Privacy Policy URL
- [ ] Data Safety Formular ausgefüllt
- [ ] Permissions begründet
- [ ] Target SDK 34 (Android 14)

#### Technical
- [ ] Release Keystore konfiguriert
- [ ] App Bundle statt APK
- [ ] Version Code erhöht
- [ ] Version Name gesetzt
- [ ] ProGuard aktiviert
- [ ] 64-bit Support

#### Testing
- [ ] Internal Testing Track
- [ ] Closed Testing Track
- [ ] Pre-launch Report geprüft
- [ ] Crash-free Rate > 99%

---

## 🚀 Quick Start Guide

### Diese Woche umsetzen:

1. **Password Security (2h)**
   ```bash
   # Neue Datei erstellen
   touch lib/auth/security.ts
   # Code aus Abschnitt 1 kopieren
   # dummy-auth.ts anpassen
   ```

2. **Secure Storage (1h)**
   ```bash
   npm install expo-secure-store
   touch lib/storage/secure-storage.ts
   ```

3. **Privacy Policy (2h)**
   - Template verwenden
   - Auf Website hosten
   - URL in App hinzufügen

4. **Release Keystore (1h)**
   ```bash
   cd android/app
   # Keystore generieren (siehe Abschnitt 4)
   ```

**Gesamtaufwand:** ~6 Stunden

---

## 📊 Fortschritts-Tracking

### Woche 1 (Diese Woche)
- [ ] Password Security Fix
- [ ] Secure Storage
- [ ] Privacy Policy
- [ ] Release Keystore

### Woche 2
- [ ] Sentry Integration
- [ ] ProGuard Aktivierung
- [ ] Logger Utility
- [ ] Code Splitting

### Woche 3
- [ ] Image Optimization
- [ ] Unit Tests Setup
- [ ] Performance Monitoring
- [ ] Google Play Submission Prep

---

## 🆘 Hilfe & Support

Bei Fragen oder Problemen:
1. Master Plan konsultieren (`MASTER_PLAN.md`)
2. Dokumentation prüfen
3. Team konsultieren

---

**Nächster Schritt:** Beginne mit Abschnitt 1 (Password Security) - das ist kritisch!
