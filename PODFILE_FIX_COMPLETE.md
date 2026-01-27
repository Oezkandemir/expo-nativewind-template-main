# Podfile Fix abgeschlossen

## Problem behoben

**Fehler:**
```
undefined method 'reject' for an instance of String
/Users/dmr/Desktop/expo-nativewind-template-main/ios/Podfile:78
```

**Ursache:**
- `OTHER_CFLAGS` kann sowohl ein String als auch ein Array sein
- Der Code versuchte `reject` auf einem String aufzurufen

**Lösung:**
- Code aktualisiert, um beide Datentypen zu behandeln
- String wird zuerst in ein Array konvertiert
- Dann wird `-Werror` entfernt und `-Wno-unused-command-line-argument` hinzugefügt

## Podfile Fix Details

Der Fix im Podfile (Zeilen 64-82) behandelt jetzt korrekt:

```ruby
# Convert to array if it's a string
other_cflags = config.build_settings['OTHER_CFLAGS']
if other_cflags.nil?
  other_cflags = []
elsif other_cflags.is_a?(String)
  other_cflags = other_cflags.split(' ')
end

# Remove -Werror if present and add the flag
other_cflags = other_cflags.reject { |flag| flag == '-Werror' }
other_cflags << '-Wno-unused-command-line-argument'
config.build_settings['OTHER_CFLAGS'] = other_cflags
```

## Nächste Schritte

Der Podfile-Fix ist jetzt korrekt. Führen Sie `pod install` manuell aus:

```bash
cd ios
pod install
cd ..
```

**Hinweis:** Falls Sie Sandbox-Berechtigungsprobleme sehen (z.B. "Operation not permitted" bei git clone), führen Sie den Befehl außerhalb der Sandbox aus oder verwenden Sie ein Terminal direkt.

## Verifikation

Nach erfolgreicher `pod install` sollten Sie:
- Keine Ruby-Fehler mehr sehen
- `Podfile.lock` erstellt sehen
- Die Pods erfolgreich installiert haben

Dann können Sie den iOS Build testen:
```bash
npm run ios
```
