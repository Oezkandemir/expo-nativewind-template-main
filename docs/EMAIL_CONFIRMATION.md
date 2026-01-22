# Email-Bestätigung mit Supabase

## ✅ Was wurde implementiert

### Neue Screens
1. **Login Screen** (`app/(auth)/login.tsx`)
   - Email und Passwort Eingabe
   - Validierung der Email-Adresse
   - Link zur Registrierung
   - Integration mit Supabase Auth

2. **Register Screen** (`app/(auth)/register.tsx`)
   - Name, Email, Passwort und Passwort-Bestätigung
   - Vollständige Validierung
   - Email-Bestätigungs-Nachricht nach erfolgreicher Registrierung
   - Link zum Login

### Funktionen
- ✅ Echte Supabase-Authentifizierung
- ✅ Email-Bestätigung erforderlich (Supabase sendet automatisch Bestätigungs-Email)
- ✅ Passwort-Validierung (mindestens 6 Zeichen)
- ✅ Email-Format-Validierung
- ✅ Benutzerfreundliche Fehlermeldungen auf Deutsch
- ✅ Erfolgs-Screen nach Registrierung mit Hinweis auf Bestätigungs-Email

## 🔧 Supabase Dashboard Konfiguration

### Email-Bestätigung aktivieren

1. Gehen Sie zu Ihrem Supabase Dashboard: https://supabase.com/dashboard
2. Wählen Sie Ihr Projekt: `mxdpiqnkowcxbujgrfom`
3. Navigieren Sie zu **Authentication** → **Settings**
4. Unter **Email Auth** stellen Sie sicher:
   - ✅ **Enable Email Confirmations** ist aktiviert
   - ✅ **Confirm email** ist auf "enabled" gesetzt

### Email Templates anpassen (Optional)

Sie können die Email-Templates anpassen unter:
**Authentication** → **Email Templates**

Verfügbare Templates:
- **Confirm signup** - Email zur Bestätigung der Registrierung
- **Magic Link** - Login per Email-Link
- **Change Email Address** - Email-Änderungsbestätigung
- **Reset Password** - Passwort zurücksetzen

### Redirect URL konfigurieren

Für die mobile App müssen Sie die Redirect-URLs konfigurieren:

1. Gehe zu **Authentication** → **URL Configuration**
2. Füge hinzu unter **Redirect URLs**:
   ```
   spotx://auth/callback
   ```
   
   **Wichtig:** Diese URL öffnet die App direkt, wenn der Benutzer auf den Bestätigungslink in der E-Mail klickt. Die App navigiert automatisch zum Login-Screen nach erfolgreicher Bestätigung.

   **Für Development (optional):**
   ```
   exp://localhost:8081/--/auth/callback
   ```

## 📱 User Flow

### Registrierung
```
1. User öffnet Register Screen
2. Gibt Name, Email, Passwort ein
3. Klickt "Konto erstellen"
4. Supabase erstellt Account und sendet Bestätigungs-Email
5. Screen zeigt Erfolgs-Nachricht mit Hinweis auf Email
6. User prüft Email und klickt auf Bestätigungslink
7. Email wird bestätigt
8. User kann sich jetzt anmelden
```

### Login
```
1. User öffnet Login Screen
2. Gibt Email und Passwort ein
3. Klickt "Anmelden"
4. Wenn Email nicht bestätigt: Fehlermeldung
5. Wenn Email bestätigt: Login erfolgreich
6. Check Onboarding-Status
7. Redirect zu Onboarding oder Hauptapp
```

## 🚨 Email-Bestätigungs-Status prüfen

Aktuell sendet Supabase die Bestätigungs-Email, aber:

### Standard-Verhalten (aktuell)
- User registriert sich
- Supabase sendet Bestätigungs-Email
- User KANN SICH ERST ANMELDEN, nachdem Email bestätigt wurde
- Bei Login vor Bestätigung: Fehler "Email not confirmed"

### Optional: Email-Bestätigung überspringen (nur für Development)

Wenn Sie während der Entwicklung die Email-Bestätigung überspringen möchten:

1. Supabase Dashboard → **Authentication** → **Settings**
2. Unter **Email Auth** deaktivieren Sie **Enable Email Confirmations**
3. Users können sich sofort anmelden ohne Email zu bestätigen

**⚠️ Wichtig:** Für Production sollte Email-Bestätigung AKTIVIERT bleiben!

## 🔐 Sicherheits-Features

- ✅ Passwort-Hashing durch Supabase
- ✅ Email-Bestätigung verhindert Fake-Accounts
- ✅ Rate Limiting durch Supabase
- ✅ Sichere Session-Verwaltung
- ✅ HTTPS-only Communication

## 📧 Email-Provider Konfiguration

Supabase verwendet standardmäßig ihren eigenen Email-Service, der für Development und kleine Apps ausreicht.

### Für Production: Custom SMTP

Für bessere Zustellbarkeit und Branding:

1. Gehe zu **Project Settings** → **Auth** → **SMTP Settings**
2. Aktiviere **Enable Custom SMTP**
3. Konfiguriere eigenen SMTP-Server (z.B. SendGrid, Amazon SES, Mailgun)

Beispiel für SendGrid:
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Pass: <your-sendgrid-api-key>
Sender Email: noreply@spotx.app
Sender Name: SpotX
```

## 🧪 Testing

### Test-Account erstellen
1. Starte die App: `npm start`
2. Gehe zum Register Screen
3. Registriere mit echter Email-Adresse
4. Prüfe Email-Posteingang (auch Spam!)
5. Klicke Bestätigungslink
6. Kehre zur App zurück und melde dich an

### Email nicht erhalten?

1. Prüfe Spam-Ordner
2. Prüfe Supabase Dashboard → **Authentication** → **Users**
   - User sollte dort sein mit `email_confirmed_at: null`
3. Prüfe Logs: Dashboard → **Logs** → **Auth Logs**

### Manuell Email bestätigen (Development)

Im Supabase Dashboard:
1. **Authentication** → **Users**
2. Klicke auf den User
3. Klicke **Confirm Email**

## 🎨 Anpassungen

### Email-Template anpassen

Die Email-Vorlage kann auf Deutsch angepasst werden:

1. **Authentication** → **Email Templates** → **Confirm signup**
2. Bearbeite Subject und Body:

```html
Betreff: Bestätigen Sie Ihre SpotX Email-Adresse

<h2>Willkommen bei SpotX!</h2>
<p>Klicken Sie auf den Button unten, um Ihre Email-Adresse zu bestätigen:</p>
<a href="{{ .ConfirmationURL }}">Email bestätigen</a>
<p>Wenn Sie sich nicht bei SpotX registriert haben, ignorieren Sie diese Email.</p>
```

## 🔄 Nächste Schritte

### Optional zu implementieren:
- [ ] "Passwort vergessen" Flow
- [ ] "Email erneut senden" Button
- [ ] Social Login (Google, Apple)
- [ ] Email-Änderung mit Bestätigung
- [ ] Zwei-Faktor-Authentifizierung

## 📚 Weitere Informationen

Supabase Auth Dokumentation:
- https://supabase.com/docs/guides/auth
- https://supabase.com/docs/guides/auth/auth-email
- https://supabase.com/docs/guides/auth/auth-email-templates
