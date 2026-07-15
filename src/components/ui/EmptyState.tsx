import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
  index?: number;
}

export function EmptyState({
  title,
  subtitle,
  icon = 'checkmark-done-circle',
  actionLabel,
  onAction,
  style,
  index = 0,
}: EmptyStateProps) {
  const { theme } = useTheme();

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={[
        {
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
          gap: 16,
        },
        style,
      ]}
    >
      {/* Icon circle */}
      <View
        style={{
          width: 88,
          height: 88,
          borderRadius: 44,
          backgroundColor: `${theme.colors.accent}18`,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={40} color={theme.colors.accent} />
      </View>

      <View style={{ alignItems: 'center', gap: 8 }}>
        <Text
          style={{
            color: theme.colors.text,
            fontSize: 18,
            fontWeight: '700',
            textAlign: 'center',
            letterSpacing: -0.3,
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              color: theme.colors.textSecondary,
              fontSize: 14,
              textAlign: 'center',
              lineHeight: 21,
              maxWidth: 280,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {actionLabel && onAction && (
        <TouchableOpacity
          onPress={onAction}
          style={{
            backgroundColor: theme.colors.accent,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 14,
            marginTop: 4,
          }}
          activeOpacity={0.8}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}
