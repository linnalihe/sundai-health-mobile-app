import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type TouchableOpacityProps,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  icon,
  fullWidth = false,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const backgroundColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'tint');

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'primary':
        return {
          container: { backgroundColor },
          text: { color: textColor },
        };
      case 'secondary':
        return {
          container: { backgroundColor: 'transparent', borderWidth: 1, borderColor },
          text: { color: backgroundColor },
        };
      case 'outline':
        return {
          container: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#ccc' },
          text: { color: backgroundColor },
        };
      case 'danger':
        return {
          container: { backgroundColor: '#dc3545' },
          text: { color: '#fff' },
        };
    }
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'small':
        return {
          container: { paddingVertical: 8, paddingHorizontal: 16 },
          text: { fontSize: 14 },
        };
      case 'medium':
        return {
          container: { paddingVertical: 12, paddingHorizontal: 24 },
          text: { fontSize: 16 },
        };
      case 'large':
        return {
          container: { paddingVertical: 16, paddingHorizontal: 32 },
          text: { fontSize: 18 },
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        variantStyles.container,
        sizeStyles.container,
        fullWidth && styles.fullWidth,
        (disabled || isLoading) && styles.disabled,
        style,
      ]}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={variantStyles.text.color} />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, variantStyles.text, sizeStyles.text, icon && styles.textWithIcon]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
  },
  textWithIcon: {
    marginLeft: 8,
  },
});
