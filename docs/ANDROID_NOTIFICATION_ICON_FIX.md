# Android Notification Icon Fix

## Problem
Das Notification Icon wird nicht korrekt angezeigt - stattdessen erscheint ein rotes Platzhalter-Icon.

## Ursache
Android benötigt für Notification Icons ein **weißes Icon auf transparentem Hintergrund**. Das aktuelle Icon (`./assets/images/icon.png`) ist wahrscheinlich farbig.

## Lösung

### Option 1: Bestehendes Icon konvertieren (Empfohlen)

1. **Icon öffnen:**
   - Öffne `./assets/images/icon.png` in einem Bildbearbeitungsprogramm (z.B. Photoshop, GIMP, Figma, oder online: https://www.remove.bg/)

2. **Icon konvertieren:**
   - Hintergrund entfernen (transparent machen)
   - Icon zu weiß konvertieren (alle Farben zu weiß ändern)
   - Als PNG mit transparentem Hintergrund speichern

3. **Icon speichern:**
   - Speichere als `./assets/images/notification-icon.png` (neue Datei)
   - Oder ersetze `./assets/images/icon.png` (wenn du sicher bist)

4. **app.json aktualisieren:**
   ```json
   {
     "plugins": [
       [
         "expo-notifications",
         {
           "icon": "./assets/images/notification-icon.png",
           "color": "#ffffff",
           "sounds": [],
           "mode": "default",
           "androidMode": "default"
         }
       ]
     ]
   }
   ```

### Option 2: Neues Icon erstellen

1. **Einfaches weißes Icon erstellen:**
   - Erstelle ein 96x96 Pixel großes Icon
   - Weißes Symbol/Logo auf transparentem Hintergrund
   - Speichere als `./assets/images/notification-icon.png`

2. **app.json aktualisieren** (siehe Option 1)

### Option 3: Temporär - App-Icon verwenden (falls es weiß ist)

Falls dein App-Icon bereits weiß auf transparent ist, kannst du es direkt verwenden:
- Keine Änderung nötig, aber die App muss neu gebaut werden

## Wichtig: App neu bauen!

**Das Notification Icon wird nur beim Build-Prozess eingebunden!**

Nach dem Ändern des Icons musst du die App neu bauen:

```bash
# Development Build
eas build --platform android --profile development

# Oder lokal
npx expo run:android
```

**Hinweis:** Ein einfacher Reload (`r` im Terminal) reicht nicht aus - die App muss komplett neu gebaut werden!

## Icon-Anforderungen

- ✅ **Weiß** auf transparentem Hintergrund
- ✅ **96x96 Pixel** oder größer (empfohlen)
- ✅ **PNG-Format** mit transparentem Hintergrund
- ✅ **Einfaches Design** (nur weiße Formen/Symbole)

## Schnelle Lösung mit Online-Tools

1. Gehe zu https://www.remove.bg/ (Hintergrund entfernen)
2. Gehe zu https://www.iloveimg.com/resize-image (Größe anpassen auf 96x96)
3. Gehe zu https://www.iloveimg.com/convert-to-png (falls nötig)
4. Icon zu weiß konvertieren (Farbton/Sättigung auf 0 setzen)

## Testen

Nach dem Neubauen der App:
1. App installieren
2. Test-Benachrichtigung senden (in der App: Benachrichtigungen → Test senden)
3. Prüfen, ob das weiße Icon jetzt angezeigt wird

## Troubleshooting

### Icon wird immer noch nicht angezeigt
- ✅ Prüfe: Ist das Icon wirklich weiß auf transparent?
- ✅ Prüfe: Wurde die App nach Icon-Änderung neu gebaut?
- ✅ Prüfe: Ist der Pfad in `app.json` korrekt?
- ✅ Prüfe: Ist die Datei wirklich vorhanden?

### Icon ist zu groß/klein
- Android skaliert das Icon automatisch
- Empfohlene Größe: 96x96 Pixel
- Größere Icons funktionieren auch (werden automatisch skaliert)
