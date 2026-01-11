# 📹 Video-Anleitung für Google Play Console

## ⚠️ WICHTIG: Normalerweise NICHT erforderlich!

Da Ihre App **nur Vordergrund-Standortzugriff** verwendet (kein Hintergrund), ist **KEIN Video erforderlich**. Google Play verlangt Videos nur für Hintergrund-Standortzugriff.

Falls Google Play trotzdem nach einem Video fragt, folgen Sie dieser Anleitung:

---

## 📋 Video-Anforderungen

- **Länge:** Maximal 30 Sekunden
- **Format:** YouTube-Video (öffentlich oder ungelistet)
- **Inhalt:** Muss zeigen:
  1. Die standortbasierte Funktion in Aktion
  2. Einen **deutlichen Hinweis** vor der Berechtigungsanfrage
  3. Wie die App den Standort verwendet

---

## 🎬 Schritt-für-Schritt Anleitung

### Schritt 1: Vorbereitung

1. **Öffnen Sie die App** auf einem Android-Gerät (oder Emulator)
2. **Bereiten Sie vor:**
   - Ein Gerät zum Aufnehmen (Handy, Tablet, oder Screen-Recording-Software)
   - Die App sollte die Standortberechtigung noch NICHT haben (für Demo)

### Schritt 2: Video aufnehmen

**Option A: Mit Screen Recording (Android)**
```
1. Öffnen Sie die App
2. Aktivieren Sie Screen Recording (meist in Quick Settings)
3. Navigieren Sie zu einer Funktion, die Standort benötigt
4. Zeigen Sie den DEUTLICHEN Hinweis vor der Berechtigung
5. Zeigen Sie, wie die App den Standort verwendet
6. Stoppen Sie die Aufnahme
```

**Option B: Mit zweitem Gerät filmen**
```
1. Stellen Sie das Gerät mit der App auf einen Tisch
2. Filmen Sie mit einem zweiten Gerät von oben
3. Folgen Sie den gleichen Schritten wie oben
```

**Option C: Mit Emulator + Screen Recording**
```
1. Öffnen Sie Android Studio Emulator
2. Installieren Sie die App
3. Verwenden Sie Screen Recording Software (z.B. OBS Studio)
4. Folgen Sie den gleichen Schritten
```

### Schritt 3: Video bearbeiten

1. **Schneiden Sie auf max. 30 Sekunden**
2. **Fügen Sie Text hinzu** (optional):
   - "Standortzugriff nur im Vordergrund"
   - "Kein Hintergrundzugriff"
3. **Stellen Sie sicher, dass sichtbar ist:**
   - Der Hinweis vor der Berechtigungsanfrage
   - Die Funktion, die den Standort verwendet

### Schritt 4: Auf YouTube hochladen

1. **Erstellen Sie ein YouTube-Konto** (falls nicht vorhanden)
2. **Gehen Sie zu:** https://www.youtube.com/upload
3. **Laden Sie das Video hoch**
4. **Einstellungen:**
   - **Sichtbarkeit:** "Ungelistet" (empfohlen) oder "Öffentlich"
   - **Titel:** z.B. "spotx - Standortzugriff Vordergrund"
   - **Beschreibung:** "Demo der standortbasierten Funktion in spotx"
5. **Kopieren Sie den YouTube-Link**

### Schritt 5: Link in Google Play Console einfügen

1. Gehen Sie zu Google Play Console
2. Navigieren Sie zu: **App-Inhalt → Berechtigungen**
3. Fügen Sie den YouTube-Link im Feld "Videoanleitung" ein

---

## 📝 Beispiel-Video-Struktur (30 Sekunden)

```
0:00-0:05  → App öffnen, zu Standort-Funktion navigieren
0:05-0:15  → DEUTLICHER Hinweis wird angezeigt (WICHTIG!)
            "Diese App benötigt Ihren Standort, um 
             standortbasierte Kampagnen anzuzeigen"
0:15-0:25  → Berechtigung wird erteilt
0:25-0:30  → Funktion wird verwendet (Kampagnen werden angezeigt)
```

---

## 🎨 Was muss im Video sichtbar sein?

### ✅ MUSS sichtbar sein:

1. **Deutlicher Hinweis vor der Berechtigung:**
   ```
   "Diese App benötigt Ihren Standort, um 
    standortbasierte Kampagnen-Vorschläge anzuzeigen, 
    wenn Sie die App aktiv nutzen."
   ```

2. **Die Funktion in Aktion:**
   - Standort wird verwendet
   - Standortbasierte Kampagnen werden angezeigt
   - App ist im Vordergrund (nicht im Hintergrund)

3. **Android-Berechtigungsdialog:**
   - "Standortzugriff erlauben?"
   - Optionen: "Während der App-Nutzung" (Vordergrund)

### ❌ NICHT nötig:

- Hintergrund-Standortzugriff zeigen (haben Sie ja nicht)
- Geofencing zeigen (haben Sie nicht implementiert)
- Komplexe Erklärungen

---

## 🛠️ Tools für Video-Erstellung

### Screen Recording:
- **Android:** Eingebautes Screen Recording (Quick Settings)
- **Emulator:** OBS Studio (kostenlos)
- **Mac:** QuickTime Player (kostenlos)
- **Windows:** Xbox Game Bar (kostenlos)

### Video-Bearbeitung:
- **Kostenlos:** 
  - DaVinci Resolve
  - OpenShot
  - iMovie (Mac)
- **Online:** 
  - Canva Video Editor
  - Kapwing

---

## 💡 Tipps

1. **Halten Sie es einfach** - 30 Sekunden sind kurz
2. **Zeigen Sie den Hinweis deutlich** - Das ist das Wichtigste
3. **Verwenden Sie ein echtes Gerät** - Sieht professioneller aus
4. **Testen Sie vorher** - Stellen Sie sicher, dass alles funktioniert
5. **Machen Sie mehrere Takes** - Wählen Sie den besten aus

---

## ❓ Häufige Fragen

**Q: Muss das Video auf Deutsch sein?**  
A: Nein, aber es hilft, wenn der Hinweis auf Deutsch ist (da Ihre App auf Deutsch ist).

**Q: Kann ich ein Screenshot verwenden?**  
A: Nein, Google Play verlangt ein Video.

**Q: Wie lange dauert die Genehmigung?**  
A: Normalerweise 1-3 Werktage nach Einreichung.

**Q: Was, wenn Google das Video ablehnt?**  
A: Überprüfen Sie, ob der Hinweis deutlich sichtbar ist und die Funktion gezeigt wird.

---

## ✅ Checkliste vor Upload

- [ ] Video ist max. 30 Sekunden lang
- [ ] Deutlicher Hinweis vor Berechtigung ist sichtbar
- [ ] Funktion wird gezeigt (Standort wird verwendet)
- [ ] Video zeigt Vordergrund-Zugriff (nicht Hintergrund)
- [ ] Video ist auf YouTube hochgeladen
- [ ] Link ist kopiert und bereit für Google Play Console

---

## 🎯 Zusammenfassung

**Normalerweise:** Kein Video nötig für Vordergrund-Standortzugriff

**Falls gefordert:** 
1. 30 Sekunden Video aufnehmen
2. Hinweis + Funktion zeigen
3. Auf YouTube hochladen
4. Link in Google Play Console einfügen
