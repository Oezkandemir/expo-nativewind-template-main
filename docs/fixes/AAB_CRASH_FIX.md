# AAB Crash Fix - ProGuard/R8 Konfiguration

## Problem
Die generierte AAB-Datei führt zu Abstürzen beim Update auf dem Handy. Dies ist typischerweise auf ProGuard/R8 zurückzuführen, die notwendigen Code entfernen.

## Durchgeführte Fixes

### 1. Erweiterte ProGuard-Regeln
Die `proguard-rules.pro` wurde umfassend erweitert mit:
- **Alle Expo-Module**: Vollständige Keep-Regeln für alle verwendeten Expo-Module
- **React Native New Architecture**: Spezielle Regeln für TurboModules und Fabric
- **Native Methods**: Alle nativen Methoden werden beibehalten
- **Reflection**: Klassen, die über Reflection aufgerufen werden
- **Kotlin**: Metadata und Coroutines werden beibehalten
- **App-Klassen**: MainApplication und MainActivity werden geschützt

### 2. Shrink Resources deaktiviert
`shrinkResources` wurde temporär auf `false` gesetzt, um zu testen, ob das Entfernen von Ressourcen Probleme verursacht.

### 3. Optimierte ProGuard-Datei
Von `proguard-android.txt` zu `proguard-android-optimize.txt` gewechselt für bessere Optimierung bei gleichzeitigem Schutz notwendiger Klassen.

## Nächste Schritte

### 1. Neuen Build erstellen
```bash
npm run build:production:android
```

### 2. Build testen
- AAB-Datei auf Testgerät installieren
- App starten und alle Features testen
- Crash-Logs prüfen (falls verfügbar)

### 3. Wenn weiterhin Crashes auftreten

#### Option A: ProGuard komplett deaktivieren (zum Testen)
In `android/gradle.properties`:
```properties
android.enableProguardInReleaseBuilds=false
```

#### Option B: Crash-Logs analysieren
1. Crash-Logs aus Google Play Console herunterladen
2. Mit `mapping.txt` deobfuscaten:
   ```bash
   # mapping.txt liegt in: android/app/build/outputs/mapping/release/mapping.txt
   # Verwende retrace tool:
   ./android/gradlew :app:retraceRelease
   ```

#### Option C: Shrink Resources wieder aktivieren (nach erfolgreichem Test)
In `android/app/build.gradle`:
```gradle
shrinkResources true
```

## Häufige Crash-Ursachen

### 1. Fehlende ProGuard-Regeln für Bibliotheken
Wenn eine neue Bibliothek hinzugefügt wird, müssen entsprechende Keep-Regeln hinzugefügt werden.

### 2. Reflection-basierter Code
Code, der Reflection verwendet, muss explizit geschützt werden:
```proguard
-keep class com.example.MyClass { *; }
```

### 3. Native Module
Alle nativen Module müssen geschützt werden:
```proguard
-keep class com.example.nativemodule.** { *; }
```

### 4. Serialisierung
Klassen, die serialisiert werden, müssen geschützt werden:
```proguard
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    !static !transient <fields>;
}
```

## Debugging-Tipps

### 1. Logs aktivieren
In `MainApplication.kt` temporär Logging hinzufügen:
```kotlin
override fun onCreate() {
    super.onCreate()
    android.util.Log.d("MainApplication", "onCreate called")
    // ...
}
```

### 2. Test-Build ohne ProGuard
Erstelle einen Test-Build ohne ProGuard, um zu prüfen, ob ProGuard die Ursache ist:
```bash
# In android/gradle.properties
android.enableProguardInReleaseBuilds=false

# Dann builden
npm run build:production:android
```

### 3. Mapping-Datei hochladen
Die `mapping.txt` Datei muss in Google Play Console hochgeladen werden, um Crash-Reports zu deobfuscaten.

## Prävention

1. **Immer testen**: Nach jedem Build die App gründlich testen
2. **Mapping-Datei sichern**: Jede `mapping.txt` für spätere Crash-Analysen aufbewahren
3. **Neue Bibliotheken**: Bei neuen Bibliotheken sofort ProGuard-Regeln hinzufügen
4. **Crash Reporting**: Sentry oder ähnliche Tools einrichten für bessere Crash-Analysen

## Weitere Ressourcen

- [ProGuard Manual](https://www.guardsquare.com/manual/configuration/usage)
- [React Native ProGuard](https://reactnative.dev/docs/signed-apk-android#enabling-proguard-to-reduce-the-size-of-the-apk)
- [Expo Build Configuration](https://docs.expo.dev/build-reference/android-build-config/)
