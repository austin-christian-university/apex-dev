# Global Styling System - Simplified

A clean, minimal approach to global styling using your brand colors with Google's Roboto font.

## Color Palette

Your app uses a **dark-first design** with these colors:

### 🎨 Brand Colors
- **Soft Black**: `#0A0D11` - Primary background
- **Almost White**: `#FFFAF0` - Primary text 
- **Light Blue**: `#A1C6E9` - Accent highlights

### 🌙 Dark Theme (Default)
```css
--background: 220 13% 6%;              /* #0A0D11 - Soft Black */
--foreground: 210 20% 98%;             /* #FFFAF0 - Almost White */
--primary: 210 20% 98%;                /* Almost White for buttons */
--secondary: 210 40% 76%;              /* #A1C6E9 - Light Blue */
--accent: 210 40% 76%;                 /* #A1C6E9 - Light Blue */
```

### ☀️ Light Theme (Alternative)
```css
--background: 210 20% 98%;             /* #FFFAF0 - Almost White */
--foreground: 220 13% 6%;              /* #0A0D11 - Soft Black */
--primary: 220 13% 6%;                 /* Soft Black for buttons */
--secondary: 210 40% 76%;              /* #A1C6E9 - Light Blue */
--accent: 210 40% 76%;                 /* #A1C6E9 - Light Blue */
```

## Typography

### 🔤 Font Family
- **Primary**: Google's Roboto (clean, modern sans-serif)
- **Fallbacks**: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif

## Usage Examples

### Basic Layout
```jsx
<div className="bg-background text-foreground">
  <h1 className="text-3xl font-bold">Page Title</h1>
  <p className="text-muted-foreground">Subtitle text</p>
</div>
```

### Cards
```jsx
<div className="bg-card text-card-foreground p-6 rounded-lg border">
  <h2 className="text-xl font-semibold">Card Title</h2>
  <p className="text-muted-foreground">Card description</p>
</div>
```

### Buttons
```jsx
<button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg">
  Primary Button
</button>

<button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg">
  Secondary Button  
</button>

<button className="bg-accent text-accent-foreground px-4 py-2 rounded-lg">
  Accent Button
</button>
```

## Available Tailwind Classes

### Colors
- `bg-background` / `text-foreground` - Main page colors
- `bg-card` / `text-card-foreground` - Card backgrounds
- `bg-primary` / `text-primary-foreground` - Primary actions
- `bg-secondary` / `text-secondary-foreground` - Secondary actions  
- `bg-accent` / `text-accent-foreground` - Accent highlights
- `bg-muted` / `text-muted-foreground` - Subtle/disabled states
- `bg-destructive` / `text-destructive-foreground` - Error states

### Borders & Effects
- `border` - Standard border using theme color
- `rounded-lg` - Standard border radius
- `shadow-sm` / `shadow-md` / `shadow-lg` - Elevation

## Making Changes

### Update Colors
Edit `apps/web/app/globals.css` and modify the CSS custom properties:

```css
:root {
  --background: 220 13% 6%;              /* Change background */
  --foreground: 210 20% 98%;             /* Change text */
  --primary: 210 20% 98%;                /* Change primary color */
  --secondary: 210 40% 76%;              /* Change secondary color */
}
```

### Switch to Light Mode
Add the `.light` class to your `<html>` or `<body>` element:

```jsx
<html className="light">
  <body>...</body>
</html>
```

## Component Examples

Check out `/test` to see the color system in action with:
- Background and text colors
- Card components
- Button variations
- Interactive states

## Benefits

✅ **Simple**: Just a few CSS variables, no complex overrides
✅ **Consistent**: All components use the same color tokens  
✅ **Flexible**: Easy to adjust colors globally
✅ **Standard**: Uses normal Tailwind classes
✅ **Maintainable**: Clear structure, easy to understand 