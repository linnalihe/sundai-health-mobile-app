import { supabase } from '@/services/supabase/client';
import type { PaymentMethod } from '@/types';

/**
 * Note: These functions interact with Stripe via a backend API.
 * In a production app, you should NEVER handle Stripe operations directly from the client.
 * This is a simplified implementation for the MVP.
 *
 * For production, you'll need:
 * 1. A backend API (Supabase Edge Functions or separate backend)
 * 2. Stripe server-side SDK
 * 3. Webhook handlers for payment events
 */

/**
 * Create a Stripe customer
 * In production, this should be done server-side
 */
export async function createStripeCustomer(
  userId: string,
  email: string
): Promise<string> {
  try {
    // This should call your backend API
    // For now, we'll store a placeholder
    // You'll need to implement Supabase Edge Functions or use a backend

    const { data, error } = await supabase.functions.invoke('create-customer', {
      body: { userId, email },
    });

    if (error) throw error;
    return data.customerId;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw error;
  }
}

/**
 * Attach payment method to customer
 * In production, this should be done server-side
 */
export async function attachPaymentMethod(
  customerId: string,
  paymentMethodId: string
): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke('attach-payment-method', {
      body: { customerId, paymentMethodId },
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error attaching payment method:', error);
    throw error;
  }
}

/**
 * Get payment methods for a customer
 */
export async function getPaymentMethods(
  customerId: string
): Promise<PaymentMethod[]> {
  try {
    const { data, error } = await supabase.functions.invoke('get-payment-methods', {
      body: { customerId },
    });

    if (error) throw error;
    return data.paymentMethods || [];
  } catch (error) {
    console.error('Error getting payment methods:', error);
    throw error;
  }
}

/**
 * Update default payment method
 */
export async function updateDefaultPaymentMethod(
  customerId: string,
  paymentMethodId: string
): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke('update-default-payment-method', {
      body: { customerId, paymentMethodId },
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error updating default payment method:', error);
    throw error;
  }
}

/**
 * Detach payment method from customer
 */
export async function detachPaymentMethod(
  paymentMethodId: string
): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke('detach-payment-method', {
      body: { paymentMethodId },
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error detaching payment method:', error);
    throw error;
  }
}
