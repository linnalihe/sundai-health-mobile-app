# Testing Guide - Phases 1-3

This guide will help you test the Healthy Habits App after completing Phases 1-3.

## ✅ What's Been Built (Phases 1-3)

### Phase 1: Foundation ✓
- Complete TypeScript type system
- Supabase database client & services
- Environment configuration
- All core dependencies installed

### Phase 2: Authentication ✓
- OAuth login (Google & Facebook)
- Session management & persistence
- Automatic routing based on auth state
- Welcome screen with OAuth buttons

### Phase 3: Payment Integration ✓
- Stripe payment setup screen
- Subscription creation ($9.99/month)
- Payment method collection
- Stripe provider integration
- Backend service structure (requires Edge Functions)

## 🚀 Quick Start Testing

### Prerequisites

Before you can test, you need:

1. **Supabase Project**
   - Create account at https://supabase.com
   - Create new project
   - Run database schema (see `DATABASE_SETUP.md`)
   - Configure OAuth providers

2. **Environment Variables**
   ```bash
   cp .env.example .env
   # Add your Supabase credentials
   ```

3. **Stripe Account** (Optional for Phase 3 testing)
   - Create test account at https://stripe.com
   - Get test API keys
   - Set up Edge Functions (see `STRIPE_SETUP.md`)

### Start the App

```bash
# Start Expo dev server
npm start

# Then press:
# i - for iOS simulator
# a - for Android emulator
# w - for web browser
```

## 📱 User Flow Testing

### Flow 1: First-Time User (No Stripe)

**What you'll see:**

1. **Welcome Screen**
   - ✨ Healthy Habits branding
   - Feature list (4 value propositions)
   - "Continue with Google" button
   - "Continue with Facebook" button

2. **After OAuth Click**
   - Redirects to Google/Facebook login
   - Returns to app after authentication
   - Creates user record in Supabase

3. **Payment Setup Screen** (will show if no Stripe setup)
   - Displays subscription pricing ($9.99/month)
   - Features list
   - Stripe card input field
   - "Start Subscription" button (disabled without Edge Functions)

4. **Error Handling** (without Edge Functions)
   - Will show error when trying to submit payment
   - This is expected - Edge Functions need to be deployed first

**Expected Result:** ✅ You can sign in, see welcome screen, navigate to payment screen

### Flow 2: First-Time User (With Stripe)

**Prerequisites:**
- Supabase Edge Functions deployed
- Stripe test keys configured

**Test Steps:**

1. Open app → See welcome screen
2. Click "Continue with Google"
3. Complete OAuth flow
4. See payment setup screen
5. Enter test card: `4242 4242 4242 4242`
6. Use any future expiry date
7. Use any 3-digit CVC
8. Click "Start Subscription"

**Expected Result:**
- ✅ Payment processes successfully
- ✅ User record updated with `stripe_customer_id`
- ✅ `subscription_status` set to 'active'
- ✅ Payment record created in `payments` table
- ✅ Redirects to questionnaire (placeholder screen)

### Flow 3: Returning User (Authenticated)

**Test Steps:**

1. Close and reopen app
2. App loads

**Expected Result:**
- ✅ No login screen (session persists)
- ✅ Routes to payment screen if no payment
- ✅ Routes to onboarding if payment but no goals
- ✅ Routes to main app if fully onboarded

### Flow 4: Logout & Re-auth

**Test Steps:**

1. Open app (while authenticated)
2. Force logout by clearing app data
3. Reopen app
4. See welcome screen again
5. Re-authenticate

**Expected Result:**
- ✅ Existing user record loaded
- ✅ Subscription status preserved
- ✅ Routes to appropriate screen

## 🧪 Testing Checklist

### Phase 1: Foundation
- [ ] App starts without errors
- [ ] No TypeScript compilation errors
- [ ] Environment variables load correctly
- [ ] Supabase client connects (check console)

### Phase 2: Authentication
- [ ] Welcome screen displays correctly
- [ ] OAuth buttons appear and are clickable
- [ ] Google OAuth redirects properly
- [ ] Facebook OAuth redirects properly
- [ ] User record created in Supabase `users` table
- [ ] Session persists after app restart
- [ ] Routing works based on auth state

### Phase 3: Payment (With Edge Functions)
- [ ] Payment screen displays pricing correctly
- [ ] Stripe card field appears
- [ ] Card validation works (test incomplete card)
- [ ] Test card processes successfully
- [ ] Stripe customer created
- [ ] Subscription created in Stripe
- [ ] User record updated with customer ID
- [ ] Payment record created in database
- [ ] Routes to onboarding after payment

### Phase 3: Payment (Without Edge Functions)
- [ ] Payment screen displays
- [ ] Card field works
- [ ] Shows appropriate error when Edge Functions missing
- [ ] Can navigate back to previous screens

## 🔍 Debugging

### Check Supabase Connection

```javascript
// In browser console or React Native debugger
import { supabase } from './services/supabase/client';
const { data, error } = await supabase.from('users').select('count');
console.log('Supabase connected:', !error);
```

### Check Auth State

The app logs auth state changes to console:
```
Auth state changed: SIGNED_IN
Auth state changed: SIGNED_OUT
```

### Check User Record

After authentication, check Supabase Dashboard:
1. Go to Table Editor
2. Open `users` table
3. Verify your user record exists
4. Check `stripe_customer_id` and `subscription_status`

### Check Payment Record

After successful payment:
1. Go to Supabase Table Editor
2. Open `payments` table
3. Verify payment record with type 'subscription'
4. Check status is 'succeeded'

## ⚠️ Common Issues

### "Missing Supabase environment variables"

**Solution:**
- Ensure `.env` file exists
- Verify `EXPO_PUBLIC_SUPABASE_URL` is set
- Verify `EXPO_PUBLIC_SUPABASE_ANON_KEY` is set
- Restart Expo dev server: `npm start -- --clear`

### OAuth not working

**Solution:**
- Verify OAuth providers enabled in Supabase Dashboard
- Check redirect URLs match your Expo app
- Ensure correct OAuth credentials
- Try on physical device if simulator fails

### Payment fails immediately

**Solution:**
- Edge Functions not deployed (expected in development)
- Check Stripe publishable key is set
- Verify test card number is correct
- Check console for detailed error messages

### Blank screen / App crashes

**Solution:**
- Check Metro bundler console for errors
- Clear cache: `npm start -- --clear`
- Check for TypeScript errors: `npx tsc --noEmit`
- Verify all imports are correct

### "Can't find module" errors

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install

# Clear cache
npm start -- --clear
```

## 📊 Database Verification

### Check Tables Exist

Run in Supabase SQL Editor:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

Should show: `users`, `goals`, `progress`, `streaks`, `messages`, `user_settings`, `payments`, `level_history`

### Check Row Level Security

```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';
```

Should show RLS policies for each table.

### Sample Data Query

```sql
-- Check user count
SELECT COUNT(*) FROM users;

-- Check recent users
SELECT id, email, display_name, subscription_status, current_level
FROM users
ORDER BY created_at DESC
LIMIT 5;

-- Check payments
SELECT user_id, amount, payment_type, status, created_at
FROM payments
ORDER BY created_at DESC
LIMIT 5;
```

## 🎯 What Works Now

✅ **Authentication**
- Google OAuth login
- Facebook OAuth login
- Session persistence
- User record creation

✅ **Routing**
- Conditional navigation based on auth
- Payment requirement enforcement
- Loading states

✅ **UI Components**
- Themed components (dark/light mode)
- Reusable Button component
- OAuth buttons
- Payment screen layout

✅ **Payment UI**
- Stripe card field
- Form validation
- Loading states
- Error handling

## 🚧 What's Next (Phases 4-11)

- **Phase 4**: Goal questionnaire with 5 questions
- **Phase 5**: Main app navigation and settings
- **Phase 6**: Progress dashboard with streak tracking
- **Phase 7**: AI message generation
- **Phase 8**: Chat interface
- **Phase 9**: Push notifications
- **Phase 10**: Level progression system
- **Phase 11**: Error handling and polish

## 💡 Testing Tips

1. **Use Test Mode**: Always use Stripe test keys and test cards
2. **Check Logs**: Console logs provide valuable debugging info
3. **Test Both Platforms**: Try iOS and Android if possible
4. **Clear Data**: Use simulator menu to reset app data
5. **Database First**: Verify database setup before testing app features
6. **Incremental Testing**: Test each phase thoroughly before moving on

## 📝 Test Report Template

```
Date: ___________
Tester: ___________
Platform: iOS / Android / Web
Environment: Development / Staging

Phase 1 - Foundation:
[ ] Dependencies installed: PASS / FAIL
[ ] Environment configured: PASS / FAIL
[ ] Supabase connected: PASS / FAIL

Phase 2 - Authentication:
[ ] Welcome screen: PASS / FAIL
[ ] Google OAuth: PASS / FAIL
[ ] Facebook OAuth: PASS / FAIL
[ ] Session persistence: PASS / FAIL

Phase 3 - Payment:
[ ] Payment screen: PASS / FAIL
[ ] Stripe card field: PASS / FAIL
[ ] Payment processing: PASS / FAIL / N/A
[ ] Database updates: PASS / FAIL / N/A

Issues Found:
1. ___________
2. ___________

Notes:
___________
```

---

Ready to test? Start with the prerequisites, then follow the user flows!
