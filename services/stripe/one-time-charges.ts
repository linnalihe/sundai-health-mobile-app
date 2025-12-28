import { supabase } from '@/services/supabase/client';
import type { PaymentType } from '@/types';
import { STREAK_EDIT_TOGGLE_PRICE, GOAL_CHANGE_PRICE } from './client';

/**
 * Create a one-time payment intent
 * In production, this should be done server-side
 */
export async function createOneTimeCharge(
  userId: string,
  customerId: string,
  amount: number,
  paymentType: PaymentType,
  description: string
): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: {
        customerId,
        amount,
        description,
      },
    });

    if (error) throw error;

    // Record payment in database
    await supabase.from('payments').insert([{
      user_id: userId,
      stripe_payment_id: data.paymentIntent.id,
      amount: amount / 100,
      currency: 'usd',
      payment_type: paymentType,
      status: 'pending',
    }]);

    return data.paymentIntent.client_secret;
  } catch (error) {
    console.error('Error creating one-time charge:', error);
    throw error;
  }
}

/**
 * Charge for streak editing toggle
 */
export async function chargeStreakEditToggle(
  userId: string,
  customerId: string
): Promise<string> {
  return createOneTimeCharge(
    userId,
    customerId,
    STREAK_EDIT_TOGGLE_PRICE,
    'streak_edit_toggle',
    'Streak Editing Toggle'
  );
}

/**
 * Charge for goal change
 */
export async function chargeGoalChange(
  userId: string,
  customerId: string
): Promise<string> {
  return createOneTimeCharge(
    userId,
    customerId,
    GOAL_CHANGE_PRICE,
    'goal_change',
    'Goal Change Fee'
  );
}

/**
 * Confirm payment intent
 */
export async function confirmPayment(
  paymentIntentId: string,
  paymentMethodId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('confirm-payment', {
      body: {
        paymentIntentId,
        paymentMethodId,
      },
    });

    if (error) throw error;

    // Update payment record
    await supabase
      .from('payments')
      .update({ status: 'succeeded' })
      .eq('stripe_payment_id', paymentIntentId);

    return data.success;
  } catch (error) {
    console.error('Error confirming payment:', error);

    // Update payment record as failed
    await supabase
      .from('payments')
      .update({ status: 'failed' })
      .eq('stripe_payment_id', paymentIntentId);

    throw error;
  }
}
