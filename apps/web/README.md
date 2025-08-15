# ACU Blueprint Web App

A comprehensive student development platform built with Next.js 15, Supabase, and Shadcn/ui.

## Features

- **Authentication**: Supabase Auth with email/password and OAuth support
- **Protected Routes**: Middleware-based route protection
- **Modern UI**: Shadcn/ui components with ACU brand styling
- **Type Safety**: Full TypeScript support
- **Responsive Design**: Mobile-first approach

## Setup

### 1. Environment Variables

**Option A: Use the setup script (Recommended)**
```bash
# From the root directory
./scripts/setup-env.sh
```

**Option B: Manual setup**
```bash
# Copy the template to your web app
cp ../../env.template .env.local
```

Fill in your Supabase credentials in `apps/web/.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (optional)

### 2. Supabase Project Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and keys
3. Configure authentication providers in Authentication > Providers
4. Set up email templates in Authentication > Email Templates

### 3. Database Schema

The auth system is ready for future database integration. You can extend it with:

- User profiles table
- Student records table
- Academic scores table
- Financial records table

### 4. Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## Environment Variables in Monorepo

This project uses **app-specific environment files** for better security and flexibility:

- **Web App**: `apps/web/.env.local` (for Supabase credentials)
- **Mobile App**: `apps/mobile/.env.local` (for mobile-specific vars)
- **Template**: `env.template` (reference for all variables)

**Why app-specific .env files?**
- ✅ Better security (each app only has access to its own vars)
- ✅ Easier deployment (each app can be deployed independently)
- ✅ Clear separation of concerns
- ✅ Follows Next.js best practices

## Authentication Flow

### Current Implementation
- Email/password authentication
- Protected routes with middleware
- Server-side session management
- Automatic redirects for unauthenticated users

### Future Enhancements
- Microsoft OAuth integration for school accounts
- Role-based access control (Admin, Student, Faculty)
- Multi-factor authentication
- Password reset functionality

## Project Structure

```
apps/web/
├── app/
│   ├── auth/
│   │   ├── actions.ts          # Server actions for auth
│   │   └── callback/
│   │       └── route.ts        # OAuth callback handler
│   ├── dashboard/
│   │   └── page.tsx            # Protected dashboard
│   ├── login/
│   │   └── page.tsx            # Login/signup page
│   ├── error/
│   │   └── page.tsx            # Error page
│   └── layout.tsx              # Root layout
├── lib/
│   └── supabase/
│       ├── client.ts           # Browser client
│       ├── server.ts           # Server client
│       └── middleware.ts       # Middleware utilities
├── middleware.ts               # Next.js middleware
├── .env.local                  # Environment variables (create this)
└── globals.css                 # Global styles with ACU branding
```

## Styling

The app uses ACU's brand colors and typography:

- **Primary**: ACU Black (#231F20)
- **Secondary**: ACU Navy (#1F2F3D)
- **Accent**: ACU Green (#005600)
- **Typography**: Mona Sans (Google Fonts)

## Deployment

The app is ready for deployment on Vercel, Netlify, or any Next.js-compatible platform. Make sure to:

1. Set environment variables in your deployment platform
2. Configure Supabase project settings for production
3. Set up custom domains if needed

## Contributing

1. Follow the monorepo structure
2. Use TypeScript for all new code
3. Follow the established component patterns
4. Test authentication flows thoroughly