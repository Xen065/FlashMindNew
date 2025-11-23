# FlashMind Design System

## Modern Glassmorphism with Dual-Theme Support

This document describes the comprehensive design system implemented for FlashMind, featuring a modern glassmorphism aesthetic with dual-theme support (Light "Fresh Mint" + Dark "True Dark").

---

## 🎨 Design Philosophy

- **Modern glassmorphism aesthetic** with blur effects
- **Dual-theme support** (Light & Dark modes)
- **Smooth animations** and micro-interactions
- **Mobile-first** responsive design
- **System font stack** for optimal performance
- **Zero external dependencies** - Pure vanilla CSS

---

## 🏗️ Architecture

### CSS File Structure

```
frontend/src/
├── index.css              # Global design tokens, base styles, component patterns
├── App.css                # App-specific styles
├── components/
│   ├── Navigation.css     # Navigation component styles
│   ├── ThemeToggle.css    # Theme toggle button styles
│   └── [other].css        # Component-specific styles
└── pages/
    └── [page].css         # Page-specific styles
```

### Key Principles

1. **Component-scoped CSS** - One CSS file per component
2. **CSS Custom Properties** - All theming uses CSS variables
3. **No CSS Frameworks** - Pure vanilla CSS only
4. **Glassmorphism** - `backdrop-filter: blur(15px)` on all surfaces
5. **Smooth Transitions** - `cubic-bezier(0.4, 0, 0.2, 1)` easing

---

## 🌈 Color System

### Light Mode (Fresh Mint Theme)

```css
/* Gradient Backgrounds */
--bg-gradient-start: #E8F5F1;    /* Mint */
--bg-gradient-mid: #D4EDE7;      /* Light Mint */
--bg-gradient-end: #B8E6DC;      /* Seafoam */

/* Primary Colors */
--primary-color: #10B981;         /* Emerald Green */
--primary-color-light: #14B8A6;   /* Teal */

/* Surfaces */
--card-bg: rgba(255, 255, 255, 0.85);
--card-border: rgba(16, 185, 129, 0.2);

/* Text */
--text-primary: #1F2937;          /* Dark Gray */
--text-secondary: #4B5563;        /* Medium Gray */
```

### Dark Mode (True Dark Theme)

```css
/* Dark Gradients */
--bg-gradient-start: #0a0e27;     /* Very Dark Blue */
--bg-gradient-mid: #16213e;       /* Dark Blue */
--bg-gradient-end: #1a1a2e;       /* Dark Navy */

/* Primary Colors */
--primary-color: #05BFDB;         /* Bright Cyan */
--primary-color-light: #00D9FF;   /* Light Cyan */

/* Surfaces */
--card-bg: rgba(255, 255, 255, 0.05);
--card-border: rgba(5, 191, 219, 0.2);

/* Text */
--text-primary: rgba(255, 255, 255, 0.95);
--text-secondary: rgba(255, 255, 255, 0.75);
```

### Accent Colors

- **Error**: `#DC2626`, `#ff6b6b`
- **Success**: `#4CAF50`
- **Info**: `#2196F3`
- **Warning**: `#FF9800`
- **Gold**: `#ffd700`

---

## 📝 Typography

### Font Stack

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
```

### Type Scale

- **H1**: 2.75rem (44px), weight: 700
- **H2**: 2rem (32px), weight: 700
- **H3**: 1.5rem (24px), weight: 600
- **H4**: 1.25rem (20px), weight: 600
- **Body**: 1rem (16px), weight: 400
- **Line heights**: 1.2-1.6

---

## 🧩 Component Patterns

### Card (Glassmorphism)

```css
.card {
  background: var(--card-bg);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid var(--card-border);
  box-shadow: var(--shadow-md);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card:hover {
  transform: translateY(-5px) scale(1.02);
  border-color: var(--card-border-hover);
  box-shadow: var(--shadow-lg);
}
```

### Primary Button (with Shine Effect)

```css
.btn-primary {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color-light) 100%);
  color: white;
  padding: 1rem 2rem;
  border-radius: 12px;
  box-shadow: var(--shadow-primary);
  /* Includes shine effect on hover */
}
```

### Form Inputs

```css
input, textarea, select {
  padding: 1rem 1.25rem;
  border: 2px solid var(--input-border);
  border-radius: 12px;
  background: var(--input-bg);
  /* Includes lift effect on focus */
}
```

### Badge/Tag

```css
.badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background: rgba(16, 185, 129, 0.25);
  border: 1px solid rgba(16, 185, 129, 0.4);
}
```

---

## 🎭 Theme Switching

### Implementation

The theme switching is handled by the `ThemeToggle` component:

```javascript
// Toggles .dark-mode class on document root
document.documentElement.classList.toggle('dark-mode');

// Persists to localStorage
localStorage.setItem('theme', isDark ? 'dark' : 'light');
```

### User Experience

- **Fixed floating button** in bottom-right corner
- **Sun/Moon icons** indicate current theme
- **Smooth transition** (0.5s) between themes
- **localStorage persistence** remembers user preference
- **System preference detection** on first visit

---

## 📐 Layout Patterns

### Container

```css
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}
```

### Grid System

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}
```

### Flex Container

```css
.flex-container {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}
```

---

## ✨ Animations

### Available Animations

- `fadeIn` - Simple fade in
- `fadeInUp` - Fade in with upward movement
- `slideIn` - Slide in from top with scale
- `slideInModal` - Modal-specific slide in
- `bounce` - Continuous bouncing
- `spin` - 360° rotation
- `pulse` - Scale and opacity pulse

### Usage

```css
/* Apply via utility classes */
.animate-fadeIn { animation: fadeIn 0.5s ease; }
.animate-slideIn { animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
```

---

## 📱 Responsive Design

### Breakpoints

- **Desktop**: Default styles
- **Tablet**: `@media (max-width: 768px)`
- **Mobile**: `@media (max-width: 480px)`

### Mobile-First Principles

- **Touch targets**: Minimum 44px (tablet), 48-56px (mobile)
- **Font size**: 16px on inputs (prevents iOS zoom)
- **Padding**: Reduced on smaller screens
- **Navigation**: Stacks vertically on mobile

---

## 🎯 Utility Classes

### Spacing

```css
.mt-1, .mt-2, .mt-3, .mt-4  /* Margin top */
.mb-1, .mb-2, .mb-3, .mb-4  /* Margin bottom */
.p-1, .p-2, .p-3, .p-4      /* Padding */
```

### Text

```css
.text-center      /* Center align */
.text-primary     /* Primary color */
.text-secondary   /* Secondary color */
```

---

## ♿ Accessibility

### Focus States

All interactive elements have visible focus indicators:

```css
*:focus-visible {
  outline: 3px solid var(--primary-color);
  outline-offset: 2px;
}
```

### Features

- **Keyboard navigation** fully supported
- **ARIA labels** on theme toggle
- **Color contrast** meets WCAG AA standards
- **Touch targets** meet iOS/Android guidelines
- **Screen reader** friendly structure

---

## 🚀 Performance

### Optimizations

- **System fonts** - No web font loading
- **CSS variables** - Efficient theme switching
- **Minimal CSS** - No framework overhead
- **Hardware acceleration** - `transform` and `opacity` animations
- **Backdrop filter** - GPU-accelerated blur effects

---

## 📦 Component Inventory

### Implemented Components

- ✅ **Navigation** - Sticky glassmorphism nav bar
- ✅ **ThemeToggle** - Floating theme switcher
- ✅ **Cards** - Glassmorphism surfaces
- ✅ **Buttons** - Primary, secondary, ghost variants
- ✅ **Forms** - Inputs, textareas, selects
- ✅ **Badges** - Success, error, warning, info
- ✅ **Alerts** - Error, success, info, warning messages
- ✅ **Modals** - Glassmorphism overlays
- ✅ **Loading** - Spinner with animation

---

## 🎨 Customization Guide

### Adding New Colors

1. Add to `:root` for light mode
2. Add to `.dark-mode` for dark mode
3. Use `var(--your-color)` in components

### Creating New Components

1. Create component-specific CSS file
2. Use existing design tokens
3. Apply glassmorphism pattern:
   ```css
   background: var(--card-bg);
   backdrop-filter: blur(15px);
   border: 1px solid var(--card-border);
   ```
4. Add smooth transitions
5. Ensure responsive behavior

### Modifying Animations

Edit keyframes in `index.css` or create new ones following the cubic-bezier easing pattern.

---

## 🔧 Browser Support

- **Chrome/Edge**: Full support (including backdrop-filter)
- **Firefox**: Full support
- **Safari**: Full support (with `-webkit-` prefixes)
- **Mobile browsers**: Full support on iOS/Android

---

## 📝 Best Practices

1. **Always use CSS variables** for colors and spacing
2. **Apply glassmorphism** to all card/surface elements
3. **Use smooth transitions** on interactive elements
4. **Test both themes** when adding new styles
5. **Maintain mobile-first** approach
6. **Keep touch targets** at minimum 44-56px
7. **Use semantic HTML** for accessibility
8. **Leverage utility classes** before creating custom styles

---

## 🎓 Examples

### Creating a Custom Card

```css
.my-custom-card {
  background: var(--card-bg);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid var(--card-border);
  box-shadow: var(--shadow-md);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.my-custom-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}
```

### Adding a New Theme Color

```css
:root {
  --my-new-color: #yourcolor;
}

.dark-mode {
  --my-new-color: #darkvariant;
}
```

---

## 📚 Resources

- **Glassmorphism**: Modern UI trend using frosted glass effect
- **CSS Variables**: Dynamic theming with CSS custom properties
- **Cubic Bezier**: Smooth, natural easing functions
- **Mobile-First**: Progressive enhancement from mobile up

---

## 🤝 Contributing

When adding new styles:

1. Follow existing naming conventions
2. Use design tokens (CSS variables)
3. Test in both light and dark modes
4. Ensure mobile responsiveness
5. Add smooth transitions
6. Document new patterns in this guide

---

**Last Updated**: November 2025
**Version**: 1.0.0
