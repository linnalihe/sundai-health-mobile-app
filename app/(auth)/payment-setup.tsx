import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/shared/button';
import { useAuth } from '@/hooks/use-auth';
import { createStripeCustomer, attachPaymentMethod } from '@/services/stripe/payment-methods';
import { createSubscription } from '@/services/stripe/subscriptions';
import { SUBSCRIPTION_PRICE, STRIPE_PUBLISHABLE_KEY } from '@/services/stripe/client';

export default function PaymentSetupScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const stripe = useStripe();
  const [isLoading, setIsLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardDetails, setCardDetails] = useState<any>(null);

  // Check Stripe initialization on mount
  useEffect(() => {
    console.log('=== STRIPE INITIALIZATION CHECK ===');
    console.log('Stripe instance:', stripe);
    console.log('createPaymentMethod available:', typeof stripe.createPaymentMethod);
  }, []);

  const handleSetupPayment = async () => {
    if (!user) {
      Alert.alert('Error', 'User not found. Please sign in again.');
      return;
    }

    console.log('=== PAYMENT SETUP DEBUG ===');
    console.log('Card Complete State:', cardComplete);
    console.log('Card Details:', JSON.stringify(cardDetails, null, 2));
    console.log('User Email:', user.email);

    if (!cardComplete) {
      console.warn('Card not complete - showing alert');
      Alert.alert(
        'Invalid Card',
        `Please complete all card details.\n\nCard State: ${JSON.stringify(cardDetails, null, 2)}`
      );
      return;
    }

    try {
      setIsLoading(true);

      console.log('Creating payment method...');
      console.log('Stripe instance available:', !!stripe);
      console.log('createPaymentMethod function:', typeof stripe.createPaymentMethod);

      // Create payment method from card details
      // Note: When using CardField, it automatically collects the card data
      // We just need to specify the payment method type and optional billing details
      const result = await stripe.createPaymentMethod({
        paymentMethodType: 'Card',
        billingDetails: {
          email: user.email,
        },
      });

      console.log('Raw Stripe Result:', result);
      const { paymentMethod, error: pmError } = result;

      console.log('Payment Method Result:', paymentMethod);
      console.log('Payment Method Error:', pmError);

      if (pmError) {
        console.error('Stripe PM Error Details:', {
          message: pmError.message,
          code: pmError.code,
          declineCode: pmError.declineCode,
          type: pmError.type,
        });
        throw new Error(pmError.message);
      }

      if (!paymentMethod) {
        throw new Error('Failed to create payment method');
      }

      // Create Stripe customer (or use existing)
      let customerId = user.stripe_customer_id;
      if (!customerId) {
        customerId = await createStripeCustomer(user.id, user.email);
      }

      // Attach payment method to customer
      await attachPaymentMethod(customerId, paymentMethod.id);

      // Create subscription
      await createSubscription(user.id, customerId, paymentMethod.id);

      // Refresh user data
      await refreshUser();

      Alert.alert(
        'Payment Setup Complete!',
        'Your subscription is now active. Let\'s set up your goals.',
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/(onboarding)/questionnaire'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Payment setup error:', error);
      Alert.alert(
        'Payment Failed',
        error.message || 'An error occurred while setting up your payment. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    if (__DEV__) {
      console.log('Skipping payment for testing - navigating to questionnaire');
      router.replace('/(onboarding)/questionnaire');
    } else {
      Alert.alert(
        'Payment Required',
        'A payment method is required to continue using the app.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Set Up Your Subscription
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Start your journey to better health with our AI-powered coaching
            </ThemedText>

            {/* Stripe Key Warning */}
            {__DEV__ && STRIPE_PUBLISHABLE_KEY && (
              <View style={[
                styles.keyWarning,
                STRIPE_PUBLISHABLE_KEY.startsWith('pk_live_') ? styles.keyWarningDanger : styles.keyWarningSuccess
              ]}>
                <ThemedText style={styles.keyWarningText}>
                  {STRIPE_PUBLISHABLE_KEY.startsWith('pk_live_')
                    ? '⚠️ LIVE KEY - Test cards will NOT work!'
                    : '✅ TEST KEY - Test cards OK'}
                </ThemedText>
                <ThemedText style={styles.keyWarningSubtext}>
                  {STRIPE_PUBLISHABLE_KEY.substring(0, 25)}...
                </ThemedText>
              </View>
            )}
          </View>

          {/* Pricing Information */}
          <View style={styles.pricingCard}>
            <ThemedText type="subtitle" style={styles.priceAmount}>
              ${(SUBSCRIPTION_PRICE / 100).toFixed(2)}/month
            </ThemedText>
            <ThemedText style={styles.priceDescription}>
              Cancel anytime. No long-term commitment.
            </ThemedText>

            <View style={styles.features}>
              <FeatureItem icon="✅" text="Personalized AI coaching daily" />
              <FeatureItem icon="✅" text="Unlimited habit tracking" />
              <FeatureItem icon="✅" text="Progress analytics & insights" />
              <FeatureItem icon="✅" text="Level-based goal progression" />
              <FeatureItem icon="✅" text="Choose your AI model (Claude or Gemini)" />
            </View>
          </View>

          {/* Card Input */}
          <View style={styles.cardSection}>
            <ThemedText type="defaultSemiBold" style={styles.label}>
              Payment Information
            </ThemedText>

            <View style={styles.cardFieldContainer}>
              <CardField
                postalCodeEnabled={true}
                placeholder={{
                  number: '4242 4242 4242 4242',
                  postalCode: '12345',
                  cvc: '123',
                  expiration: 'MM/YY',
                }}
                cardStyle={{
                  backgroundColor: '#FFFFFF',
                  textColor: '#000000',
                  placeholderColor: '#999999',
                  borderRadius: 8,
                  fontSize: 16,
                }}
                style={styles.cardField}
                onCardChange={(details) => {
                  console.log('=== CARD CHANGE EVENT ===');
                  console.log('Complete:', details.complete);
                  console.log('Valid Number:', details.validNumber);
                  console.log('Valid Expiry:', details.validExpiryDate);
                  console.log('Valid CVC:', details.validCVC);
                  console.log('Brand:', details.brand);
                  console.log('Full Details:', JSON.stringify(details, null, 2));
                  setCardDetails(details);
                  setCardComplete(details.complete);
                }}
              />
            </View>

            <ThemedText style={styles.secureText}>
              🔒 Secured by Stripe. We never store your card details.
            </ThemedText>

            {/* Debug Info */}
            {__DEV__ && cardDetails && (
              <View style={styles.debugPanel}>
                <ThemedText style={styles.debugTitle}>DEBUG INFO:</ThemedText>
                <ThemedText style={styles.debugText}>Complete: {cardComplete ? 'YES' : 'NO'}</ThemedText>
                <ThemedText style={styles.debugText}>Valid Number: {cardDetails.validNumber}</ThemedText>
                <ThemedText style={styles.debugText}>Valid Expiry: {cardDetails.validExpiryDate}</ThemedText>
                <ThemedText style={styles.debugText}>Valid CVC: {cardDetails.validCVC}</ThemedText>
                <ThemedText style={styles.debugText}>Brand: {cardDetails.brand || 'Unknown'}</ThemedText>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button
              title="Start Subscription"
              onPress={handleSetupPayment}
              isLoading={isLoading}
              disabled={!cardComplete}
              variant="primary"
              size="large"
              fullWidth
            />

            <Button
              title={__DEV__ ? "Skip for Testing" : "I'll do this later"}
              onPress={handleSkip}
              variant="outline"
              size="medium"
              fullWidth
              style={styles.skipButton}
            />
          </View>

          {/* Terms */}
          <View style={styles.terms}>
            <ThemedText style={styles.termsText}>
              By continuing, you agree to our Terms of Service and Privacy Policy.
              You can cancel your subscription at any time from the settings.
            </ThemedText>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

interface FeatureItemProps {
  icon: string;
  text: string;
}

function FeatureItem({ icon, text }: FeatureItemProps) {
  return (
    <View style={styles.featureItem}>
      <ThemedText style={styles.featureIcon}>{icon}</ThemedText>
      <ThemedText style={styles.featureText}>{text}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 22,
  },
  pricingCard: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
    marginBottom: 32,
  },
  priceAmount: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 8,
    color: '#4CAF50',
  },
  priceDescription: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  features: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    marginRight: 8,
    fontSize: 16,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
  },
  cardSection: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    marginBottom: 12,
  },
  cardFieldContainer: {
    marginBottom: 12,
  },
  cardField: {
    width: '100%',
    height: 50,
    marginVertical: 8,
  },
  secureText: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
  },
  actions: {
    gap: 12,
    marginBottom: 24,
  },
  skipButton: {
    marginTop: 8,
  },
  terms: {
    paddingHorizontal: 16,
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.5,
    lineHeight: 16,
  },
  debugPanel: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  debugText: {
    fontSize: 11,
    marginBottom: 4,
    color: '#666',
  },
  keyWarning: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
  },
  keyWarningDanger: {
    backgroundColor: '#fff3cd',
    borderColor: '#ff9800',
  },
  keyWarningSuccess: {
    backgroundColor: '#d4edda',
    borderColor: '#4CAF50',
  },
  keyWarningText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  keyWarningSubtext: {
    fontSize: 10,
    textAlign: 'center',
    color: '#666',
    marginTop: 4,
    fontFamily: 'monospace',
  },
});
