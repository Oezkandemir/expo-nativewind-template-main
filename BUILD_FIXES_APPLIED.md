# Build-Fixes angewendet

## Android Build-Fix

**Problem:** 
```
SDK location not found. Define a valid SDK location with an ANDROID_HOME environment variable or by setting the sdk.dir path in your project's local properties file
```

**Lösung:**
- ✅ `android/local.properties` erstellt mit SDK-Pfad: `/Users/dmr/Library/Android/sdk`

**Datei:** `android/local.properties`
```properties
sdk.dir=/Users/dmr/Library/Android/sdk
```

## iOS Build-Fix

**Problem:**
```
clang: error: argument unused during compilation: '-fmodules-cache-path=/Users/dmr/Library/Developer/Xcode/DerivedData/ModuleCache.noindex' [-Werror,-Wunused-command-line-argument]
```

**Lösung:**
- ✅ Podfile aktualisiert mit Yoga Build-Fix
- ✅ `-Wno-unused-command-line-argument` Flag für Yoga Target hinzugefügt
- ✅ `-Werror` Flag entfernt für Yoga Target
- ✅ Fix für Ruby-Fehler (`undefined method 'reject'`) hinzugefügt - behandelt String und Array für `OTHER_CFLAGS`

**Datei:** `ios/Podfile` (post_install Block)

Der Fix wird automatisch angewendet, wenn Sie die Pods neu installieren:

```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

## iOS glog Modul-Fix

**Problem:**
```
module 'glog' is needed but has not been provided, and implicit use of module files is disabled
```

**Lösung:**
- ✅ Podfile aktualisiert mit glog Modul-Fix
- ✅ Modul-Unterstützung für `glog` aktiviert
- ✅ Implizite Module für React Native Targets aktiviert, die `glog` verwenden

**Datei:** `ios/Podfile` (post_install Block)

## Nächste Schritte

1. **iOS Pods neu installieren** (damit die Fixes angewendet werden):
   ```bash
   cd ios
   rm -rf Pods Podfile.lock
   pod install
   cd ..
   ```

2. **Builds testen:**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   ```

3. **Bei weiteren Problemen:**
   - Xcode Cache löschen: `rm -rf ~/Library/Developer/Xcode/DerivedData`
   - Gradle Cache löschen: `cd android && ./gradlew clean && cd ..`
