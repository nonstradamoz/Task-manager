import React from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

function SkeletonItem({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const { theme } = useTheme();
  const opacity = useSharedValue(1);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.4, { duration: 800 }),
      -1,
      true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        animStyle,
        {
          width: width as number,
          height,
          borderRadius,
          backgroundColor: theme.colors.border,
        },
        style,
      ]}
    />
  );
}

export function SkeletonLoader() {
  const { theme } = useTheme();

  return (
    <View style={{ gap: 12 }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <View
          key={i}
          style={{
            backgroundColor: theme.colors.card,
            borderRadius: 16,
            padding: 16,
            gap: 10,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <SkeletonItem width={40} height={40} borderRadius={12} />
            <View style={{ flex: 1, gap: 6 }}>
              <SkeletonItem width="70%" height={14} />
              <SkeletonItem width="40%" height={11} />
            </View>
            <SkeletonItem width={60} height={24} borderRadius={8} />
          </View>
          <SkeletonItem width="90%" height={11} />
          <SkeletonItem width="60%" height={11} />
        </View>
      ))}
    </View>
  );
}

export { SkeletonItem };
