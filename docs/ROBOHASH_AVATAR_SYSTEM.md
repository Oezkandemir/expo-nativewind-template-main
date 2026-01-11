# 🤖 RoboHash Avatar System

## ✅ Implementiert

Das Avatar-System verwendet [RoboHash](https://robohash.org/) um automatisch eindeutige Avatar-Bilder für jeden User zu generieren - ohne Upload, ohne Storage, ohne Kosten!

## 🎨 Features

- ✅ **Automatische Avatar-Generierung** basierend auf User-ID
- ✅ **Konsistente Avatare** - Gleiche ID = Gleicher Avatar
- ✅ **Verschiedene Styles** (Robots, Monsters, Heads, Cats)
- ✅ **Fallback zu Initialen** wenn Bild nicht lädt
- ✅ **Wiederverwendbarer Component**
- ✅ **Anpassbare Größe und Border**
- ✅ **Optional: Custom Avatar URL** (für zukünftige Uploads)

## 📂 Neue Dateien

### 1. **Avatar Utilities** (`lib/utils/avatar.ts`)
```typescript
// Generate avatar URL
getAvatarUrl(userId, { size: 200, style: 'robots' })

// Get display name (first name)
getDisplayName('Max Mustermann') // → 'Max'

// Get initials
getInitials('Max Mustermann') // → 'MM'
```

### 2. **UserAvatar Component** (`components/ui/user-avatar.tsx`)
```tsx
<UserAvatar
  userId={user.id}
  name={user.name}
  size={96}
  style="robots"
  showBorder={true}
  borderColor="#8B5CF6"
/>
```

### 3. **User Type erweitert** (`types/user.ts`)
```typescript
export interface User {
  // ... existing fields
  avatarUrl?: string; // Optional für zukünftige Custom Avatars
}
```

## 🎯 Verwendung

### Profile Screen
```tsx
<UserAvatar
  userId={user?.id || 'default'}
  name={user?.name}
  size={96}
  style="robots"
  customUrl={user?.avatarUrl}
  showBorder={true}
  borderColor="#8B5CF6"
/>
```

### Dashboard
```tsx
<UserAvatar
  userId={user?.id || 'default'}
  name={user?.name}
  size={56}
  style="robots"
  showBorder={true}
  borderColor="#8B5CF6"
/>
```

## 🎨 Avatar Styles

RoboHash bietet verschiedene Styles:

- **`robots`** (default) - Roboterartige Avatare
- **`monsters`** - Monster/Alien Avatare
- **`heads`** - Nur Roboter-Köpfe
- **`cats`** - Katzen-Avatare

```typescript
<UserAvatar
  userId={user.id}
  style="monsters" // Ändere den Style
  size={100}
/>
```

## 🔧 Anpassungen

### Größe ändern
```tsx
<UserAvatar userId={user.id} size={120} /> // Größerer Avatar
<UserAvatar userId={user.id} size={40} />  // Kleiner Avatar
```

### Border ändern/entfernen
```tsx
<UserAvatar 
  userId={user.id} 
  showBorder={false} // Kein Border
/>

<UserAvatar 
  userId={user.id} 
  borderColor="#EC4899" // Pink border
/>
```

### Custom Avatar URL (zukünftig)
```tsx
<UserAvatar 
  userId={user.id} 
  customUrl="https://example.com/avatar.jpg" // Überschreibt RoboHash
/>
```

## 💡 Wie funktioniert RoboHash?

RoboHash generiert Bilder basierend auf einem String (z.B. User-ID):
- Gleicher String → Gleicher Avatar (immer)
- Verschiedene Strings → Verschiedene Avatare
- Keine Datenbank, keine Storage notwendig
- Kostenlos und schnell

### Beispiel URLs:
```
https://robohash.org/user-123?size=200x200&set=set1
https://robohash.org/user-456?size=200x200&set=set2
```

## 🚀 Vorteile

### Gegenüber Image Upload:
- ✅ Kein Storage-Kosten
- ✅ Keine Upload-Funktion notwendig
- ✅ Keine Bildverarbeitung/Kompression
- ✅ Keine Moderation nötig
- ✅ Sofort verfügbar für jeden User
- ✅ Konsistent und eindeutig

### Performance:
- ✅ CDN-basiert (schnell)
- ✅ Automatisches Caching
- ✅ Skalierbar ohne Limits

## 🎯 Wo verwendet

- ✅ **Profile Screen** - Großer Avatar (96px)
- ✅ **Dashboard** - Mittelgroßer Avatar (56px)
- 🔄 **Zukünftig:** Notifications, Comments, Chat, etc.

## 🔮 Zukünftige Erweiterungen

Wenn später Custom Uploads gewünscht sind:

1. User kann Optional eigenes Bild hochladen
2. `avatarUrl` wird in Datenbank gespeichert
3. Component zeigt Custom URL wenn vorhanden
4. Sonst Fallback zu RoboHash

```tsx
<UserAvatar
  userId={user.id}
  customUrl={user.avatarUrl} // Custom wenn vorhanden
  // Fallback zu RoboHash automatisch
/>
```

## 📝 Geänderte Dateien

- ✅ `types/user.ts` - avatarUrl hinzugefügt
- ✅ `lib/utils/avatar.ts` - **NEU** - Avatar Utils
- ✅ `components/ui/user-avatar.tsx` - **NEU** - Avatar Component
- ✅ `app/(tabs)/profile.tsx` - Avatar integriert
- ✅ `app/(tabs)/index.tsx` - Avatar im Dashboard

## 🎉 Fertig!

Jeder User hat jetzt automatisch einen eindeutigen Avatar!
Keine Uploads, keine Storage-Kosten, sofort einsatzbereit! 🤖
