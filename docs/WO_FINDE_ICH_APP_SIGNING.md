# Wo finde ich die App-Signing-Informationen in Google Play Console?

## 📍 Navigation zu App Signing

Du bist aktuell auf dem **Dashboard**. Um die App-Signing-Informationen zu sehen:

### Schritt 1: Gehe zu "Setup"

1. **Im linken Menü** (Navigation Bar) siehst du verschiedene Optionen
2. **Scroll nach unten** oder suche nach **"Setup"** oder **"Einrichtung"**
3. Klicke auf **"Setup"** oder **"Einrichtung"**

### Schritt 2: Wähle "App signing"

1. Unter "Setup" findest du verschiedene Optionen
2. Klicke auf **"App signing"** oder **"App-Signierung"**

### Schritt 3: Finde den Upload-Key SHA1

Auf der App-Signing-Seite siehst du:

1. **App signing key certificate** (von Google verwaltet)
   - Das ist der Key, den Google verwendet
   - Du musst dich darum nicht kümmern

2. **Upload key certificate** ⭐ **DAS IST DER WICHTIGE!**
   - Hier siehst du den **SHA1 Fingerabdruck**
   - Das ist der Key, den du verwenden musst
   - Notiere dir diesen SHA1!

## 🖼️ Was du sehen solltest

Auf der App-Signing-Seite siehst du normalerweise:

```
App signing
├── App signing key certificate
│   └── SHA-1: [von Google verwaltet]
│
└── Upload key certificate ⭐
    └── SHA-1: AE:98:21:3F:79:BC:1A:43:5D:15:F3:89:9F:99:50:24:6D:52:50:24
```

## 🔍 Alternative Navigation

Falls du "Setup" nicht findest:

1. **Direkter Link:** 
   ```
   https://play.google.com/console/u/0/developers/[DEINE-DEVELOPER-ID]/app/[DEINE-APP-ID]/setup/app-signing
   ```

2. **Über die URL:**
   - Aktuell bist du wahrscheinlich auf: `play.google.com/console/.../dashboard`
   - Ändere `dashboard` zu `setup/app-signing`

3. **Über das Menü:**
   - Klicke auf "Mehr Nutzer gewinnen" oder andere Menüpunkte
   - Suche nach "Setup" oder "Einrichtung" im Menü

## 📝 Was du brauchst

Sobald du auf der App-Signing-Seite bist:

1. **Suche nach "Upload key certificate"**
2. **Notiere dir den SHA-1 Fingerabdruck**
3. **Das ist der Key, den du zu EAS hochladen musst!**

## ✅ Nächste Schritte

Nachdem du den SHA1 gefunden hast:

1. Prüfe, ob du einen Keystore mit diesem SHA1 hast
2. Falls ja: Lade ihn zu EAS hoch
3. Falls nein: Kontaktiere Google Play Support

## 🆘 Falls du die Seite nicht findest

Falls du die App-Signing-Seite nicht findest:

1. **Prüfe, ob deine App bereits in Google Play Console ist**
   - Neue Apps haben manchmal noch keine App-Signing-Seite
   - Du musst möglicherweise zuerst ein Bundle hochladen

2. **Kontaktiere Google Play Support:**
   - Gehe zu: Hilfe & Support (oben rechts)
   - Frage nach dem Upload-Key SHA1 für deine App

3. **Prüfe die Fehlermeldung:**
   - Die Fehlermeldung sagt: `AE:98:21:3F:79:BC:1A:43:5D:15:F3:89:9F:99:50:24:6D:52:50:24`
   - Das ist wahrscheinlich der SHA1, den Google Play erwartet
   - Verwende diesen SHA1 als Referenz
