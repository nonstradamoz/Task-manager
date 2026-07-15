import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { useAnimatedProps, withTiming, useSharedValue } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  label?: string;
  sublabel?: string;
  showPercentage?: boolean;
}

export function ProgressRing({
  percentage,
  size = 120,
  strokeWidth = 10,
  color,
  backgroundColor,
  label,
  sublabel,
  showPercentage = true,
}: ProgressRingProps) {
  const { theme } = useTheme();
  const ringColor = color ?? theme.colors.accent;
  const ringBg = backgroundColor ?? theme.colors.border;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withTiming(percentage / 100, { duration: 1000 });
  }, [percentage]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringBg}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      {/* Center content */}
      <View style={{ alignItems: 'center' }}>
        {showPercentage && (
          <Text
            style={{
              color: theme.colors.text,
              fontSize: size * 0.2,
              fontWeight: '800',
              letterSpacing: -0.5,
            }}
          >
            {Math.round(percentage)}%
          </Text>
        )}
        {label && (
          <Text
            style={{
              color: theme.colors.textSecondary,
              fontSize: size * 0.1,
              fontWeight: '500',
              marginTop: 1,
            }}
          >
            {label}
          </Text>
        )}
        {sublabel && (
          <Text
            style={{
              color: theme.colors.textMuted,
              fontSize: size * 0.08,
            }}
          >
            {sublabel}
          </Text>
        )}
      </View>
    </View>
  );
}
