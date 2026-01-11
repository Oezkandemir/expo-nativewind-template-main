# Merchant Portal E-Mail-Bestätigung

## ✅ Was wurde implementiert

### 1. E-Mail-Bestätigung bei Registrierung

Die Merchant-Registrierung (`apps/merchant-portal/app/(auth)/register/page.tsx`) sendet jetzt automatisch eine Bestätigungs-E-Mail:

```typescript
const { data: authData, error: authError } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      company_name: companyName,
      user_type: 'merchant',
    },
    emailRedirectTo: `${baseUrl}/login?confirmed=true`,
  },
})
```

**Features:**
- ✅ Automatischer E-Mail-Versand durch Supabase
- ✅ Redirect nach E-Mail-Bestätigung zum Login
- ✅ Benutzerfreundliche Bestätigungs-Nachricht
- ✅ Hinweis zum Spam-Ordner

### 2. Prüfung auf bestehende App-User

Vor der Registrierung wird geprüft, ob die E-Mail bereits in der `public.users` Tabelle existiert (App-User):

```typescript
const { data: existingUser, error: checkError } = await supabase
  .from('users')
  .select('id, email, full_name')
  .eq('email', email)
  .single()

if (existingUser) {
  setError(
    'Diese E-Mail-Adresse ist bereits als App-Benutzer registriert. ' +
    'Bitte kontaktieren Sie uns unter support@spotx.app, wenn Sie ein Merchant-Konto erstellen möchten.'
  )
  return
}
```

**Features:**
- ✅ Prüfung vor Registrierung
- ✅ Klare Fehlermeldung mit Support-Kontakt
- ✅ Verhindert Duplikate zwischen App-Usern und Merchants

### 3. Verbesserte Login-Fehlermeldungen

Der Login (`apps/merchant-portal/app/(auth)/login/page.tsx`) zeigt jetzt spezifische Fehler an:

```typescript
if (authError.message.includes('Email not confirmed')) {
  throw new Error(
    'Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse. ' +
    'Wir haben Ihnen eine Bestätigungs-E-Mail gesendet. ' +
    'Prüfen Sie auch Ihren Spam-Ordner.'
  )
}
```

**Features:**
- ✅ Spezifische Meldung für unbestätigte E-Mails
- ✅ Hinweis auf Spam-Ordner
- ✅ Klare Anweisungen für den User

## 🔧 Supabase Konfiguration

### Schritt 1: E-Mail-Bestätigung aktivieren

1. Öffnen Sie das Supabase Dashboard: https://supabase.com/dashboard
2. Wählen Sie Ihr Projekt: `mxdpiqnkowcxbujgrfom`
3. Gehen Sie zu **Authentication** → **Settings**
4. Unter **Email Auth** stellen Sie sicher:
   - ✅ **Enable Email Confirmations** ist aktiviert
   - ✅ **Confirm email** ist auf "enabled" gesetzt

### Schritt 2: Redirect URLs konfigurieren

Fügen Sie die folgenden URLs in **Authentication** → **URL Configuration** → **Redirect URLs** hinzu:

```
http://localhost:3000/login
http://localhost:3000/login?confirmed=true
https://ihre-domain.vercel.app/login
https://ihre-domain.vercel.app/login?confirmed=true
```

### Schritt 3: E-Mail-Template anpassen (Optional)

Passen Sie das E-Mail-Template an unter **Authentication** → **Email Templates** → **Confirm signup**:

**Betreff:**
```
Bestätigen Sie Ihre SpotX Merchant-Registrierung
```

**Body:**
```html
<h2>Willkommen bei SpotX Merchant Portal!</h2>
<p>Vielen Dank für Ihre Registrierung als Merchant.</p>
<p>Bitte klicken Sie auf den Button unten, um Ihre E-Mail-Adresse zu bestätigen:</p>
<a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #9333ea; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
  E-Mail bestätigen
</a>
<p style="margin-top: 20px; color: #666;">
  Wenn Sie sich nicht bei SpotX registriert haben, können Sie diese E-Mail ignorieren.
</p>
<p style="margin-top: 10px; color: #666; font-size: 12px;">
  Bei Fragen kontaktieren Sie uns unter support@spotx.app
</p>
```

## 📝 Environment Variables

Erstellen Sie eine `.env.local` Datei im `apps/merchant-portal/` Verzeichnis:

```bash
cd apps/merchant-portal
touch .env.local
```

Fügen Sie folgende Variablen hinzu:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://mxdpiqnkowcxbujgrfom.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14ZHBpcW5rb3djeGJ1amdyZm9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwNjg2OTIsImV4cCI6MjA4MzY0NDY5Mn0.-KxgreAS7P2Ht5cq59yT9Zt0Be8C_l0SSrKFlqeMu-s

# Base URL for email redirects
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Wichtig:** 
- Die `.env.local` Datei ist in `.gitignore` und wird nicht ins Repository hochgeladen
- Für Production auf Vercel: Variablen in den Vercel Project Settings hinzufügen

## 📱 User Flow

### Registrierung

```
1. Merchant öffnet /register
2. Füllt Formular aus (Firmenname, E-Mail, Telefon, Passwort)
3. System prüft ob E-Mail bereits als App-User existiert
4. Falls ja: Fehlermeldung mit Support-Kontakt
5. Falls nein: Account wird erstellt
6. Supabase sendet Bestätigungs-E-Mail
7. Merchant sieht Erfolgsmeldung mit Hinweis auf E-Mail
8. Merchant wird zu /login weitergeleitet
```

### E-Mail-Bestätigung

```
1. Merchant öffnet E-Mail
2. Klickt auf Bestätigungslink
3. Wird zu /login?confirmed=true weitergeleitet
4. Kann sich jetzt anmelden
```

### Login

```
1. Merchant öffnet /login
2. Gibt E-Mail und Passwort ein
3. Falls E-Mail nicht bestätigt:
   → Fehlermeldung mit Hinweis auf Bestätigungs-E-Mail
4. Falls E-Mail bestätigt:
   → Login erfolgreich
   → Redirect zu /campaigns
```

## 🧪 Testing

### Test-Account erstellen

1. Starten Sie das Merchant Portal:
```bash
cd apps/merchant-portal
npm run dev
```

2. Öffnen Sie http://localhost:3000/register

3. Registrieren Sie einen Test-Account:
   - Firmenname: Test GmbH
   - E-Mail: ihre-test@email.de (echte E-Mail!)
   - Telefon: +49 123 456789
   - Passwort: test123

4. Prüfen Sie Ihr E-Mail-Postfach (auch Spam!)

5. Klicken Sie auf den Bestätigungslink

6. Melden Sie sich an unter http://localhost:3000/login

### E-Mail nicht erhalten?

**Option 1: Prüfen Sie das Supabase Dashboard**

1. Öffnen Sie: https://supabase.com/dashboard/project/mxdpiqnkowcxbujgrfom/auth/users
2. Suchen Sie Ihren User
3. Status sollte sein: `email_confirmed_at: null`
4. Klicken Sie auf den User → **Send email confirmation**

**Option 2: E-Mail manuell bestätigen (nur Development)**

1. Öffnen Sie: https://supabase.com/dashboard/project/mxdpiqnkowcxbujgrfom/auth/users
2. Klicken Sie auf den User
3. Klicken Sie **Confirm Email**
4. User kann sich jetzt anmelden

**Option 3: E-Mail-Logs prüfen**

1. Öffnen Sie: https://supabase.com/dashboard/project/mxdpiqnkowcxbujgrfom/logs/auth-logs
2. Filtern Sie nach "email"
3. Prüfen Sie ob E-Mail gesendet wurde

## 🚨 Troubleshooting

### Problem: "User already exists" Fehler

**Ursache:** E-Mail ist bereits in `auth.users` registriert

**Lösung:**
1. Öffnen Sie Supabase Dashboard → Authentication → Users
2. Löschen Sie den existierenden User
3. Versuchen Sie die Registrierung erneut

### Problem: "Diese E-Mail-Adresse ist bereits als App-Benutzer registriert"

**Ursache:** E-Mail existiert bereits in `public.users` (Mobile App User)

**Lösung:**
1. User kann sich nicht als Merchant registrieren
2. Kontaktieren Sie Support unter support@spotx.app
3. Oder: User verwendet eine andere E-Mail-Adresse

### Problem: E-Mail kommt nicht an

**Mögliche Ursachen:**
1. ❌ E-Mail-Bestätigung ist in Supabase deaktiviert
2. ❌ Redirect URL ist nicht konfiguriert
3. ❌ E-Mail landet im Spam
4. ❌ Supabase E-Mail-Service hat Rate Limit erreicht

**Lösungen:**
1. Prüfen Sie Supabase Settings → Email Auth
2. Prüfen Sie URL Configuration → Redirect URLs
3. Prüfen Sie Spam-Ordner
4. Warten Sie 5-10 Minuten und versuchen Sie es erneut

### Problem: "Email not confirmed" beim Login

**Ursache:** User hat E-Mail noch nicht bestätigt

**Lösung:**
1. User soll E-Mail-Postfach prüfen (auch Spam)
2. User soll auf Bestätigungslink klicken
3. Oder: E-Mail manuell im Supabase Dashboard bestätigen (siehe oben)

## 🔐 Sicherheit

### Implementierte Sicherheits-Features

- ✅ **E-Mail-Bestätigung erforderlich** - Verhindert Fake-Accounts
- ✅ **Duplikat-Prüfung** - Verhindert mehrfache Registrierung
- ✅ **App-User-Prüfung** - Trennung zwischen App-Usern und Merchants
- ✅ **Passwort-Hashing** - Durch Supabase Auth
- ✅ **Rate Limiting** - Durch Supabase Auth
- ✅ **Sichere Session-Verwaltung** - Durch Supabase Auth

### Best Practices

1. ✅ **Nie Passwörter in Logs** - Nur Fehler-Codes loggen
2. ✅ **HTTPS-only in Production** - Automatisch durch Vercel
3. ✅ **Environment Variables** - Niemals ins Repository
4. ✅ **E-Mail-Verifizierung** - Immer in Production aktiviert

## 📚 Nächste Schritte

### Optional zu implementieren:

- [ ] **"E-Mail erneut senden" Button** - Falls User E-Mail nicht erhalten hat
- [ ] **"Passwort vergessen" Flow** - Password Reset per E-Mail
- [ ] **E-Mail-Änderung** - Mit erneuter Bestätigung
- [ ] **Custom SMTP** - Für bessere Zustellbarkeit (SendGrid, AWS SES)
- [ ] **E-Mail-Benachrichtigungen** - Bei wichtigen Account-Änderungen

### Für Production:

- [ ] **Custom SMTP konfigurieren** - Bessere Zustellbarkeit
- [ ] **Monitoring** - E-Mail-Versand überwachen
- [ ] **Analytics** - Registrierungs-Rate tracken
- [ ] **A/B Testing** - E-Mail-Templates optimieren

## 📞 Support

Bei Fragen oder Problemen:
- E-Mail: support@spotx.app
- Supabase Dashboard: https://supabase.com/dashboard/project/mxdpiqnkowcxbujgrfom

## 🔗 Weitere Ressourcen

- [Supabase Auth Dokumentation](https://supabase.com/docs/guides/auth)
- [Supabase E-Mail Auth](https://supabase.com/docs/guides/auth/auth-email)
- [Supabase E-Mail Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
