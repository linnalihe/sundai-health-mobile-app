# Product Requirements Document: Healthy Habits Coaching App

## Document Information
- **Version:** 1.0
- **Last Updated:** December 28, 2025
- **Product Owner:** [Your Name]
- **Development Platform:** React Native (Expo Framework)

---

## 1. Executive Summary

### 1.1 Product Vision
A mobile application (iOS & Android) that helps users build healthy lifestyles through small, manageable daily habit improvements. The app focuses on guiding users to achieve at least 150 minutes of weekly exercise and regular whole food consumption while breaking bad habits through AI-powered daily coaching.

### 1.2 Core Value Proposition
- **Simple & Achievable:** Health isn't complicated - just 1 hour daily + 2 hours weekly meal prep
- **Personalized AI Coaching:** Daily guidance tailored to user goals and preferences
- **Progressive Growth:** Start with one habit, unlock more as you build streaks
- **Accountability:** Daily check-ins and visual progress tracking

### 1.3 Target User
People who:
- Struggle with building healthy habits due to lack of urgency or bandwidth
- Have misconceptions about what it takes to be healthy
- Know their bad habits but need support breaking them
- Want structured, guided improvement without overwhelming complexity

### 1.4 Success Metrics
- User retention after 30 days
- Average streak length
- Percentage of users reaching Level 2 (15-day streak)
- Daily active users responding to AI prompts
- Subscription retention rate

---

## 2. Technical Stack

### 2.1 Core Technologies
- **Framework:** React Native with Expo
- **Database:** Supabase
- **Payments:** Stripe integration
- **AI Services:** 
  - Anthropic Claude API
  - Google Gemini API
  - User selectable in settings
- **Authentication:** OAuth (Google, Facebook, and other social accounts)

### 2.2 Platform Support
- iOS (minimum version TBD)
- Android (minimum version TBD)

### 2.3 Third-Party Services
- Push notification service (via Expo)
- Stripe for payment processing
- Supabase for backend and database
- AI API services (Claude and Gemini)

---

## 3. User Authentication & Onboarding

### 3.1 Authentication Flow
**Method:** OAuth through social accounts
- Google OAuth
- Facebook OAuth
- Additional social providers as available

**Security Requirements:**
- Secure token storage
- Session management
- Automatic logout on security events

### 3.2 Onboarding Flow

#### Step 1: Welcome & Authentication
- Welcome screen explaining the app's value
- OAuth provider selection
- Account creation

#### Step 2: Payment Setup (Required)
- Stripe payment method addition
- Required before proceeding to goal setup
- Clear pricing display
- Terms of service and privacy policy acceptance

#### Step 3: Goal Setting Questionnaire (Required)
All questions must be answered with minimum 255 characters each:

1. **Goal Description**
   - "What is the goal that you want to have? Describe it in as much detail as possible."
   - Minimum: 255 characters
   - Validation: Character counter, inline error if below minimum

2. **Bad Habits Identification**
   - "What is preventing you from achieving your goal? Describe the bad habits that you know you have."
   - Minimum: 255 characters
   - Validation: Character counter, inline error if below minimum

3. **Required Good Habits**
   - "What are the habits you believe you need to get to your goal?"
   - Minimum: 255 characters
   - Validation: Character counter, inline error if below minimum

4. **Difficulty Assessment**
   - "Describe what your thoughts are around this goal. Do you think it's easy, medium or hard? Why do you think it is difficult for you to get to your goal?"
   - Minimum: 255 characters
   - Validation: Character counter, inline error if below minimum

5. **External Factors**
   - "What are external factors that are making it hard for you to stop your bad habits and what external factors are making it hard to build the good habits?"
   - Minimum: 255 characters
   - Validation: Character counter, inline error if below minimum

**Validation Rules:**
- All fields required
- Minimum 255 characters per answer
- Show inline errors in red
- Highlight invalid fields
- Clear error messaging
- Cannot proceed without completing all questions
- Answers can be updated later in Settings

#### Step 4: Initial Preferences Setup
- AI model selection (Claude or Gemini)
- Coach inspiration selection
- Tone of voice preferences
- Message frequency and timing

#### Step 5: Tutorial/Walkthrough
- Brief overview of the three main screens
- How to respond to AI messages
- How progress tracking works
- How to level up

---

## 4. App Structure & Navigation

### 4.1 Single-Page App Design
**Style:** Playful, engaging, flexible
**Emotional Response:** Accomplished, confident, motivated
**Inspiration:** Instagram (engagement), Notion (flexibility and productivity)

### 4.2 Main Screens (Bottom Navigation)

#### Screen 1: Chat Interface (Home/Default)
- Primary landing screen
- AI agent messages
- User response input
- Quick reply options
- Message history (last 30 days)

#### Screen 2: Progress Dashboard
- Streak tracking (list view with checkboxes)
- Key metrics display
- Current level indicator
- Active goals overview

#### Screen 3: Settings
- Goal questionnaire (editable)
- AI preferences
- Notification settings
- Billing & subscription management
- Account settings

---

## 5. Feature Specifications

### 5.1 Chat Interface

#### 5.1.1 Message Display
**Layout:**
- Chronological message list
- AI messages aligned left with distinct styling
- User messages aligned right
- Timestamp for each message
- Clear visual distinction between AI and user messages

**Message History:**
- Last 30 days visible in app
- Last 7 days cached locally for offline viewing
- Older messages (30+ days) stored in Supabase
- Future feature: Pay to access older messages (NOT IN MVP)

**Offline Behavior:**
- Display cached messages from last 7 days
- Show offline indicator
- Disable message input
- Queue messages for sending when online

#### 5.1.2 AI Message Generation
**Scheduling:**
- Pre-generated and scheduled based on user preferences
- Push notification sent at scheduled time
- User-configured frequency (1-6 times per day)
- User-configured specific times for each message

**Message Content:**
- Personalized based on goal questionnaire answers
- Influenced by selected coach persona
- Adapted to user's tone preference
- References user's progress and streak status
- Encourages continuation of good habits
- Reminds about avoiding bad habits

**Follow-up Logic:**
- If user doesn't respond to daily message
- Send one follow-up message
- Next scheduled message continues normally

#### 5.1.3 User Response Interface
**Input Methods:**
- Free-form text input (primary)
- Quick reply options (secondary)
  - Predefined responses relevant to context
  - Example: "Yes, I did it!", "I struggled today", "Couldn't do it"
  
**Input Limitations (MVP):**
- Users CANNOT initiate new conversations
- Can only respond to AI prompts
- Future feature: User-initiated chat (NOT IN MVP)

**Automatic Progress Parsing:**
- AI analyzes user response
- Determines if habit was completed
- Updates progress dashboard automatically
- AI confirms the update in chat
  - Example: "Great! I've marked today as complete on your streak."

#### 5.1.4 AI Service Downtime Handling
- Display cached messages
- Show generic motivational message
- Clear indicator that service is down
- Message: "Our AI service is temporarily unavailable. Please check back later. In the meantime, here's a message: [motivational content]"
- Disable new message input
- Allow viewing of cached history

### 5.2 Progress Dashboard

#### 5.2.1 Current Goal Display
- Goal name/title (derived from questionnaire)
- Current level indicator
- Days until next level unlock

#### 5.2.2 Streak Tracking
**Display Format:**
- List view (NOT calendar view)
- Checkboxes for each day
- Dates clearly labeled
- Current streak highlighted
- Visual distinction for completed vs incomplete days

**Metrics Displayed:**
- **Longest Streak:** Highest consecutive days achieved
- **Total Days Completed:** Sum of all completed days
- **Current Streak:** Current consecutive days
- **Current Level:** User's progression level

**Tracking Logic:**
- Binary completion: Did it or didn't do it
- Bare minimum effort counts as completion
- No partial completion tracking in MVP
- Automatic update from AI chat parsing
- Manual update available (if setting enabled)

#### 5.2.3 Edit Functionality
**Settings-Controlled:**
- Toggle in Settings: "Enable Streak Editing"
- Default: OFF
- **Cost to Toggle:** $3 each time setting is changed (ON→OFF or OFF→ON)

**Edit Rules When Enabled:**
- Can edit past 90 days only
- Everything 90+ days old is locked
- Clear visual indicator of editable vs locked days
- Confirmation prompt before editing
- Edit history tracked (backend only)

**Edit Rules When Disabled:**
- No manual edits allowed
- Only automatic updates from AI parsing
- View-only mode

#### 5.2.4 Multiple Goals Display (Level 2+)
- All active goals shown on single dashboard
- Separate streak tracking for each goal
- Visual hierarchy showing primary vs secondary goals
- Clear indication of which goal is being tracked in current chat session

### 5.3 Level & Goal Progression System

#### 5.3.1 Starting State
- All users start at Level 1
- Can work on ONE goal only
- Must complete onboarding questionnaire for first goal

#### 5.3.2 Level Progression Rules

**Levels 1-5:**
- Unlock next level after 15 consecutive days (2 weeks + 1 day)
- Each level allows adding one more goal
- Level 1 → Level 2: Complete 15-day streak on Goal 1
- Level 2 → Level 3: Complete 15-day streak on Goal 2
- And so on...

**Levels 6-10:**
- Require 30 consecutive days per new goal
- Same progression logic

**Levels 11+:**
- Levels 11-20: Require 60 consecutive days
- Levels 21+: Require 120 consecutive days

**Level Benefits:**
- Each level = one additional goal slot
- Level 5 user can actively track 5 goals simultaneously

#### 5.3.3 Goal Change Policy

**First Change:**
- Users can change their primary goal once for free
- Must happen before completing first streak

**Subsequent Changes:**
- **Cost:** $5 per goal change
- Applied ONLY if changing before completing a streak
- After completing a streak: Can change goal for free

**Change Process:**
- Confirmation dialog with cost warning (if applicable)
- Option to edit goal questionnaire
- Progress reset for that specific goal
- Level and other goals unaffected

#### 5.3.4 Goal Completion
- Completing a streak = achieving the required consecutive days for current level
- Unlocks ability to add new goal
- Enables free goal change
- Achievement celebration in UI

### 5.4 Settings Screen

#### 5.4.1 Goal Management Section
**Edit Goal Questionnaire:**
- Access to all 5 original questions
- Same validation rules (255 character minimum)
- Save changes with confirmation
- Changes affect future AI messages
- Historical messages unchanged

**Change Primary Goal:**
- Clear cost indication ($5 if before streak completion, Free if after)
- Confirmation dialog
- Progress implications clearly stated

#### 5.4.2 AI Preferences

**AI Model Selection:**
- Radio buttons: Claude or Gemini
- Model description/comparison
- Applies to new messages only
- Existing messages unchanged

**Coach Inspiration:**
- Dropdown/selection list
- Pre-populated options:
  - Tony Robbins
  - Jocko Willink
  - Brené Brown
  - [Additional 2-3 coaches]
  - "Other" with custom text input
- Custom coach text field (if "Other" selected)
- Description field for custom coaches

**Tone of Voice:**
- Multiple choice selection:
  - Motivational & Uplifting
  - Tough Love & Direct
  - Supportive & Empathetic
  - Professional & Informative
  - Casual & Friendly
- Additional text field: "Describe any specific preferences for tone"
  - Optional
  - Help text: "Tell us more about how you'd like to be coached"

#### 5.4.3 Notification Settings

**Message Frequency:**
- Dropdown: 1, 2, 3, 4, 5, or 6 times per day
- Dynamic time picker based on frequency
  - If 3 times/day → Show 3 time pickers
  - If 1 time/day → Show 1 time picker

**Default Times:**
- System suggests times spread evenly
- For 3x/day: Every 3 hours (e.g., 8am, 11am, 2pm)
- For 6x/day: Every 3 hours (e.g., 6am, 9am, 12pm, 3pm, 6pm, 9pm)
- User can override all suggested times

**Time Pickers:**
- Native time picker for each slot
- 12-hour or 24-hour based on device settings
- Clear labels: "Message 1 Time", "Message 2 Time", etc.

#### 5.4.4 Progress Tracking Settings

**Enable Streak Editing Toggle:**
- Toggle switch
- Current state clearly displayed
- **Cost Warning:** "$3 charge to change this setting"
- Confirmation dialog before toggling
- Immediate Stripe charge upon confirmation
- Error handling if payment fails

#### 5.4.5 Billing & Subscription

**Payment Method Display:**
- Last 4 digits of card
- Card type (Visa, Mastercard, etc.)
- Expiration date
- "Update Payment Method" button

**Update Payment Method:**
- Stripe payment element
- Validation and error handling
- Confirmation of successful update

**Subscription Status:**
- Current plan displayed
- Next billing date
- Billing amount
- Subscription status (Active/Past Due/Cancelled)

**Cancel Subscription:**
- "Cancel Subscription" button
- Confirmation dialog with implications
  - "You will lose access immediately"
  - "Your data will be retained"
  - Future feature messaging about data export
- Final confirmation required
- Immediate access termination upon cancellation

**Subscription Tiers (MVP):**
- Single tier pricing
- Flat monthly fee
- Future: Multiple tiers (NOT IN MVP)

#### 5.4.6 Account Settings
- Display name
- Email address (from OAuth, read-only)
- Profile picture (from OAuth)
- Logout button
- Delete account option (with strong confirmation)

### 5.5 Push Notifications

#### 5.5.1 Scheduled Message Notifications
**Trigger:**
- AI message pre-generated and scheduled
- Notification sent at user's configured time
- Frequency based on user settings (1-6 per day)

**Notification Content:**
- Title: "Your coach has a message for you"
- Body: Preview of message (first 50-80 characters)
- Deep link to Chat screen
- Badge count update

**Notification Permissions:**
- Requested during onboarding
- Required for core functionality
- Re-prompt if denied, with explanation
- Settings link if permanently denied

#### 5.5.2 Follow-up Notifications
- Sent if user doesn't respond to initial message
- Timing: [To be determined - suggest 3-4 hours after initial]
- Content: Gentle reminder
- Only one follow-up per message

#### 5.5.3 Streak-Related Notifications
- Streak milestone achievements
- Warning before streak is about to break
- Level-up notifications

---

## 6. Data Models

### 6.1 User Table
```
users {
  id: uuid (primary key)
  email: string
  oauth_provider: string
  oauth_id: string
  display_name: string
  profile_picture_url: string
  created_at: timestamp
  updated_at: timestamp
  subscription_status: enum (active, past_due, cancelled)
  subscription_id: string (Stripe subscription ID)
  current_level: integer (default: 1)
}
```

### 6.2 Goals Table
```
goals {
  id: uuid (primary key)
  user_id: uuid (foreign key)
  is_primary: boolean
  goal_description: text (min 255 chars)
  bad_habits: text (min 255 chars)
  required_habits: text (min 255 chars)
  difficulty_assessment: text (min 255 chars)
  external_factors: text (min 255 chars)
  created_at: timestamp
  updated_at: timestamp
  status: enum (active, completed, abandoned)
  completion_date: timestamp (nullable)
}
```

### 6.3 Progress Table
```
progress {
  id: uuid (primary key)
  user_id: uuid (foreign key)
  goal_id: uuid (foreign key)
  date: date
  completed: boolean
  marked_method: enum (ai_auto, manual_edit)
  created_at: timestamp
  updated_at: timestamp
  edited_at: timestamp (nullable)
}
```

### 6.4 Streaks Table
```
streaks {
  id: uuid (primary key)
  user_id: uuid (foreign key)
  goal_id: uuid (foreign key)
  current_streak: integer
  longest_streak: integer
  total_days_completed: integer
  last_completion_date: date
  updated_at: timestamp
}
```

### 6.5 Messages Table
```
messages {
  id: uuid (primary key)
  user_id: uuid (foreign key)
  goal_id: uuid (foreign key)
  sender: enum (ai, user)
  content: text
  ai_model_used: enum (claude, gemini) (nullable)
  scheduled_for: timestamp (nullable)
  sent_at: timestamp
  read_at: timestamp (nullable)
  responded: boolean
  created_at: timestamp
}
```

### 6.6 User Settings Table
```
user_settings {
  id: uuid (primary key)
  user_id: uuid (foreign key)
  ai_model: enum (claude, gemini)
  coach_inspiration: string
  custom_coach: text (nullable)
  tone_preference: enum (motivational, tough_love, supportive, professional, casual)
  tone_description: text (nullable)
  message_frequency: integer (1-6)
  message_times: array of time
  streak_editing_enabled: boolean
  streak_edit_toggle_count: integer (for tracking $3 charges)
  created_at: timestamp
  updated_at: timestamp
}
```

### 6.7 Payments Table
```
payments {
  id: uuid (primary key)
  user_id: uuid (foreign key)
  stripe_payment_id: string
  amount: decimal
  currency: string
  payment_type: enum (subscription, streak_edit_toggle, goal_change, other)
  status: enum (succeeded, failed, pending)
  created_at: timestamp
}
```

### 6.8 Level History Table
```
level_history {
  id: uuid (primary key)
  user_id: uuid (foreign key)
  previous_level: integer
  new_level: integer
  goal_id: uuid (foreign key) (goal that triggered level up)
  achieved_at: timestamp
}
```

---

## 7. User Flows

### 7.1 New User Flow
1. Launch app
2. See welcome/landing screen
3. Tap "Get Started"
4. Choose OAuth provider (Google/Facebook/Other)
5. Complete OAuth authentication
6. Redirected to payment setup
7. Add payment method via Stripe
8. Proceed to goal questionnaire
9. Answer all 5 questions (255+ chars each)
10. Set initial AI preferences
11. Choose notification times
12. Review onboarding summary
13. Land on Chat screen
14. Receive first AI message

### 7.2 Daily User Flow
1. Receive push notification at scheduled time
2. Open app to Chat screen
3. Read AI message
4. Respond using:
   - Quick reply option, OR
   - Free-form text
5. AI confirms progress update
6. View updated streak on Progress Dashboard
7. Close app or continue browsing

### 7.3 Level Up Flow
1. User completes required streak days
2. AI congratulates in next message
3. Push notification: "Congratulations! You've reached Level [X]"
4. User opens app
5. Progress Dashboard shows new level
6. Option appears to add new goal
7. User chooses to add goal or continue with current goal
8. If adding goal: Mini questionnaire for new goal
9. New goal added to dashboard
10. Chat continues with multi-goal context

### 7.4 Goal Change Flow
1. User navigates to Settings
2. Taps "Change Primary Goal"
3. System checks: Has streak been completed?
   - If YES: Free change, proceed
   - If NO: Show cost ($5) and confirmation dialog
4. User confirms (payment processed if applicable)
5. Payment fails → Error message, retry
6. Payment succeeds → Access goal edit form
7. Update goal questionnaire
8. Save changes
9. Progress for that goal resets
10. Confirmation message
11. Return to Settings

### 7.5 Payment Failure Flow
1. Stripe webhook notifies app of failed payment
2. User's next app open shows payment screen ONLY
3. All other screens inaccessible
4. Error message: "Your payment method failed. Please update to continue."
5. User updates payment method
6. Payment processed
7. If successful: Full app access restored
8. If failed: Remain on payment screen with error

### 7.6 Editing Streak Flow
1. User navigates to Settings
2. Finds "Enable Streak Editing" toggle
3. Attempts to toggle
4. Warning dialog: "This will cost $3. Continue?"
5. User confirms
6. Stripe processes $3 payment
7. Payment succeeds:
   - Toggle state changes
   - Confirmation message
   - Setting saved
8. Payment fails:
   - Toggle remains unchanged
   - Error message
   - Option to retry
9. If enabled, user goes to Progress Dashboard
10. Taps on a day within 90-day window
11. Modal: "Mark as complete/incomplete?"
12. User confirms
13. Progress updates
14. Streak recalculated
15. Confirmation shown

---

## 8. AI Agent Specifications

### 8.1 Context Provided to AI
**User Profile Data:**
- All 5 goal questionnaire answers
- Current goal(s) being tracked
- Current level
- Streak statistics (current, longest, total days)
- Recent progress (last 7-14 days)
- User's configured coach preference
- User's tone preference and description

**Conversation History:**
- Last 10 messages (AI and user)
- Timestamps of responses
- Response patterns (time of day, enthusiasm level)

### 8.2 AI Message Generation Prompt Structure
```
You are a [coach_inspiration] style health and habit coach. 
Your tone should be [tone_preference]: [tone_description].

User's Goal: [goal_description]
User's Bad Habits: [bad_habits]
Required Good Habits: [required_habits]
Difficulty Thoughts: [difficulty_assessment]
External Factors: [external_factors]

Current Progress:
- Level: [current_level]
- Current Streak: [current_streak] days
- Longest Streak: [longest_streak] days
- Total Completed: [total_days_completed] days
- Recent 7 days: [completed_pattern]

Recent Conversation:
[last_10_messages]

Based on this information, send an encouraging, personalized message that:
1. Acknowledges their progress or gently addresses any setbacks
2. Provides specific, actionable guidance for today
3. References their goal and required habits
4. Encourages them to avoid their identified bad habits
5. Is appropriate for the time of day
6. Matches the coaching style and tone requested
7. Ends with a question or prompt for them to respond about today's progress

Keep the message concise (100-200 words) and motivating.
```

### 8.3 Progress Parsing Prompt
```
Analyze the following user response to determine if they completed their habit today:

User's Goal: [goal_description]
Today's Habit Focus: [specific_habit]
User's Response: [user_message]

Determine:
1. Did they complete the habit? (YES/NO/UNCLEAR)
2. If unclear, what clarification is needed?
3. Generate a brief acknowledgment message

Return in format:
{
  "completed": boolean,
  "confidence": "high|medium|low",
  "acknowledgment": "string",
  "needs_clarification": boolean,
  "clarification_question": "string|null"
}
```

### 8.4 Response Handling
- If confidence is "high": Auto-update progress
- If confidence is "medium": Update and confirm with user
- If confidence is "low": Ask clarifying question
- If needs_clarification: Send clarification question
- All updates confirmed in conversational tone

### 8.5 Quick Reply Generation
Generate 3-4 context-appropriate quick replies:
- "Yes, I did it!"
- "Not today, but I'll try tomorrow"
- "I did some of it"
- "Let me explain..."
- Context-specific options based on goal

---

## 9. Payment & Billing

### 9.1 Stripe Integration

**Required Stripe Features:**
- Payment method collection
- Subscription management
- Webhook handling
- Payment retry logic
- Subscription cancellation
- One-time charges

### 9.2 Payment Events

**Subscription Payments:**
- Monthly recurring charge
- Amount: [To be determined]
- Automatic retry on failure
- Grace period: None (immediate lockout)

**One-Time Charges:**
- **Streak Edit Toggle:** $3 per toggle change
- **Goal Change (before completion):** $5 per change
- Processed immediately
- No retry logic
- Failure = action cancelled

### 9.3 Pricing Structure (MVP)
- **Monthly Subscription:** $[TBD] per month
- **Streak Edit Toggle Fee:** $3 per change
- **Goal Change Fee:** $5 per change (before streak completion)
- **Future:** Tiered pricing (NOT IN MVP)
- **Future:** Older message access fee (NOT IN MVP)

### 9.4 Webhook Events to Handle
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.subscription.deleted`
- `customer.subscription.updated`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

### 9.5 Payment Failure Handling
**Subscription Failure:**
1. Receive webhook from Stripe
2. Update user subscription_status to 'past_due'
3. Send push notification
4. Next app open → Payment screen only
5. User updates payment method
6. Retry payment
7. Success → Restore access
8. Failure → Remain locked

**One-Time Payment Failure:**
1. Show inline error
2. Do not execute action (toggle change, goal change)
3. Suggest payment method update
4. Allow retry
5. Log failure for analytics

---

## 10. Error Handling & Validation

### 10.1 Form Validation

**Goal Questionnaire:**
- Character count validation (minimum 255)
- Real-time character counter display
- Inline error messages
- Red border on invalid fields
- Cannot submit until all fields valid
- Error message: "Please provide at least 255 characters"

**Settings Forms:**
- Required field validation
- Format validation (email, phone if added later)
- Immediate feedback on blur
- Clear error messaging

### 10.2 Network Error Handling

**API Calls Failed:**
- Retry logic (3 attempts)
- Exponential backoff
- User-friendly error message
- Offline indicator
- Option to retry manually

**AI Service Down:**
- Show cached messages
- Generic motivational message
- Clear "Service Down" indicator
- Disable input
- Estimated recovery time (if available)

### 10.3 Payment Error Handling

**Failed Payment:**
- Clear error message from Stripe
- Specific failure reason if available
- Suggestion to update payment method
- Direct link to payment settings
- Retry option

**Subscription Lockout:**
- Immediate screen showing payment issue
- Cannot access other screens
- Clear explanation
- Direct payment update interface
- Contact support option

### 10.4 Data Validation

**Progress Updates:**
- Date validation
- Prevent future dates
- 90-day edit limit enforcement
- Locked period enforcement
- Conflict resolution (multiple edits same day)

**Message Scheduling:**
- Valid time format
- No duplicate times
- Logical time ordering
- Timezone handling

### 10.5 Edge Cases

**Timezone Changes:**
- Detect timezone change
- Offer to update notification times
- Recalculate scheduled messages
- Maintain streak logic in user's timezone

**Rapid Toggling:**
- Rate limit on streak edit toggle (max 1 per hour?)
- Confirm each $3 charge
- Track toggle history
- Prevent accidental charges

**Simultaneous Edits:**
- Optimistic UI updates
- Conflict resolution on sync
- Last write wins for now
- Future: More sophisticated conflict resolution

**Data Sync Issues:**
- Offline queue for updates
- Sync indicator
- Retry failed syncs
- Conflict resolution

---

## 11. Security & Privacy

### 11.1 Data Protection
- OAuth tokens securely stored
- Encryption at rest (Supabase)
- Encryption in transit (HTTPS)
- API keys in environment variables
- No sensitive data in logs

### 11.2 User Data Privacy
- GDPR compliance
- Data retention policy
- User data access rights
- Right to deletion (future)
- Privacy policy displayed during onboarding

### 11.3 Payment Security
- Stripe handles all card data
- PCI compliance via Stripe
- No card data stored in app database
- Secure webhook verification
- Payment logs for audit

### 11.4 API Security
- Rate limiting on endpoints
- Authentication required for all user data
- Row-level security in Supabase
- API key rotation policy
- Monitoring for unusual activity

---

## 12. Performance Requirements

### 12.1 Load Times
- App launch: < 2 seconds
- Screen transitions: < 500ms
- Message loading: < 1 second
- Dashboard refresh: < 1 second

### 12.2 Offline Support
- View cached messages (7 days)
- View progress dashboard (cached)
- Queue actions for sync
- Clear offline/online status

### 12.3 Caching Strategy
- Last 7 days of messages cached
- Progress data cached
- User settings cached
- Images/assets cached
- Cache invalidation on data change

### 12.4 Scalability Considerations
- Efficient database queries
- Pagination for long message history (future)
- Image optimization
- Lazy loading where appropriate
- Background sync for non-critical updates

---

## 13. Analytics & Monitoring

### 13.1 Key Metrics to Track
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Retention rates (Day 1, Day 7, Day 30)
- Average streak length
- Level distribution
- Goal completion rate
- Message response rate
- Time to first response
- Churn rate
- Revenue per user

### 13.2 User Behavior Tracking
- Feature usage frequency
- Screen time per session
- Navigation patterns
- Quick reply vs free-form usage
- Goal change frequency
- Streak edit usage
- Payment update frequency

### 13.3 Technical Monitoring
- API response times
- Error rates
- Crash reports
- AI service uptime
- Payment success/failure rates
- Database query performance
- Push notification delivery rate

### 13.4 A/B Testing Opportunities (Future)
- Coach persona effectiveness
- Tone preference impact
- Message frequency optimization
- Quick reply options
- UI variations
- Onboarding flow variations

---

## 14. Accessibility

### 14.1 Requirements
- Screen reader support (VoiceOver/TalkBack)
- Minimum touch target size (44x44pt)
- Sufficient color contrast (WCAG AA)
- Scalable text support
- Alternative text for all images
- Keyboard navigation support

### 14.2 Inclusive Design
- Support for various reading levels
- Clear, simple language
- Visual hierarchy
- Error messages in plain language
- Multiple input methods (quick reply + text)

---

## 15. Future Enhancements (NOT IN MVP)

### 15.1 Planned Features
- Export data (chat history, progress)
- Access to messages older than 30 days (paid)
- User-initiated conversations with AI
- Multiple subscription tiers
- Social sharing of achievements
- Friend connections and accountability partners
- Advanced visualizations (graphs, charts)
- Calendar view for progress
- Custom habit templates
- Integration with fitness trackers
- Meal planning integration
- Recipe suggestions
- Photo progress tracking

### 15.2 Monetization Opportunities
- Premium tier with advanced features
- One-time purchases for specific features
- Referral program
- Corporate wellness programs
- Coaching marketplace

---

## 16. Development Phases

### Phase 1: MVP Core (Priority 1)
**Timeline:** [To be determined]

**Features:**
- OAuth authentication
- Payment setup with Stripe
- Goal questionnaire (onboarding)
- Chat interface with AI
- Basic progress dashboard
- Settings screen
- Push notifications
- Level 1-2 progression

**Deliverables:**
- Working iOS and Android apps
- Supabase backend setup
- Stripe integration
- AI integration (Claude and Gemini)
- Basic analytics

### Phase 2: Enhanced Features (Priority 2)
**Timeline:** [To be determined]

**Features:**
- Levels 3-10 progression
- Multiple simultaneous goals
- Streak editing functionality
- Goal change functionality
- Enhanced settings
- Follow-up notifications
- Improved error handling

### Phase 3: Optimization & Scale (Priority 3)
**Timeline:** [To be determined]

**Features:**
- Performance optimization
- Advanced analytics
- A/B testing framework
- Enhanced offline support
- Data export
- Advanced visualizations

---

## 17. Success Criteria

### 17.1 Launch Criteria
- [ ] All MVP features functional
- [ ] Payment processing working
- [ ] AI messages generating correctly
- [ ] Progress tracking accurate
- [ ] Notifications delivering reliably
- [ ] No critical bugs
- [ ] Acceptable performance metrics
- [ ] Privacy policy and terms approved
- [ ] App store submissions ready

### 17.2 Post-Launch Success Metrics
**Week 1:**
- 70% of users complete onboarding
- 50% daily active users
- Average 2+ responses per user per day

**Month 1:**
- 40% retention rate
- Average streak length: 5+ days
- Payment failure rate < 5%
- App rating > 4.0 stars

**Month 3:**
- 10% of users reach Level 2
- 30% retention rate
- Positive revenue growth
- Customer satisfaction score > 80%

---

## 18. Risks & Mitigations

### 18.1 Technical Risks
**Risk:** AI service downtime affecting core functionality
**Mitigation:** Cached messages, fallback motivational content, multi-provider setup

**Risk:** Payment processing failures
**Mitigation:** Robust error handling, clear user communication, Stripe reliability

**Risk:** Push notification delivery issues
**Mitigation:** Multiple notification strategies, in-app indicators, testing across devices

### 18.2 Business Risks
**Risk:** Low user retention
**Mitigation:** Engaging AI messages, gamification, social proof, continuous improvement

**Risk:** High churn rate
**Mitigation:** Value demonstration, progress visibility, community features (future)

**Risk:** Payment model not sustainable
**Mitigation:** Analytics tracking, pricing optimization, tiered model (future)

### 18.3 User Experience Risks
**Risk:** AI messages feel generic or unhelpful
**Mitigation:** Extensive personalization, tone options, coach personas, user feedback loop

**Risk:** Onboarding too lengthy
**Mitigation:** Progress indicators, clear value proposition, ability to save and continue

**Risk:** Users find streak editing confusing
**Mitigation:** Clear UI/UX, tooltips, onboarding education, help documentation

---

## 19. Open Questions & Decisions Needed

### 19.1 Pricing
- [ ] Determine exact monthly subscription price
- [ ] Confirm $3 and $5 one-time fees are acceptable
- [ ] Plan for future tiered pricing

### 19.2 AI Configuration
- [ ] Finalize prompt templates for each coach persona
- [ ] Determine message length limits
- [ ] Set API usage limits and costs
- [ ] Establish quality metrics for AI responses

### 19.3 User Experience
- [ ] Finalize UI design and visual style
- [ ] Choose specific color scheme
- [ ] Decide on iconography style
- [ ] Determine animation/transition preferences

### 19.4 Technical Decisions
- [ ] Exact React Native version
- [ ] State management solution (Redux, Context, MobX, etc.)
- [ ] Testing framework
- [ ] CI/CD pipeline
- [ ] App store deployment strategy

### 19.5 Legal & Compliance
- [ ] Finalize terms of service
- [ ] Complete privacy policy
- [ ] GDPR compliance review
- [ ] Health disclaimer requirements
- [ ] Refund policy

---

## 20. Appendix

### 20.1 Glossary
- **Streak:** Consecutive days of completing a habit
- **Level:** User progression tier unlocking additional goal slots
- **Goal:** Specific health habit user is building
- **Primary Goal:** The main goal user is currently focused on
- **AI Agent:** The personalized coaching bot that messages users
- **Quick Reply:** Pre-generated response options for users
- **Coach Persona:** Famous coach that AI emulates

### 20.2 References
- React Native Documentation: https://reactnative.dev/
- Expo Documentation: https://docs.expo.dev/
- Supabase Documentation: https://supabase.com/docs
- Stripe Documentation: https://stripe.com/docs
- Claude API: https://docs.anthropic.com/
- Gemini API: https://ai.google.dev/docs

### 20.3 Contact & Stakeholders
- Product Owner: [Name]
- Technical Lead: [Name]
- Design Lead: [Name]
- Project Manager: [Name]

---

## Document Control

**Version History:**
- v1.0 - December 28, 2025 - Initial PRD creation
- 

**Review Schedule:**
- Weekly during development
- Bi-weekly post-launch

**Change Management:**
- All changes require product owner approval
- Major changes require stakeholder review
- Version control in Git repository

---

*End of Product Requirements Document*