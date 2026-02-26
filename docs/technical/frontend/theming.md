# Frontend Theming System

**Project**: Urban Home School (The Bird AI) / Urban Bird v1
**CSS Framework**: Tailwind CSS v3 with custom configuration
**Last Updated**: 2026-02-15

---

## Overview

The theming system is built on:
1. **Tailwind CSS** with custom color palette and dark mode support
2. **Zustand `useThemeStore`** for theme state management
3. **CSS class strategy** (`darkMode: 'class'`) for dark/light switching
4. **Custom "copilot" brand colors** with full shade scales (50-900)

---

## Tailwind CSS Configuration

**File**: `frontend/tailwind.config.js`

### Dark Mode Strategy

```javascript
darkMode: 'class'  // Toggled via 'dark' class on <html> element
```

The `class` strategy means dark mode is controlled programmatically by adding/removing the `dark` class on `document.documentElement`, rather than relying solely on the OS `prefers-color-scheme` media query.

### Content Paths

```javascript
content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
]
```

### Custom Color Palette - "Copilot" Brand Colors

Six custom color scales are defined, each with shades from 50 (lightest) to 900 (darkest):

#### copilot-blue
Primary brand color for interactive elements and primary actions.

| Shade | Hex | Usage |
|-------|-----|-------|
| 50 | `#e6f4ff` | Light backgrounds, hover states |
| 100 | `#b3d9ff` | Subtle backgrounds |
| 200 | `#80c0ff` | Borders, dividers |
| 300 | `#4da6ff` | Secondary accents |
| 400 | `#1a8cff` | Active states |
| 500 | `#0078d4` | **Primary brand blue** |
| 600 | `#0066b3` | Hover on primary |
| 700 | `#005291` | Active/pressed states |
| 800 | `#003d6f` | Dark mode accents |
| 900 | `#00294d` | Dark mode text on light bg |

#### copilot-cyan
Used for informational elements and secondary accents.

| Shade | Hex |
|-------|-----|
| 50 | `#e6f7ff` |
| 100 | `#b3e6ff` |
| 200 | `#80d4ff` |
| 300 | `#4dc3ff` |
| 400 | `#1aa1ff` |
| 500 | `#0078d4` |
| 600 | `#0066b3` |
| 700 | `#005291` |
| 800 | `#003d6f` |
| 900 | `#00294d` |

#### copilot-green
Used for success states, positive metrics, and growth indicators.

| Shade | Hex |
|-------|-----|
| 50 | `#e6ffe6` |
| 100 | `#b3ffb3` |
| 200 | `#80ff80` |
| 300 | `#4dff4d` |
| 400 | `#1aff1a` |
| 500 | `#00cc00` |
| 600 | `#00aa00` |
| 700 | `#008800` |
| 800 | `#006600` |
| 900 | `#004400` |

#### copilot-purple
Used for AI features, premium content, and creative elements.

| Shade | Hex |
|-------|-----|
| 50 | `#f0e6ff` |
| 100 | `#d9b3ff` |
| 200 | `#c280ff` |
| 300 | `#ab4dff` |
| 400 | `#941aff` |
| 500 | `#7800d4` |
| 600 | `#6600b3` |
| 700 | `#520091` |
| 800 | `#3d006f` |
| 900 | `#29004d` |

#### copilot-orange
Used for warnings, attention-requiring items, and highlights.

| Shade | Hex |
|-------|-----|
| 50 | `#fff0e6` |
| 100 | `#ffd9b3` |
| 200 | `#ffc280` |
| 300 | `#ffab4d` |
| 400 | `#ff941a` |
| 500 | `#ff7800` |
| 600 | `#d46600` |
| 700 | `#b35200` |
| 800 | `#8f3d00` |
| 900 | `#6f2900` |

#### copilot-teal
Used for secondary actions, labels, and feature-specific accents.

| Shade | Hex |
|-------|-----|
| 50 | `#e6fffb` |
| 100 | `#b3fff5` |
| 200 | `#80ffef` |
| 300 | `#4dffea` |
| 400 | `#1affe4` |
| 500 | `#00d4c8` |
| 600 | `#00b3a6` |
| 700 | `#009185` |
| 800 | `#006f64` |
| 900 | `#004d42` |

### Custom Box Shadows

```javascript
boxShadow: {
  'copilot-lg':    '0 10px 25px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
  'copilot-xl':    '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
  'copilot-2xl':   '0 25px 50px -12px rgba(0,0,0,0.25)',
  'copilot-inner': 'inset 0 2px 4px 0 rgba(0,0,0,0.06)',
}
```

### Custom Animations

```javascript
animation: {
  'fade-in':       'fadeIn 0.3s ease-in-out',
  'slide-in-left': 'slideInLeft 0.3s ease-out',
  'pulse-slow':    'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
},
keyframes: {
  fadeIn: {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  },
  slideInLeft: {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(0)' },
  },
}
```

### Custom Backdrop Blur

```javascript
backdropBlur: {
  'xs': '2px',
}
```

---

## Theme State Management

**Store**: `useThemeStore` (defined in `frontend/src/store/index.ts`)

### State Shape

```typescript
interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  isDarkMode: boolean;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
}
```

### Theme Switching Logic

The `setTheme` action:
1. Updates the store state
2. Adds/removes `'light'` or `'dark'` class on `document.documentElement`
3. For `'system'` mode, checks `window.matchMedia('(prefers-color-scheme: dark)')` and applies the result
4. Persists the choice to `localStorage.theme`

```typescript
setTheme: (theme) => {
  set({ theme });
  const root = window.document.documentElement;
  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    root.classList.remove('light', 'dark');
    root.classList.add(systemTheme);
    set({ isDarkMode: systemTheme === 'dark' });
  } else {
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    set({ isDarkMode: theme === 'dark' });
  }
  localStorage.setItem('theme', theme);
}
```

### Initialization

The `initializeTheme()` function is called in `DashboardLayout` on mount:

```typescript
export const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
  useThemeStore.getState().setTheme(savedTheme || 'dark');
};
```

**Default theme**: `'dark'` (if no saved preference exists).

### System Theme Change Listener

The store automatically listens for OS-level theme changes:

```typescript
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  const themeStore = useThemeStore.getState();
  if (themeStore.theme === 'system') {
    const newTheme = e.matches ? 'dark' : 'light';
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(newTheme);
    themeStore.setTheme(newTheme);
  }
});
```

This only activates when the user has selected `'system'` as their theme preference.

---

## Component Styling Patterns

### Dark Mode Classes

Components use Tailwind's `dark:` prefix for dark mode variants:

```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  <h1 className="text-copilot-blue-600 dark:text-copilot-blue-400">Title</h1>
</div>
```

### Dashboard Background Gradient

The `DashboardLayout` applies a gradient background that switches between light and dark:

```tsx
<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0F1112] dark:to-[#181C1F] transition-colors duration-200">
```

### Transition on Theme Change

The `transition-colors duration-200` utility ensures smooth color transitions when switching themes.

### Brand Color Usage Conventions

| Color Family | Primary Use Case |
|-------------|-----------------|
| `copilot-blue` | Primary actions, links, active states, CoPilot UI |
| `copilot-cyan` | Informational badges, secondary links |
| `copilot-green` | Success states, progress indicators, growth metrics |
| `copilot-purple` | AI features, premium content, creative tools |
| `copilot-orange` | Warnings, urgent items, attention badges |
| `copilot-teal` | Labels, tags, secondary actions |

### Using Custom Shadows

```tsx
<div className="shadow-copilot-lg dark:shadow-none">Card content</div>
<div className="shadow-copilot-xl hover:shadow-copilot-2xl transition-shadow">Elevated card</div>
```

### Using Custom Animations

```tsx
<div className="animate-fade-in">Fading in content</div>
<aside className="animate-slide-in-left">Sliding sidebar</aside>
<div className="animate-pulse-slow">Slow pulsing indicator</div>
```

---

## Integration with DashboardLayout

The `DashboardLayout` component integrates theming at the layout level:

1. **Imports `useThemeStore`** to access current theme
2. **Calls `initializeTheme()`** on mount via `useEffect`
3. **Syncs theme to `useUserStore.preferences`** when theme changes
4. **Applies dark mode gradient** as the root background

```typescript
// From DashboardLayout.tsx
const { theme } = useThemeStore();

useEffect(() => {
  initializeTheme();
}, []);

useEffect(() => {
  if (user) {
    updatePreferences({ theme });
  }
}, [theme, user, updatePreferences]);
```

---

## Plugins

No Tailwind CSS plugins are currently configured:

```javascript
plugins: []
```

The project relies on Tailwind's built-in utilities and custom `extend` configuration for all styling needs.
