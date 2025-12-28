import { supabase } from '@/services/supabase/client';
import { updateUser } from '@/services/supabase/auth';
import type { Subscription } from '@/types';
import { SUBSCRIPTION_PRICE } from './client';

/**
 * Create a subscription for a customer
 * In production, this should be done server-side via Supabase Edge Functions
 */
export async function createSubscription(
  userId: string,
  customerId: string,
  paymentMethodId: string
): Promise<Subscription> {
  try {
    // Call backend to create subscription
    const { data, error } = await supabase.functions.invoke('create-subscription', {
      body: {
        customerId,
        paymentMethodId,
        priceAmount: SUBSCRIPTION_PRICE,
      },
    });

    if (error) throw error;

    // Update user record with subscription info
    await updateUser(userId, {
      subscription_id: data.subscription.id,
      subscription_status: 'active',
    });

    // Record payment in database
    await supabase.from('payments').insert([{
      user_id: userId,
      stripe_payment_id: data.subscription.latest_invoice.payment_intent,
      amount: SUBSCRIPTION_PRICE / 100,
      currency: 'usd',
      payment_type: 'subscription',
      status: 'succeeded',
    }]);

    return data.subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string): Promise<Subscription> {
  try {
    const { data, error } = await supabase.functions.invoke('get-subscription', {
      body: { subscriptionId },
    });

    if (error) throw error;
    return data.subscription;
  } catch (error) {
    console.error('Error getting subscription:', error);
    throw error;
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  userId: string,
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke('cancel-subscription', {
      body: { subscriptionId, cancelAtPeriodEnd },
    });

    if (error) throw error;

    // Update user record if immediate cancellation
    if (!cancelAtPeriodEnd) {
      await updateUser(userId, {
        subscription_status: 'cancelled',
      });
    }
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
}

/**
 * Resume a cancelled subscription
 */
export async function resumeSubscription(
  userId: string,
  subscriptionId: string
): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke('resume-subscription', {
      body: { subscriptionId },
    });

    if (error) throw error;

    await updateUser(userId, {
      subscription_status: 'active',
    });
  } catch (error) {
    console.error('Error resuming subscription:', error);
    throw error;
  }
}

/**
 * Update subscription payment method
 */
export async function updateSubscriptionPaymentMethod(
  subscriptionId: string,
  paymentMethodId: string
): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke('update-subscription-payment-method', {
      body: { subscriptionId, paymentMethodId },
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error updating subscription payment method:', error);
    throw error;
  }
}
