import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/shared/button';
import type { OAuthProvider } from '@/services/supabase/auth';

interface OAuthButtonProps {
  provider: OAuthProvider;
  onPress: () => void;
  isLoading?: boolean;
}

const PROVIDER_CONFIG = {
  google: {
    label: 'Continue with Google',
    icon: 'logo-google' as const,
    color: '#4285F4',
  },
  facebook: {
    label: 'Continue with Facebook',
    icon: 'logo-facebook' as const,
    color: '#1877F2',
  },
};

export function OAuthButton({ provider, onPress, isLoading }: OAuthButtonProps) {
  const config = PROVIDER_CONFIG[provider];

  return (
    <Button
      title={config.label}
      onPress={onPress}
      isLoading={isLoading}
      variant="outline"
      size="large"
      fullWidth
      icon={
        <View style={[styles.iconContainer, { backgroundColor: config.color }]}>
          <Ionicons name={config.icon} size={20} color="#fff" />
        </View>
      }
      style={styles.button}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
