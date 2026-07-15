import React, { useState, useRef } from 'react';
import { View, Text, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  useAnimatedScrollHandler,
  FadeInDown,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { ONBOARDING_SLIDES } from '../constants';
import { storeData } from '../storage/asyncStorage';
import { STORAGE_KEYS } from '../constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function OnboardingScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler(e => {
    scrollX.value = e.contentOffset.x;
  });

  function goNext() {
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      setCurrentIndex(p => p + 1);
    } else {
      handleGetStarted();
    }
  }

  async function handleGetStarted() {
    await storeData(STORAGE_KEYS.ONBOARDING_COMPLETE, true);
    router.replace('/(auth)/login');
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Animated.FlatList
        ref={flatListRef as any}
        data={ONBOARDING_SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        onMomentumScrollEnd={e => {
          setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH));
        }}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={{ width: SCREEN_WIDTH, flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
            <View style={{
              width: 140, height: 140, borderRadius: 48,
              backgroundColor: `${item.color}20`,
              alignItems: 'center', justifyContent: 'center',
              marginBottom: 40,
              borderWidth: 1, borderColor: `${item.color}40`,
            }}>
              <Ionicons name={item.icon as any} size={64} color={item.color} />
            </View>
            <Animated.View entering={FadeInDown.delay(200).springify()} style={{ alignItems: 'center', gap: 16 }}>
              <Text style={{ color: theme.colors.text, fontSize: 30, fontWeight: '800', textAlign: 'center', letterSpacing: -0.8 }}>
                {item.title}
              </Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 16, textAlign: 'center', lineHeight: 24, maxWidth: 280 }}>
                {item.subtitle}
              </Text>
            </Animated.View>
          </View>
        )}
      />

      {/* Bottom */}
      <View style={{ paddingHorizontal: 32, paddingBottom: insets.bottom + 32, gap: 24 }}>
        {/* Dots */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
          {ONBOARDING_SLIDES.map((_, i) => {
            const dotStyle = useAnimatedStyle(() => ({
              width: interpolate(scrollX.value, [(i - 1) * SCREEN_WIDTH, i * SCREEN_WIDTH, (i + 1) * SCREEN_WIDTH], [8, 24, 8], 'clamp'),
              opacity: interpolate(scrollX.value, [(i - 1) * SCREEN_WIDTH, i * SCREEN_WIDTH, (i + 1) * SCREEN_WIDTH], [0.4, 1, 0.4], 'clamp'),
            }));
            return (
              <Animated.View key={i} style={[dotStyle, { height: 8, borderRadius: 4, backgroundColor: ONBOARDING_SLIDES[currentIndex].color }]} />
            );
          })}
        </View>

        {/* Buttons */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {currentIndex < ONBOARDING_SLIDES.length - 1 && (
            <TouchableOpacity onPress={handleGetStarted} style={{ flex: 1, height: 56, borderRadius: 18, borderWidth: 1.5, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 15, fontWeight: '600' }}>Skip</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={goNext} style={{ flex: 2, height: 56, borderRadius: 18, backgroundColor: ONBOARDING_SLIDES[currentIndex].color, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }} activeOpacity={0.85}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
              {currentIndex === ONBOARDING_SLIDES.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
