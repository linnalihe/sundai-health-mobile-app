# Stripe Integration Setup Guide

This guide explains how to set up Stripe payments for the Healthy Habits App, including backend Supabase Edge Functions.

## Overview

The app uses Stripe for:
- **Monthly subscriptions** ($9.99/month)
- **One-time charges** ($3 for streak editing toggle, $5 for goal changes)
- **Payment method management**

⚠️ **Important**: Stripe operations must be handled server-side for security. We use Supabase Edge Functions for this.

## Step 1: Set Up Stripe Account

1. Create a Stripe account at https://stripe.com
2. Navigate to Developers > API Keys
3. Copy your **Publishable Key** and **Secret Key**
4. For testing, use **Test Mode** keys

## Step 2: Add Stripe Keys to Environment

Update your `.env` file:

```env
# Stripe Publishable Key (used in the app)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# Stripe Secret Key (for backend Edge Functions - DO NOT expose in app)
STRIPE_SECRET_KEY=sk_test_xxxxx
```

## Step 3: Create Supabase Edge Functions

Supabase Edge Functions handle server-side Stripe operations. You'll need to create these functions:

### Required Edge Functions

1. **create-customer** - Create Stripe customer
2. **create-subscription** - Create monthly subscription
3. **cancel-subscription** - Cancel subscription
4. **create-payment-intent** - Create one-time payment
5. **attach-payment-method** - Attach payment method to customer
6. **get-payment-methods** - Retrieve customer payment methods

### Installation

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Create functions directory
mkdir -p supabase/functions
```

### Example Edge Function: create-customer

Create `supabase/functions/create-customer/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.5.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

serve(async (req) => {
  try {
    const { userId, email } = await req.json()

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email,
      metadata: { userId },
    })

    return new Response(
      JSON.stringify({ customerId: customer.id }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
```

### Example Edge Function: create-subscription

Create `supabase/functions/create-subscription/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.5.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

serve(async (req) => {
  try {
    const { customerId, paymentMethodId, priceAmount } = await req.json()

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    })

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    })

    // Create price (or use existing price ID)
    const price = await stripe.prices.create({
      unit_amount: priceAmount,
      currency: 'usd',
      recurring: { interval: 'month' },
      product_data: {
        name: 'Healthy Habits Monthly Subscription',
      },
    })

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: price.id }],
      expand: ['latest_invoice.payment_intent'],
    })

    return new Response(
      JSON.stringify({ subscription }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
```

### Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy create-customer
supabase functions deploy create-subscription
supabase functions deploy create-payment-intent
supabase functions deploy attach-payment-method
supabase functions deploy cancel-subscription
supabase functions deploy get-payment-methods

# Set Stripe secret as environment variable
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxx
```

## Step 4: Set Up Stripe Webhooks

Webhooks notify your app of payment events (successful payments, failed payments, etc.).

### Development (Local Testing)

```bash
# Install Stripe CLI
brew install stripe/stripe-brew/stripe

# Login
stripe login

# Forward webhooks to local Supabase
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook
```

### Production

1. In Stripe Dashboard, go to Developers > Webhooks
2. Add endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhook`
3. Select events to listen for:
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`

### Webhook Handler Function

Create `supabase/functions/stripe-webhook/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.5.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
)

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
    )

    switch (event.type) {
      case 'invoice.payment_succeeded':
        // Update user subscription status
        const invoice = event.data.object
        await supabase
          .from('users')
          .update({ subscription_status: 'active' })
          .eq('stripe_customer_id', invoice.customer)
        break

      case 'invoice.payment_failed':
        // Mark subscription as past_due
        const failedInvoice = event.data.object
        await supabase
          .from('users')
          .update({ subscription_status: 'past_due' })
          .eq('stripe_customer_id', failedInvoice.customer)
        break

      case 'customer.subscription.deleted':
        // Mark subscription as cancelled
        const subscription = event.data.object
        await supabase
          .from('users')
          .update({ subscription_status: 'cancelled' })
          .eq('stripe_customer_id', subscription.customer)
        break
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
```

## Step 5: Test Payment Flow

### Test Cards

Stripe provides test cards for different scenarios:

- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **Requires authentication**: `4000 0025 0000 3155`
- **Insufficient funds**: `4000 0000 0000 9995`

Use any future expiry date and any 3-digit CVC.

### Testing Checklist

- [ ] Create Stripe customer on signup
- [ ] Attach payment method
- [ ] Create subscription successfully
- [ ] Subscription shows as active in user record
- [ ] Payment record created in database
- [ ] Webhook updates subscription status
- [ ] Failed payment marks user as past_due
- [ ] Cancelled subscription marks user as cancelled

## Step 6: Production Considerations

### Security

- ✅ Never expose Stripe Secret Key in client code
- ✅ Always handle payments server-side
- ✅ Validate webhook signatures
- ✅ Use HTTPS for all API calls
- ✅ Implement rate limiting on Edge Functions

### Error Handling

- Handle network failures gracefully
- Provide clear error messages to users
- Log payment errors for debugging
- Implement retry logic for failed requests

### Compliance

- Display clear pricing information
- Show terms of service and privacy policy
- Provide easy cancellation process
- Send payment receipts (Stripe handles this)
- Support refund requests

## Troubleshooting

### "Function not found" error
- Verify Edge Function is deployed: `supabase functions list`
- Check function name matches exactly
- Ensure you're calling the correct project URL

### "Invalid API key" error
- Verify Stripe secret is set: `supabase secrets list`
- Ensure you're using the correct key (test vs live)
- Check API key permissions in Stripe Dashboard

### Webhook not receiving events
- Verify webhook URL is correct
- Check webhook signing secret is set
- Ensure endpoint is publicly accessible
- Review webhook event logs in Stripe Dashboard

## Alternative: Direct Stripe Integration

If you prefer not to use Supabase Edge Functions, you can:

1. Build a separate backend API (Node.js, Python, etc.)
2. Deploy to Vercel, Railway, or similar
3. Update service files to call your API instead of Edge Functions

However, Supabase Edge Functions are recommended for:
- Seamless integration with Supabase
- Built-in environment variable management
- Easy deployment and scaling
- No additional infrastructure needed

## Next Steps

After setting up Stripe:
1. Test the payment flow end-to-end
2. Set up monitoring for payment failures
3. Configure email notifications for important events
4. Plan for handling subscription upgrades/downgrades (future)

---

**Need Help?**
- Stripe Documentation: https://stripe.com/docs
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Stripe Testing: https://stripe.com/docs/testing
