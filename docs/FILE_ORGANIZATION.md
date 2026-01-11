# Datei-Organisation

Dieses Dokument beschreibt die Organisation der Dokumentations- und Script-Dateien im Projekt.

## Struktur

### Root-Verzeichnis
Die folgenden wichtigen Dateien bleiben im Root-Verzeichnis:
- `README.md` - Haupt-README
- `README.monorepo.md` - Monorepo-Dokumentation
- `START_HIER.md` - Startpunkt für neue Entwickler

### Dokumentation (`docs/`)

#### Setup-Guides (`docs/setup/`)
Alle Setup- und Konfigurationsanleitungen:
- `APNS_CREDENTIALS_SETUP.md`
- `CREDENTIALS_SETUP_NOW.md`
- `EAS_TOKEN_SETUP.md`
- `FCM_HTTP_V1_SETUP.md`
- `FCM_SERVER_KEY_SETUP.md`
- `FIREBASE_ANDROID_SETUP.md`
- `GOOGLE_SERVICES_JSON_SETUP.md`
- `PUSH_CREDENTIALS_COMPLETE_SETUP.md`
- `PUSH_NOTIFICATIONS_SETUP_GUIDE.md`
- `PUSH_NOTIFICATIONS_WITHOUT_APPLE_ACCOUNT.md`
- `SETUP_ENV_NOW.md`

#### Fixes (`docs/fixes/`)
Alle Fehlerbehebungs- und Fix-Anleitungen:
- `ALLE_FIXES_KOMPLETT.md`
- `ANDROID_AUTO_FIX.md`
- `ANDROID_INSTALL_FIX.md`
- `ANDROID_PUSH_FIX.md`
- `FIX_JETZT.md`
- `FIX_P8_FILE.md`
- `MERCHANT_EMAIL_FIX_ANLEITUNG.md`
- `MERCHANT_LOGIN_FIX_ANLEITUNG.md`
- `PUSH_CREDENTIALS_FIX.md`

#### Quick Guides (`docs/quick-guides/`)
Kurze Schnellstart-Anleitungen:
- `QUICK_FCM_SETUP.md`
- `QUICK_FIX_MERCHANT_LOGIN.md`
- `QUICK_SETUP_PUSH_CREDENTIALS.md`

#### Weitere Dokumentation (`docs/`)
- `SETUP_ABGESCHLOSSEN.md` - Setup-Abschluss-Status
- `WAS_IST_ZU_TUN.md` - To-Do Liste
- Weitere technische Dokumentationen

### Scripts (`scripts/`)

#### Setup-Scripts (`scripts/setup/`)
Alle Setup- und Konfigurations-Scripts:
- `fix-android-install.sh`
- `quick-fix-env.sh`
- `setup-eas-credentials-auto.sh`
- `setup-eas-credentials.sh`
- `setup-push-credentials-now.sh`
- `setup-push-credentials.sh`

#### Weitere Scripts (`scripts/`)
- SQL-Scripts
- Build-Scripts
- Weitere Utility-Scripts

## Verwendung

### Setup durchführen
1. Siehe `START_HIER.md` für den Einstieg
2. Setup-Guides in `docs/setup/` durchgehen
3. Bei Problemen: `docs/fixes/` konsultieren
4. Für schnelle Lösungen: `docs/quick-guides/` verwenden

### Scripts ausführen
Alle Setup-Scripts befinden sich in `scripts/setup/`:
```bash
cd scripts/setup
./setup-eas-credentials.sh
```

## Aktualisiert
Datum: $(date +%Y-%m-%d)
