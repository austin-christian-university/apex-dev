# Microsoft Login Screen Branding Setup

## Overview
Customize the Microsoft OAuth login screen to match your dark theme and branding.

## Prerequisites
- Azure AD Administrator access
- Your ace logo files
- Background images (optional)

## Setup Steps

### 1. Access Azure AD Admin Center
1. Go to [Microsoft Entra Admin Center](https://entra.microsoft.com/)
2. Sign in with your admin account
3. Navigate to **Identity** → **User experiences** → **Company branding**

### 2. Basic Configuration

**Background Settings:**
- **Background Color**: `#111827` (matches your app's dark theme)
- **Background Image**: Upload a dark-themed background (1920x1080px recommended)
- **Layout**: Choose "Full-screen background"

**Logo Settings:**
- **Banner Logo**: Upload your ace logo (280x60px, PNG format)
- **Square Logo**: Upload square version (240x240px for tiles)
- **Favicon**: Upload 16x16px version for browser tab

### 3. Custom CSS for Dark Theme

Create a CSS file with these dark theme customizations:

```css
/* Main container dark theme */
.ext-sign-in-box {
  background-color: #1f2937 !important;
  border: 1px solid #374151 !important;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3) !important;
}

/* Text colors */
.normalText, .placeholderText, .title {
  color: #f9fafb !important;
}

.win-subtitle {
  color: #d1d5db !important;
}

/* Button styling */
.win-button-pin-background {
  background-color: #3b82f6 !important;
  border-color: #3b82f6 !important;
}

.win-button-pin-background:hover {
  background-color: #2563eb !important;
}

/* Input fields */
input[type="email"], input[type="password"], input[type="text"] {
  background-color: #374151 !important;
  border-color: #6b7280 !important;
  color: #f9fafb !important;
}

input[type="email"]:focus, input[type="password"]:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 1px #3b82f6 !important;
}

/* Links */
a {
  color: #60a5fa !important;
}

a:hover {
  color: #3b82f6 !important;
}

/* Error messages */
.error {
  color: #fca5a5 !important;
}

/* Keep Microsoft branding but darken */
.microsoft-logo {
  filter: brightness(0.9);
}
```

### 4. Upload and Apply

1. **Upload CSS File**: In the "Layout" section, upload your dark-theme.css file
2. **Set Text**: Add custom sign-in text if desired
3. **Review**: Check the preview to ensure it looks good
4. **Save**: Apply the changes

### 5. Testing

Test the customization by:
1. Opening an incognito/private browser window
2. Initiating the Microsoft login flow from your app
3. Verifying the dark theme appears correctly

## Alternative Approach: Query Parameters

You can also influence the login experience with URL parameters:

```typescript
// In your Microsoft auth URL
const authUrl = new URL(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`)
authUrl.searchParams.set('response_type', 'code')
// ... other params
authUrl.searchParams.set('prompt', 'select_account') // Force account selection
authUrl.searchParams.set('domain_hint', 'organizations') // Hint for org accounts
```

## Limitations

- **Tenant-wide**: Branding applies to all apps in your tenant
- **Microsoft Elements**: Core Microsoft UI elements can't be completely removed
- **CSS Specificity**: Some styles may require `!important` to override defaults

## Best Practices

1. **Test Thoroughly**: Check on different devices and browsers
2. **Accessibility**: Ensure contrast ratios meet WCAG guidelines
3. **Fallbacks**: Always set background colors as fallbacks for images
4. **Brand Consistency**: Match your app's color palette and typography

## Resources

- [Microsoft Entra Branding Documentation](https://learn.microsoft.com/en-us/entra/fundamentals/how-to-customize-branding)
- [CSS Class Reference](https://docs.microsoft.com/en-us/azure/active-directory/develop/howto-add-branding-in-azure-ad-apps)
