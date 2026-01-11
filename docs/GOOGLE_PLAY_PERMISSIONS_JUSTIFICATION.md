# Google Play Store - Berechtigungen für Fotos und Videos

## READ_MEDIA_IMAGES (0/250 Zeichen)

**Empfohlener Text:**

```
Unsere App benötigt Zugriff auf Fotos, um Benutzern zu ermöglichen, Profilbilder hochzuladen und zu ändern, Screenshots von Belohnungen zu speichern, und Werbeinhalte mit Bildern zu personalisieren. Der Zugriff erfolgt nur auf Benutzeranfrage und wird nicht im Hintergrund verwendet.
```

**Alternative (falls nur gelegentlich benötigt):**

```
Unsere App verwendet die Android-Bildauswahl für gelegentlichen Zugriff auf Fotos. Diese Berechtigung wird nur benötigt, wenn Benutzer explizit ein Profilbild auswählen oder Screenshots speichern möchten.
```

## READ_MEDIA_VIDEO (0/250 Zeichen)

**Empfohlener Text:**

```
Unsere App benötigt Zugriff auf Videos, um Benutzern zu ermöglichen, Videoinhalte für ihr Profil hochzuladen und Werbevideos anzuzeigen. Der Zugriff erfolgt nur auf explizite Benutzeranfrage und wird nicht im Hintergrund verwendet.
```

**Alternative (falls nur gelegentlich benötigt):**

```
Unsere App verwendet die Android-Videoauswahl für gelegentlichen Zugriff auf Videos. Diese Berechtigung wird nur benötigt, wenn Benutzer explizit Videoinhalte auswählen möchten.
```

---

## ⚠️ WICHTIGER HINWEIS

**Wenn Ihre App diese Berechtigungen NICHT tatsächlich benötigt:**

Google Play empfiehlt, auf Android's Photo Picker zu migrieren, wenn die App nur gelegentlich auf Fotos/Videos zugreift. Dies ist die bessere Lösung für Datenschutz und Benutzerfreundlichkeit.

### Option 1: Berechtigungen entfernen (empfohlen)

Wenn Sie diese Berechtigungen nicht benötigen, können Sie sie aus `app.json` entfernen:

```json
"android": {
  "permissions": [
    "CAMERA",
    // "READ_EXTERNAL_STORAGE",  // Entfernen
    // "WRITE_EXTERNAL_STORAGE", // Entfernen
    // "ACCESS_MEDIA_LOCATION",  // Entfernen (falls nicht benötigt)
    ...
  ]
}
```

Dann verwenden Sie stattdessen `expo-image-picker` mit `mediaTypes: ['images']` oder `['videos']`, was automatisch Android's Photo Picker verwendet.

### Option 2: Begründung einreichen

Wenn Sie die Berechtigungen behalten müssen, verwenden Sie die oben genannten Texte im Google Play Console.

---

## Aktuelle Situation in Ihrer App

- ✅ `expo-media-library` ist installiert
- ❌ Keine tatsächliche Verwendung von `getAssetsAsync`, `createAssetAsync`, etc.
- ⚠️ Nur Demo-Code verwendet MediaLibrary für Permission-Requests

**Empfehlung:** Entfernen Sie die Berechtigungen, es sei denn, Sie planen, diese Funktionen in Zukunft zu implementieren.
