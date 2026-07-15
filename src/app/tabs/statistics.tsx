import React, { useEffect } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BarChart, PieChart, LineChart } from 'react-native-chart-kit';
import { useTheme } from '../../contexts/ThemeContext';
import { useTaskStore } from '../../store/taskStore';
import { useStatisticsStore } from '../../store/statisticsStore';
import { StatisticsCard } from '../../components/common/StatisticsCard';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { formatDuration } from '../../utils/dateUtils';
import { COLORS } from '../../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 48;

export default function StatisticsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { tasks } = useTaskStore();
  const { statistics, computeStatistics } = useStatisticsStore();

  useEffect(() => { computeStatistics(tasks); }, [tasks.length]);

  const chartConfig = {
    backgroundColor: theme.colors.card,
    backgroundGradientFrom: theme.colors.card,
    backgroundGradientTo: theme.colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: () => theme.colors.textSecondary,
    style: { borderRadius: 16 },
    propsForDots: { r: '4', strokeWidth: '2', stroke: theme.colors.accent },
    propsForLabels: { fontSize: 11 },
  };

  const weeklyBarData = {
    labels: (statistics?.weeklyData ?? []).map(d => d.date.slice(5)),
    datasets: [{ data: (statistics?.weeklyData ?? []).map(d => d.completed || 0) }],
  };

  const lineData = {
    labels: (statistics?.weeklyData ?? []).map(d => d.date.slice(5)),
    datasets: [{
      data: (statistics?.weeklyData ?? []).map(d => d.created || 0),
      color: () => theme.colors.accent,
      strokeWidth: 2,
    }],
  };

  const pieData = statistics?.tasksByCategory
    ? Object.entries(statistics.tasksByCategory).slice(0, 5).map(([cat, count], i) => ({
        name: cat,
        population: count,
        color: [COLORS.categoryPersonal, COLORS.categoryWork, COLORS.categoryStudy, COLORS.categoryShopping, COLORS.categoryHealth][i % 5],
        legendFontColor: theme.colors.textSecondary,
        legendFontSize: 12,
      }))
    : [];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

      {/* Header */}
      <Animated.View entering={FadeInDown.delay(0).springify()} style={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 20 }}>
        <Text style={{ color: theme.colors.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.8 }}>Statistics</Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 14, marginTop: 4 }}>Your productivity insights</Text>
      </Animated.View>

      {/* Completion Ring + Key Stats */}
      <Animated.View entering={FadeInDown.delay(60).springify()} style={{ marginHorizontal: 20, backgroundColor: theme.colors.card, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: theme.colors.border, flexDirection: 'row', alignItems: 'center', gap: 24, marginBottom: 20 }}>
        <ProgressRing percentage={statistics?.completionRate ?? 0} size={110} strokeWidth={10} label="Rate" color={theme.colors.accent} />
        <View style={{ flex: 1, gap: 14 }}>
          <View>
            <Text style={{ color: theme.colors.textMuted, fontSize: 11, fontWeight: '600', letterSpacing: 0.5 }}>COMPLETION RATE</Text>
            <Text style={{ color: theme.colors.text, fontSize: 22, fontWeight: '800', marginTop: 2 }}>{statistics?.completionRate ?? 0}%</Text>
          </View>
          <View>
            <Text style={{ color: theme.colors.textMuted, fontSize: 11, fontWeight: '600', letterSpacing: 0.5 }}>FOCUS TIME</Text>
            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '700', marginTop: 2 }}>{formatDuration(statistics?.totalFocusTime ?? 0)}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Stats Grid */}
      <Animated.View entering={FadeInDown.delay(100).springify()} style={{ paddingHorizontal: 20, marginBottom: 20, gap: 12 }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <StatisticsCard title="Total Tasks" value={statistics?.totalTasks ?? 0} icon="list" color={theme.colors.accent} />
          <StatisticsCard title="Completed" value={statistics?.completedTasks ?? 0} icon="checkmark-done-circle" color={theme.colors.success} />
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <StatisticsCard title="🔥 Streak" value={`${statistics?.currentStreak ?? 0}d`} icon="flame" color="#f97316" subtitle={`Best: ${statistics?.longestStreak ?? 0} days`} />
          <StatisticsCard title="Avg/Day" value={statistics?.averageTasksPerDay ?? 0} icon="trending-up" color={theme.colors.secondary} />
        </View>
      </Animated.View>

      {/* Weekly Bar Chart */}
      {(statistics?.weeklyData?.length ?? 0) > 0 && (
        <Animated.View entering={FadeInDown.delay(140).springify()} style={{ marginHorizontal: 20, marginBottom: 20 }}>
          <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '700', marginBottom: 14 }}>Weekly Completions</Text>
          <View style={{ backgroundColor: theme.colors.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' }}>
            <BarChart
              data={weeklyBarData}
              width={CHART_WIDTH - 32}
              height={180}
              chartConfig={chartConfig}
              style={{ borderRadius: 12, marginLeft: -16 }}
              showBarTops={false}
              fromZero
              yAxisLabel=""
              yAxisSuffix=""
            />
          </View>
        </Animated.View>
      )}

      {/* Tasks Created Line Chart */}
      {(statistics?.weeklyData?.length ?? 0) > 0 && (
        <Animated.View entering={FadeInDown.delay(180).springify()} style={{ marginHorizontal: 20, marginBottom: 20 }}>
          <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '700', marginBottom: 14 }}>Tasks Created This Week</Text>
          <View style={{ backgroundColor: theme.colors.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' }}>
            <LineChart
              data={lineData}
              width={CHART_WIDTH - 32}
              height={160}
              chartConfig={chartConfig}
              style={{ borderRadius: 12, marginLeft: -16 }}
              bezier
              withShadow={false}
            />
          </View>
        </Animated.View>
      )}

      {/* Pie Chart */}
      {pieData.length > 0 && (
        <Animated.View entering={FadeInDown.delay(220).springify()} style={{ marginHorizontal: 20, marginBottom: 20 }}>
          <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '700', marginBottom: 14 }}>Tasks by Category</Text>
          <View style={{ backgroundColor: theme.colors.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: theme.colors.border }}>
            <PieChart
              data={pieData}
              width={CHART_WIDTH - 32}
              height={180}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>
        </Animated.View>
      )}

      {/* Priority Breakdown */}
      {statistics?.tasksByPriority && (
        <Animated.View entering={FadeInDown.delay(260).springify()} style={{ marginHorizontal: 20, marginBottom: 20 }}>
          <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '700', marginBottom: 14 }}>Priority Breakdown</Text>
          <View style={{ backgroundColor: theme.colors.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: theme.colors.border, gap: 12 }}>
            {([
              { key: 'critical', label: 'Critical', color: COLORS.priorityCritical },
              { key: 'high', label: 'High', color: COLORS.priorityHigh },
              { key: 'medium', label: 'Medium', color: COLORS.priorityMedium },
              { key: 'low', label: 'Low', color: COLORS.priorityLow },
            ] as const).map(({ key, label, color }) => {
              const count = statistics.tasksByPriority[key] ?? 0;
              const total = statistics.totalTasks || 1;
              const pct = (count / total) * 100;
              return (
                <View key={key}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '600' }}>{label}</Text>
                    <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>{count} tasks</Text>
                  </View>
                  <View style={{ height: 8, backgroundColor: theme.colors.border, borderRadius: 4, overflow: 'hidden' }}>
                    <View style={{ height: 8, width: `${pct}%`, backgroundColor: color, borderRadius: 4 }} />
                  </View>
                </View>
              );
            })}
          </View>
        </Animated.View>
      )}
    </ScrollView>
  );
}
