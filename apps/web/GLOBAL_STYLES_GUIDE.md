# Global Styling System Guide

This document provides a comprehensive guide to the ACU Apex global styling system, designed for easy brand adjustments and consistent design across all components.

## Overview

The global styling system uses CSS custom properties (CSS variables) to create a single source of truth for all design tokens. This enables:

- **Easy brand updates**: Change colors, fonts, spacing in one place
- **Consistent design**: All components follow the same design system
- **Maintainable code**: Clear structure makes updates straightforward
- **Scalable architecture**: Easy to add new components and styles

## File Structure

```
apps/web/
├── app/
│   └── globals.css          # Main global styles with CSS custom properties
├── tailwind.config.js       # Tailwind configuration using global variables
└── GLOBAL_STYLES_GUIDE.md   # This documentation file
```

## Design Tokens

### Color System

#### Brand Colors
```css
--color-brand-primary: 231 4% 13%;      /* #231F20 - ACU Black */
--color-brand-secondary: 213 31% 18%;   /* #1F2F3D - ACU Navy */
--color-brand-accent: 146 100% 17%;     /* #005600 - ACU Green */
--color-brand-neutral: 34 51% 39%;      /* #976231 - ACU Bronze */
--color-brand-white: 0 0% 100%;         /* #FFFFFF - Pure White */
--color-brand-error: 350 77% 22%;       /* #6b0e18 - ACU Maroon */
```

#### Semantic Colors
```css
--color-background: rgb(var(--color-brand-white));
--color-foreground: rgb(var(--color-brand-primary));
--color-primary: rgb(var(--color-brand-primary));
--color-secondary: rgb(var(--color-brand-secondary));
--color-accent: rgb(var(--color-brand-accent));
--color-muted: rgb(var(--color-brand-neutral));
--color-destructive: rgb(var(--color-brand-error));
```

#### Status Colors
```css
--color-success: 142 76% 36%;           /* #16a34a - Success Green */
--color-warning: 38 92% 50%;            /* #f59e0b - Warning Amber */
--color-info: 221 83% 53%;              /* #3b82f6 - Info Blue */
```

### Typography System

#### Font Families
```css
--font-family-primary: 'Mona Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-family-secondary: 'Superior Text', Georgia, serif;
--font-family-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
```

#### Font Sizes (Modular Scale - 1.25 ratio)
```css
--font-size-xs: 0.75rem;      /* 12px */
--font-size-sm: 0.875rem;     /* 14px */
--font-size-base: 1rem;       /* 16px */
--font-size-lg: 1.125rem;     /* 18px */
--font-size-xl: 1.25rem;      /* 20px */
--font-size-2xl: 1.5rem;      /* 24px */
--font-size-3xl: 1.875rem;    /* 30px */
--font-size-4xl: 2.25rem;     /* 36px */
--font-size-5xl: 3rem;        /* 48px */
--font-size-6xl: 3.75rem;     /* 60px */
```

#### Font Weights
```css
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--font-weight-extrabold: 800;
```

#### Line Heights
```css
--line-height-tight: 1.25;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;
--line-height-loose: 2;
```

#### Letter Spacing
```css
--letter-spacing-tight: -0.025em;
--letter-spacing-normal: 0;
--letter-spacing-wide: 0.025em;
--letter-spacing-wider: 0.05em;
```

### Spacing System

#### Base Spacing Unit: 4px
```css
--spacing-0: 0;
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-3: 0.75rem;   /* 12px */
--spacing-4: 1rem;      /* 16px */
--spacing-5: 1.25rem;   /* 20px */
--spacing-6: 1.5rem;    /* 24px */
--spacing-8: 2rem;      /* 32px */
--spacing-10: 2.5rem;   /* 40px */
--spacing-12: 3rem;     /* 48px */
--spacing-16: 4rem;     /* 64px */
--spacing-20: 5rem;     /* 80px */
--spacing-24: 6rem;     /* 96px */
--spacing-32: 8rem;     /* 128px */
```

#### Component-Specific Spacing
```css
--spacing-page: var(--spacing-6);
--spacing-section: var(--spacing-12);
--spacing-card: var(--spacing-6);
--spacing-button: var(--spacing-3) var(--spacing-6);
--spacing-input: var(--spacing-3) var(--spacing-4);
```

### Border System

#### Border Radius
```css
--radius-none: 0;
--radius-sm: 0.125rem;   /* 2px */
--radius-base: 0.25rem;  /* 4px */
--radius-md: 0.375rem;   /* 6px */
--radius-lg: 0.5rem;     /* 8px */
--radius-xl: 0.75rem;    /* 12px */
--radius-2xl: 1rem;      /* 16px */
--radius-full: 9999px;
```

#### Border Widths
```css
--border-width-0: 0;
--border-width-1: 1px;
--border-width-2: 2px;
--border-width-4: 4px;
--border-width-8: 8px;
```

### Shadow System

#### Elevation Levels
```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
--shadow-focus: 0 0 0 3px rgb(var(--color-ring-focus) / 0.5);
```

### Transition System

#### Duration
```css
--duration-75: 75ms;
--duration-100: 100ms;
--duration-150: 150ms;
--duration-200: 200ms;
--duration-300: 300ms;
--duration-500: 500ms;
--duration-700: 700ms;
--duration-1000: 1000ms;
```

#### Easing
```css
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

#### Common Transitions
```css
--transition-fast: var(--duration-150) var(--ease-out);
--transition-base: var(--duration-200) var(--ease-out);
--transition-slow: var(--duration-300) var(--ease-out);
```

### Layout System

#### Container Max Widths
```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;
```

#### Z-Index Scale
```css
--z-dropdown: 1000;
--z-sticky: 1020;
--z-fixed: 1030;
--z-modal-backdrop: 1040;
--z-modal: 1050;
--z-popover: 1060;
--z-tooltip: 1070;
--z-toast: 1080;
```

#### Breakpoints
```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

## Usage Examples

### Using CSS Custom Properties Directly

```css
.my-component {
  background-color: rgb(var(--color-background));
  color: rgb(var(--color-foreground));
  font-family: var(--font-family-primary);
  font-size: var(--font-size-base);
  padding: var(--spacing-4);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
}
```

### Using Tailwind Classes

```jsx
<div className="bg-background text-foreground font-primary text-base p-4 rounded-md shadow-sm transition-base">
  Content
</div>
```

### Component Examples

#### Card Component
```jsx
<div className="dashboard-card">
  <div className="card-header">
    <h3 className="card-title">Card Title</h3>
    <p className="card-description">Card description</p>
  </div>
  <div className="card">
    Card content
  </div>
</div>
```

#### Button Component
```jsx
<button className="button button-lg bg-primary text-primary-foreground hover:bg-primary/90">
  Primary Button
</button>
```

#### Navigation Item
```jsx
<a className="nav-item nav-item-active">
  Active Navigation
</a>
```

## Making Brand Updates

### Changing Colors

To update the brand colors, modify the values in `apps/web/app/globals.css`:

```css
:root {
  /* Update brand colors */
  --color-brand-primary: 220 13% 18%;      /* New primary color */
  --color-brand-secondary: 210 40% 20%;    /* New secondary color */
  --color-brand-accent: 120 100% 25%;      /* New accent color */
}
```

### Changing Typography

To update fonts, modify the font family variables:

```css
:root {
  /* Update font families */
  --font-family-primary: 'New Primary Font', sans-serif;
  --font-family-secondary: 'New Secondary Font', serif;
}
```

### Changing Spacing

To update the spacing scale, modify the spacing variables:

```css
:root {
  /* Update spacing scale */
  --spacing-4: 1.25rem;   /* Increase base spacing */
  --spacing-6: 2rem;      /* Adjust larger spacing */
}
```

### Changing Border Radius

To update border radius values:

```css
:root {
  /* Update border radius */
  --radius-md: 0.5rem;    /* Increase medium radius */
  --radius-lg: 0.75rem;   /* Adjust large radius */
}
```

## Dark Mode Support

The system includes comprehensive dark mode support. Dark mode styles are defined in the `.dark` class:

```css
.dark {
  --color-background: var(--color-brand-secondary);
  --color-foreground: var(--color-brand-white);
  --color-primary: var(--color-brand-white);
  --color-primary-foreground: var(--color-brand-primary);
  /* ... other dark mode overrides */
}
```

## Utility Classes

The system provides utility classes for common patterns:

### Typography Utilities
- `.text-xs`, `.text-sm`, `.text-base`, `.text-lg`, `.text-xl`, `.text-2xl`, `.text-3xl`, `.text-4xl`
- `.font-light`, `.font-normal`, `.font-medium`, `.font-semibold`, `.font-bold`, `.font-extrabold`
- `.font-primary`, `.font-secondary`, `.font-mono`
- `.tracking-tight`, `.tracking-normal`, `.tracking-wide`, `.tracking-wider`

### Spacing Utilities
- `.m-0`, `.m-1`, `.m-2`, `.m-3`, `.m-4`, `.m-5`, `.m-6`, `.m-8`, `.m-10`, `.m-12`, `.m-16`, `.m-20`, `.m-24`, `.m-32`
- `.p-0`, `.p-1`, `.p-2`, `.p-3`, `.p-4`, `.p-5`, `.p-6`, `.p-8`, `.p-10`, `.p-12`, `.p-16`, `.p-20`, `.p-24`, `.p-32`
- `.gap-0`, `.gap-1`, `.gap-2`, `.gap-3`, `.gap-4`, `.gap-5`, `.gap-6`, `.gap-8`, `.gap-10`, `.gap-12`, `.gap-16`, `.gap-20`, `.gap-24`, `.gap-32`

### Border Utilities
- `.rounded-none`, `.rounded-sm`, `.rounded`, `.rounded-md`, `.rounded-lg`, `.rounded-xl`, `.rounded-2xl`, `.rounded-full`
- `.border-0`, `.border`, `.border-2`, `.border-4`, `.border-8`

### Shadow Utilities
- `.shadow-none`, `.shadow-sm`, `.shadow`, `.shadow-md`, `.shadow-lg`, `.shadow-xl`, `.shadow-2xl`, `.shadow-focus`

### Transition Utilities
- `.transition-none`, `.transition-fast`, `.transition-base`, `.transition-slow`

### Layout Utilities
- `.container-sm`, `.container-md`, `.container-lg`, `.container-xl`, `.container-2xl`
- `.z-dropdown`, `.z-sticky`, `.z-fixed`, `.z-modal-backdrop`, `.z-modal`, `.z-popover`, `.z-tooltip`, `.z-toast`

## Component-Specific Classes

### Card Classes
- `.card-hover` - Hover effects for cards
- `.dashboard-card` - Dashboard card styling
- `.stat-card` - Statistics card styling
- `.card`, `.card-header`, `.card-title`, `.card-description`

### Navigation Classes
- `.nav-item`, `.nav-item-active`, `.nav-item-inactive`

### Table Classes
- `.data-table` - Data table styling

### Badge Classes
- `.badge-success`, `.badge-warning`, `.badge-info`, `.badge-danger`

### Progress Classes
- `.progress-container`, `.progress-bar`
- `.progress-bar-blue`, `.progress-bar-green`, `.progress-bar-amber`, `.progress-bar-violet`

### Form Classes
- `.form-label`, `.form-input`, `.form-select`, `.form-button`

### Button Classes
- `.button`, `.button-sm`, `.button-lg`

### Input Classes
- `.input`, `.select`

### Avatar Classes
- `.avatar`, `.avatar-fallback`

### Icon Classes
- `.icon-sm`, `.icon-md`, `.icon-lg`

### Score Button Classes
- `.score-btn`, `.score-btn-add`, `.score-btn-subtract`

## Best Practices

### 1. Use Semantic Names
Always use semantic names that describe purpose, not appearance:

```css
/* ✅ Good */
--color-primary: rgb(var(--color-brand-primary));
--color-success: 142 76% 36%;

/* ❌ Bad */
--color-black: rgb(var(--color-brand-primary));
--color-green: 142 76% 36%;
```

### 2. Reference Global Variables
Always reference global variables instead of hardcoding values:

```css
/* ✅ Good */
.my-component {
  padding: var(--spacing-4);
  border-radius: var(--radius-md);
}

/* ❌ Bad */
.my-component {
  padding: 1rem;
  border-radius: 0.375rem;
}
```

### 3. Use RGB Format for Colors
Use RGB format for colors to enable opacity modifications:

```css
/* ✅ Good */
background-color: rgb(var(--color-primary) / 0.1);

/* ❌ Bad */
background-color: var(--color-primary);
```

### 4. Maintain Consistency
Use the established patterns and avoid creating new variables unless necessary.

### 5. Test Dark Mode
Always test components in both light and dark modes to ensure proper contrast and readability.

## Troubleshooting

### Common Issues

1. **Colors not updating**: Ensure you're using the correct variable names and RGB format
2. **Spacing inconsistencies**: Check that you're using the spacing scale variables
3. **Font not loading**: Verify font family variables are correctly set
4. **Dark mode not working**: Check that dark mode variables are properly defined

### Debugging

Use browser dev tools to inspect CSS custom properties:

```javascript
// Check if a variable is set
getComputedStyle(document.documentElement).getPropertyValue('--color-primary')

// Set a variable for testing
document.documentElement.style.setProperty('--color-primary', '255 0 0')
```

## Future Enhancements

- [ ] Add more semantic color variations
- [ ] Implement color palette generator
- [ ] Add animation presets
- [ ] Create component variant system
- [ ] Add accessibility-focused utilities
- [ ] Implement design token export for design tools

## Resources

- [CSS Custom Properties MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Design Tokens Specification](https://design-tokens.github.io/community-group/format/)
- [CSS Color Module Level 4](https://www.w3.org/TR/css-color-4/) 