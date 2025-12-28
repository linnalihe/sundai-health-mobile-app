# Database Setup Instructions

This document provides instructions for setting up the Supabase database for the Healthy Habits Coaching App.

## Prerequisites

1. Create a Supabase project at https://supabase.com
2. Note your project URL and anon key (found in Project Settings > API)

## Step 1: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your actual credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
   ```

## Step 2: Create Database Tables

1. Open your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the SQL script below
4. Click "Run" to execute

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  oauth_provider TEXT NOT NULL,
  oauth_id TEXT NOT NULL,
  display_name TEXT,
  profile_picture_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_status TEXT CHECK (subscription_status IN ('active', 'past_due', 'cancelled')) DEFAULT 'active',
  subscription_id TEXT,
  stripe_customer_id TEXT,
  current_level INTEGER DEFAULT 1
);

-- Goals table
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  goal_description TEXT NOT NULL CHECK (char_length(goal_description) >= 255),
  bad_habits TEXT NOT NULL CHECK (char_length(bad_habits) >= 255),
  required_habits TEXT NOT NULL CHECK (char_length(required_habits) >= 255),
  difficulty_assessment TEXT NOT NULL CHECK (char_length(difficulty_assessment) >= 255),
  external_factors TEXT NOT NULL CHECK (char_length(external_factors) >= 255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT CHECK (status IN ('active', 'completed', 'abandoned')) DEFAULT 'active',
  completion_date TIMESTAMP WITH TIME ZONE
);

-- Progress table
CREATE TABLE progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  marked_method TEXT CHECK (marked_method IN ('ai_auto', 'manual_edit')) DEFAULT 'ai_auto',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  edited_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, goal_id, date)
);

-- Streaks table
CREATE TABLE streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_days_completed INTEGER DEFAULT 0,
  last_completion_date DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, goal_id)
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  sender TEXT CHECK (sender IN ('ai', 'user')) NOT NULL,
  content TEXT NOT NULL,
  ai_model_used TEXT CHECK (ai_model_used IN ('claude', 'gemini')),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  responded BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings table
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  ai_model TEXT CHECK (ai_model IN ('claude', 'gemini')) DEFAULT 'claude',
  coach_inspiration TEXT,
  custom_coach TEXT,
  tone_preference TEXT CHECK (tone_preference IN ('motivational', 'tough_love', 'supportive', 'professional', 'casual')) DEFAULT 'motivational',
  tone_description TEXT,
  message_frequency INTEGER CHECK (message_frequency >= 1 AND message_frequency <= 6) DEFAULT 1,
  message_times TIME[],
  streak_editing_enabled BOOLEAN DEFAULT false,
  streak_edit_toggle_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_payment_id TEXT,
  amount DECIMAL(10, 2),
  currency TEXT DEFAULT 'usd',
  payment_type TEXT CHECK (payment_type IN ('subscription', 'streak_edit_toggle', 'goal_change', 'other')),
  status TEXT CHECK (status IN ('succeeded', 'failed', 'pending')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Level history table
CREATE TABLE level_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  previous_level INTEGER,
  new_level INTEGER,
  goal_id UUID REFERENCES goals(id),
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_user_primary ON goals(user_id, is_primary) WHERE is_primary = true;
CREATE INDEX idx_progress_user_goal_date ON progress(user_id, goal_id, date);
CREATE INDEX idx_progress_date ON progress(date);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_scheduled ON messages(scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX idx_messages_unread ON messages(user_id, sender, read_at) WHERE sender = 'ai' AND read_at IS NULL;
CREATE INDEX idx_streaks_user_goal ON streaks(user_id, goal_id);
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_history ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own goals" ON goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON goals FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own progress" ON progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own streaks" ON streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own streaks" ON streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own streaks" ON streaks FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own messages" ON messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own messages" ON messages FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own level history" ON level_history FOR SELECT USING (auth.uid() = user_id);
```

## Step 3: Configure OAuth Providers

1. In Supabase Dashboard, navigate to Authentication > Providers
2. Enable Google OAuth:
   - Add your Google OAuth Client ID
   - Add your Google OAuth Client Secret
3. Enable Facebook OAuth:
   - Add your Facebook App ID
   - Add your Facebook App Secret
4. Configure redirect URLs for your Expo app

## Step 4: Test Database Connection

1. Start your Expo app:
   ```bash
   npm start
   ```

2. The Supabase client should connect successfully
3. Check the console for any connection errors

## Verification

After setup, you should have:
- ✅ 8 database tables created
- ✅ RLS policies enabled and configured
- ✅ Indexes created for performance
- ✅ OAuth providers configured
- ✅ Environment variables set

## Troubleshooting

**Connection errors:**
- Verify your Supabase URL and anon key are correct
- Check that your Supabase project is active
- Ensure you're using the correct environment variable names

**OAuth issues:**
- Verify OAuth provider credentials are correct
- Check redirect URLs match your Expo app configuration
- Ensure OAuth providers are enabled in Supabase dashboard

**RLS policy errors:**
- Make sure you're authenticated before accessing data
- Verify the user ID matches the authenticated user
- Check RLS policies are enabled on all tables
