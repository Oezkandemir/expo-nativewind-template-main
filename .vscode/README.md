# IDE-Konfiguration für React Native Projekt

## Problem
Die IDE zeigt rote Markierungen/Fehler für Gradle-Projekte in `node_modules`, insbesondere:
- `@react-native-async-storage/async-storage`
- `@react-native-community/netinfo`
- `@react-native/gradle-plugin` und Unterpakete

## Lösung

### 1. Automatische Fixes
Das Projekt enthält ein Postinstall-Script (`scripts/fix-gradle-settings.js`), das automatisch fehlende `.settings` Ordner erstellt.

### 2. IDE-Einstellungen
Die `.vscode/settings.json` Datei enthält Konfigurationen, die:
- Gradle-Import in `node_modules` deaktivieren
- Java-Fehler ignorieren
- Android-Ordner aus der Suche ausschließen

### 3. Wenn Fehler weiterhin angezeigt werden

1. **Java/Gradle Extension deaktivieren** (falls installiert):
   - Öffne Extensions (Cmd+Shift+X)
   - Suche nach "Java" oder "Gradle"
   - Deaktiviere die Extension für dieses Workspace

2. **IDE-Cache leeren**:
   - Cursor/VS Code komplett schließen
   - Terminal: `rm -rf ~/.cursor/User/workspaceStorage` (Cursor)
   - Oder: `rm -rf ~/.vscode/User/workspaceStorage` (VS Code)
   - Cursor/VS Code neu starten

3. **Workspace neu laden**:
   - Cmd+Shift+P → "Reload Window"

### Hinweis
Diese Fehler sind **harmlos** und beeinträchtigen die Funktionalität nicht. Sie entstehen, weil die IDE Gradle-Projekte in `node_modules` erkennt, die nicht vollständig konfiguriert sind.
