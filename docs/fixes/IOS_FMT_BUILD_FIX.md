# iOS fmt Library Build Error Fix

## Problem

Beim iOS Build tritt folgender Fehler auf:

```
call to consteval function 'fmt::basic_format_string<...>::basic_format_string<FMT_COMPILE_STRING, 0>' is not a constant expression
```

Dies passiert in der `fmt` Library (Version 11.0.2), die von React Native verwendet wird. Das Problem entsteht durch C++20 `consteval` Funktionen, die nicht korrekt mit `FMT_STRING` Makros funktionieren.

## Lösung

Die Podfile wurde bereits aktualisiert, um die Build-Einstellungen für die `fmt` Library anzupassen:

```ruby
# Fix for fmt library C++20 consteval issues
installer.pods_project.targets.each do |target|
  if target.name == 'fmt'
    target.build_configurations.each do |config|
      # Use C++17 for fmt to avoid consteval issues with FMT_STRING
      config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
      # Disable strict consteval checking for fmt
      config.build_settings['GCC_WARN_64_TO_32_BIT_CONVERSION'] = 'NO'
    end
  end
end
```

## Schritte zum Beheben

1. **Pods neu installieren:**

```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

2. **Build Cache löschen:**

```bash
# Xcode DerivedData löschen
rm -rf ~/Library/Developer/Xcode/DerivedData

# Oder in Xcode: Product > Clean Build Folder (Shift+Cmd+K)
```

3. **Erneut bauen:**

```bash
npm run ios
```

## Alternative Lösung (falls obige nicht funktioniert)

Falls das Problem weiterhin besteht, können Sie versuchen:

1. **C++ Standard für das gesamte Projekt auf C++17 setzen:**

In `ios/spotx.xcodeproj/project.pbxproj`:
- Ändern Sie `CLANG_CXX_LANGUAGE_STANDARD = "c++20"` zu `CLANG_CXX_LANGUAGE_STANDARD = "c++17"`

**Warnung:** Dies könnte andere Teile des Projekts beeinflussen, die C++20 Features benötigen.

2. **fmt Library Version fixieren:**

Falls möglich, können Sie versuchen, eine ältere Version der fmt Library zu verwenden, die keine C++20 consteval Probleme hat.

## Technische Details

Das Problem entsteht durch:
- C++20 `consteval` Funktionen, die zur Compile-Zeit ausgewertet werden müssen
- `FMT_STRING` Makros, die versuchen, Format-Strings zur Compile-Zeit zu validieren
- Clang/Xcode Compiler, die strikter mit C++20 Compliance umgehen

Die Lösung verwendet C++17 für die fmt Library, was diese Probleme umgeht, während der Rest des Projekts weiterhin C++20 verwenden kann.

## Verifizierung

Nach der Pod-Installation können Sie prüfen, ob die Einstellungen korrekt angewendet wurden:

```bash
cd ios
xcodebuild -project Pods/Pods.xcodeproj -target fmt -showBuildSettings | grep CLANG_CXX_LANGUAGE_STANDARD
```

Dies sollte `c++17` anzeigen.

## Weitere Ressourcen

- [fmt Library Issue #2438](https://github.com/fmtlib/fmt/issues/2438)
- [fmt Library Issue #2775](https://github.com/fmtlib/fmt/issues/2775)
- [React Native Issue #32451](https://github.com/facebook/react-native/issues/32451)
