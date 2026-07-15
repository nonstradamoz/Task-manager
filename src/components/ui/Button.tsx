import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePressIn() {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  }
  function handlePressOut() {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }

  const isDisabled = disabled || isLoading;

  const variantStyles: Record<string, { bg: string; border?: string; text: string }> = {
    primary: { bg: theme.colors.accent, text: '#ffffff' },
    secondary: { bg: theme.colors.card, text: theme.colors.text },
    outline: { bg: 'transparent', border: theme.colors.accent, text: theme.colors.accent },
    ghost: { bg: 'transparent', text: theme.colors.text },
    danger: { bg: '#ef4444', text: '#ffffff' },
  };

  const sizeMap = {
    sm: { height: 36, px: 14, fontSize: 13, radius: 10 },
    md: { height: 48, px: 20, fontSize: 15, radius: 14 },
    lg: { height: 56, px: 24, fontSize: 17, radius: 16 },
  };

  const vs = variantStyles[variant];
  const ss = sizeMap[size];

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      activeOpacity={1}
      style={[
        animatedStyle,
        {
          backgroundColor: vs.bg,
          borderWidth: vs.border ? 1.5 : 0,
          borderColor: vs.border,
          height: ss.height,
          paddingHorizontal: ss.px,
          borderRadius: ss.radius,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isDisabled ? 0.5 : 1,
          alignSelf: fullWidth ? 'stretch' : 'auto',
          gap: 8,
        },
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={vs.text} size="small" />
      ) : (
        <>
          {leftIcon}
          <Text
            style={[
              {
                color: vs.text,
                fontSize: ss.fontSize,
                fontWeight: '600',
                letterSpacing: 0.2,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon}
        </>
      )}
    </AnimatedTouchable>
  );
}
