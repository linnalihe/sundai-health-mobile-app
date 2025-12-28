# Healthy Habits App - Setup Guide

Welcome to the Healthy Habits Coaching App! This guide will help you get started with setting up your development environment.

## ✅ Completed Phases

### Phase 1: Foundation & Setup ✓
- ✅ All dependencies installed
- ✅ TypeScript types defined
- ✅ Supabase client configured
- ✅ Database services created
- ✅ Constants and utilities set up

### Phase 2: Authentication Flow ✓
- ✅ Auth context with session management
- ✅ OAuth integration (Google, Facebook)
- ✅ Welcome screen with OAuth buttons
- ✅ Routing logic based on auth state
- ✅ Placeholder screens for next phases

## 🚀 Quick Start

### 1. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Then update the `.env` file with your actual credentials:

```env
# Supabase (Required to run the app)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key

# Stripe (Will be needed in Phase 3)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# AI APIs (Will be needed in Phase 7)
EXPO_PUBLIC_CLAUDE_API_KEY=sk-ant-xxxxx
EXPO_PUBLIC_GEMINI_API_KEY=xxxxx

# App Configuration
EXPO_PUBLIC_APP_ENV=development
```

### 2. Set Up Supabase Database

Follow the instructions in `DATABASE_SETUP.md` to:
1. Create your Supabase project
2. Run the SQL schema to create tables
3. Configure OAuth providers
4. Set up Row Level Security policies

### 3. Start the Development Server

```bash
npm start
```

Then choose your platform:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Press `w` for web

## 📁 Project Structure

```
sundai-health-app/
├── app/                          # Expo Router screens
│   ├── (auth)/                   # ✅ Authentication screens
│   │   ├── welcome.tsx           # OAuth login
│   │   ├── oauth-callback.tsx    # OAuth redirect handler
│   │   └── payment-setup.tsx     # 🔜 Phase 3
│   ├── (onboarding)/             # 🔜 Phase 4
│   │   ├── questionnaire.tsx
│   │   ├── preferences.tsx
│   │   └── tutorial.tsx
│   ├── (tabs)/                   # 🔜 Phases 5-8
│   │   ├── chat.tsx
│   │   ├── progress.tsx
│   │   └── settings.tsx
│   └── _layout.tsx               # ✅ Root with auth routing
│
├── components/                   # React components
│   ├── auth/                     # ✅ Auth components
│   ├── shared/                   # ✅ Reusable UI components
│   └── ...                       # 🔜 More in later phases
│
├── contexts/                     # ✅ React Context providers
│   └── auth-context.tsx          # Authentication state
│
├── services/                     # ✅ API & external services
│   └── supabase/                 # Database operations
│       ├── client.ts
│       ├── auth.ts
│       ├── goals.ts
│       ├── progress.ts
│       ├── messages.ts
│       └── settings.ts
│
├── types/                        # ✅ TypeScript definitions
│   ├── user.ts
│   ├── goal.ts
│   ├── progress.ts
│   ├── message.ts
│   └── payment.ts
│
├── constants/                    # ✅ App constants
│   ├── theme.ts
│   ├── coach-personas.ts
│   └── tone-preferences.ts
│
└── hooks/                        # ✅ Custom React hooks
    └── use-auth.ts
```

## 🔐 Authentication Flow

The app uses a three-stage routing system:

1. **Unauthenticated** → `(auth)/welcome.tsx`
   - Shows OAuth login buttons
   - Supports Google and Facebook

2. **Authenticated but not onboarded** → `(onboarding)/questionnaire.tsx`
   - Collects goal information
   - Sets up AI preferences

3. **Fully onboarded** → `(tabs)/` main app
   - Chat interface
   - Progress dashboard
   - Settings

## 🎯 Next Steps

### Immediate (To test current work):
1. Set up Supabase project and add credentials to `.env`
2. Run the database setup SQL
3. Configure OAuth providers in Supabase
4. Start the app with `npm start`

### Coming Up:
- **Phase 3**: Stripe payment integration
- **Phase 4**: Complete onboarding flow with questionnaire
- **Phase 5**: Main navigation and settings screen
- **Phase 6**: Progress dashboard with streak tracking
- **Phase 7**: AI integration (Claude/Gemini)
- **Phase 8**: Chat interface
- **Phase 9**: Push notifications
- **Phase 10**: Level progression system
- **Phase 11**: Error handling and polish

## 📚 Documentation

- **DATABASE_SETUP.md** - Complete database setup instructions
- **healthy-habits-app-prd.md** - Full product requirements
- **.env.example** - Environment variable template

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Make sure you've created a `.env` file
- Verify your Supabase URL and anon key are correct
- Restart the Expo server after changing `.env`

### OAuth not working
- Verify OAuth providers are enabled in Supabase dashboard
- Check redirect URLs match your Expo app configuration
- Ensure you're using correct OAuth credentials

### Can't connect to database
- Verify your Supabase project is active
- Check that RLS policies are set up correctly
- Ensure you're authenticated before accessing data

## 💡 Tips

- Use `npm start -- --clear` to clear the cache if you encounter issues
- Check the Expo console for detailed error messages
- The app uses Expo Router for file-based routing
- All API calls require authentication (enforced by RLS policies)

## 🎉 What's Working Now

- ✅ OAuth login with Google and Facebook
- ✅ Session persistence with secure storage
- ✅ Automatic routing based on auth state
- ✅ User record creation in database
- ✅ Supabase integration
- ✅ Type-safe API calls
- ✅ Dark/light mode theming

Ready to continue building? The foundation is solid and we're ready for the next phases!
