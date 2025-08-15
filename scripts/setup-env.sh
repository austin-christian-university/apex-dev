#!/bin/bash

# ACU Blueprint Environment Setup Script
# This script helps set up environment variables for the monorepo

echo "🚀 Setting up environment variables for ACU Blueprint..."

# Check if .env.local already exists in web app
if [ -f "apps/web/.env.local" ]; then
    echo "⚠️  apps/web/.env.local already exists. Skipping..."
else
    echo "📝 Creating apps/web/.env.local from template..."
    cp env.template apps/web/.env.local
    echo "✅ Created apps/web/.env.local"
    echo "📋 Please edit apps/web/.env.local with your Supabase credentials"
fi

# Check if .env.local already exists in mobile app
if [ -f "apps/mobile/.env.local" ]; then
    echo "⚠️  apps/mobile/.env.local already exists. Skipping..."
else
    echo "📝 Creating apps/mobile/.env.local from template..."
    cp env.template apps/mobile/.env.local
    echo "✅ Created apps/mobile/.env.local"
    echo "📋 Please edit apps/mobile/.env.local with your credentials"
fi

echo ""
echo "🎯 Next steps:"
echo "1. Edit apps/web/.env.local with your Supabase credentials"
echo "2. Edit apps/mobile/.env.local if needed"
echo "3. Run 'pnpm dev' in apps/web to start development"
echo ""
echo "📚 Environment variable locations:"
echo "   - Web app: apps/web/.env.local"
echo "   - Mobile app: apps/mobile/.env.local"
echo "   - Template: env.template" 