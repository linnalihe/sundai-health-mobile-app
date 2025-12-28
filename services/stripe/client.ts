import Constants from 'expo-constants';

// Get Stripe publishable key from environment
const extra = Constants.expoConfig?.extra;
export const STRIPE_PUBLISHABLE_KEY = extra?.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!STRIPE_PUBLISHABLE_KEY) {
  console.error('❌ Missing Stripe publishable key. Payment features will not work.');
  console.error('Check that:');
  console.error('1. .env file exists with EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY');
  console.error('2. Dev server was restarted with: npm start -- --clear');
} else {
  console.log('✅ Stripe Key Loaded:', STRIPE_PUBLISHABLE_KEY.substring(0, 20) + '...');
  console.log('📝 Stripe Key Type:', STRIPE_PUBLISHABLE_KEY.startsWith('pk_test_') ? 'TEST ✅' : 'LIVE ⚠️');

  if (STRIPE_PUBLISHABLE_KEY.startsWith('pk_live_')) {
    console.error('⚠️ WARNING: Using LIVE Stripe key! Test cards will NOT work.');
    console.error('Get TEST key from: https://dashboard.stripe.com/test/apikeys');
  } else if (STRIPE_PUBLISHABLE_KEY.startsWith('pk_test_')) {
    console.log('✅ TEST mode enabled - Test card 4242 4242 4242 4242 will work');
  }
}

// Stripe configuration
export const STRIPE_CONFIG = {
  publishableKey: STRIPE_PUBLISHABLE_KEY || '',
  merchantIdentifier: 'merchant.com.sundai.healthyhabits', // For Apple Pay
  urlScheme: 'sundaihealthapp', // Must match app.json scheme
};

// Subscription pricing (in cents)
export const SUBSCRIPTION_PRICE = 999; // $9.99/month
export const STREAK_EDIT_TOGGLE_PRICE = 300; // $3.00
export const GOAL_CHANGE_PRICE = 500; // $5.00
