# ✅ Korrekte EAS Credentials Syntax

## ❌ Falsch (diese Syntax funktioniert nicht):
```bash
eas credentials -p android --profile production
# Error: Unexpected arguments: --profile, production
```

## ✅ Richtig:
```bash
eas credentials -p android
```

Das `--profile` Flag existiert nicht für `eas credentials`. Das Profil wird interaktiv ausgewählt.

## 📋 Schritt-für-Schritt Anleitung

### 1. Starte Credentials Setup:
```bash
eas credentials -p android
```

### 2. Wähle interaktiv:
- **Platform:** Android (wird automatisch durch `-p android` gewählt)
- **Build Profile:** Wähle `production` aus der Liste
- **Action:** Wähle `Set up new credentials` oder `Update credentials`
- **Option:** Wähle `Upload existing keystore`

### 3. Gib die Daten ein:
- Pfad zum Keystore
- Keystore-Passwort
- Key-Alias
- Key-Passwort

## 🔍 Aktuelle Credentials anzeigen

Um die aktuellen Credentials zu sehen:

```bash
eas credentials -p android
```

Wähle dann:
- Build Profile: `production`
- Action: `View credentials`

## 🚀 Nach dem Hochladen

Nachdem du den Keystore hochgeladen hast:

```bash
eas build --platform android --profile production
```

**Hinweis:** Bei `eas build` funktioniert `--profile` korrekt!
