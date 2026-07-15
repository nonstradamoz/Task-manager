import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface StatisticsCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  subtitle?: string;
  trend?: number; // positive = up, negative = down
  style?: ViewStyle;
}

export function StatisticsCard({
  title,
  value,
  icon,
  color,
  subtitle,
  trend,
  style,
}: StatisticsCardProps) {
  const { theme } = useTheme();
  const cardColor = color ?? theme.colors.accent;

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.card,
          borderRadius: 18,
          padding: 16,
          borderWidth: 1,
          borderColor: theme.colors.border,
          gap: 12,
          flex: 1,
          minWidth: 140,
        },
        style,
      ]}
    >
      {/* Icon */}
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: `${cardColor}20`,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={20} color={cardColor} />
      </View>

      {/* Value */}
      <View>
        <Text
          style={{
            color: theme.colors.text,
            fontSize: 26,
            fontWeight: '800',
            letterSpacing: -0.8,
          }}
        >
          {value}
        </Text>
        <Text
          style={{
            color: theme.colors.textSecondary,
            fontSize: 12,
            fontWeight: '500',
            marginTop: 2,
          }}
        >
          {title}
        </Text>
      </View>

      {/* Trend */}
      {trend !== undefined && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons
            name={trend >= 0 ? 'trending-up' : 'trending-down'}
            size={14}
            color={trend >= 0 ? theme.colors.success : theme.colors.error}
          />
          <Text
            style={{
              color: trend >= 0 ? theme.colors.success : theme.colors.error,
              fontSize: 12,
              fontWeight: '600',
            }}
          >
            {Math.abs(trend)}% {trend >= 0 ? 'increase' : 'decrease'}
          </Text>
        </View>
      )}

      {subtitle && !trend && (
        <Text style={{ color: theme.colors.textMuted, fontSize: 11 }}>{subtitle}</Text>
      )}
    </View>
  );
}
