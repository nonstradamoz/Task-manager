import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeInDown,
  SlideOutLeft,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Task, Priority } from '../../types/task';
import { formatDate, isOverdue, isDueSoon } from '../../utils/dateUtils';
import { getPriorityColor, getPriorityLabel } from '../../utils/taskUtils';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
  onComplete: () => void;
  onDelete: () => void;
  onArchive: () => void;
  index?: number;
  showCategory?: boolean;
  categoryName?: string;
}

const SWIPE_THRESHOLD = 80;
const ACTION_WIDTH = 80;

export function TaskCard({
  task,
  onPress,
  onComplete,
  onDelete,
  onArchive,
  index = 0,
  showCategory = true,
  categoryName,
}: TaskCardProps) {
  const { theme } = useTheme();
  const translateX = useSharedValue(0);
  const cardOpacity = useSharedValue(1);
  const checkScale = useSharedValue(1);

  const overdue = isOverdue(task.dueDate, task.completed);
  const dueSoon = isDueSoon(task.dueDate);
  const priorityColor = getPriorityColor(task.priority);

  // ─── Swipe Gesture ────────────────────────────────────────────────────────

  const swipe = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate(e => {
      // Allow left swipe (negative) and right swipe (positive)
      if (e.translationX < 0) {
        translateX.value = Math.max(e.translationX, -ACTION_WIDTH * 2);
      } else {
        translateX.value = Math.min(e.translationX, ACTION_WIDTH);
      }
    })
    .onEnd(e => {
      if (e.translationX < -SWIPE_THRESHOLD) {
        // Reveal delete/archive actions
        translateX.value = withSpring(-ACTION_WIDTH * 2);
      } else if (e.translationX > SWIPE_THRESHOLD) {
        // Complete task on right swipe
        runOnJS(onComplete)();
        translateX.value = withSpring(0);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: cardOpacity.value,
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  function handleComplete() {
    checkScale.value = withSpring(1.3, { damping: 6 }, () => {
      checkScale.value = withSpring(1);
    });
    onComplete();
  }

  const dateColor = overdue
    ? theme.colors.error
    : dueSoon && !task.completed
    ? theme.colors.warning
    : theme.colors.textMuted;

  const actionContainerStyle = useAnimatedStyle(() => {
    let opacity = 0;
    if (translateX.value < 0) {
      opacity = Math.min(1, Math.abs(translateX.value) / 40);
    }
    return {
      opacity,
    };
  });

  return (
    <Animated.View 
      entering={FadeInDown.delay(index * 60).springify().damping(18)}
      exiting={SlideOutLeft.duration(300)}
      style={{ position: 'relative', marginBottom: 10 }}
    >
      {/* Background action buttons (revealed on left swipe) */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            flexDirection: 'row',
            alignItems: 'center',
            paddingRight: 4,
            paddingLeft: 16,
            backgroundColor: theme.colors.card,
            borderRadius: 18,
          },
          actionContainerStyle
        ]}
      >
        <TouchableOpacity
          onPress={onArchive}
          style={{
            width: ACTION_WIDTH,
            height: '90%',
            backgroundColor: theme.colors.info,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 14,
            marginRight: 4,
          }}
        >
          <Ionicons name="archive" size={22} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600', marginTop: 2 }}>
            Archive
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onDelete}
          style={{
            width: ACTION_WIDTH,
            height: '90%',
            backgroundColor: theme.colors.error,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 14,
          }}
        >
          <Ionicons name="trash" size={22} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600', marginTop: 2 }}>
            Delete
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Main card */}
      <GestureDetector gesture={swipe}>
        <Animated.View
          style={[
            cardStyle,
            {
              backgroundColor: task.assignedByAdmin ? `${theme.colors.accent}10` : theme.colors.card,
              borderRadius: 18,
              borderWidth: task.assignedByAdmin ? 1.5 : 1,
              borderColor: task.assignedByAdmin ? theme.colors.accent : theme.colors.border,
              overflow: 'hidden',
            },
          ]}
        >
          {/* Priority left border */}
          <View
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 4,
              backgroundColor: priorityColor,
              borderTopLeftRadius: 18,
              borderBottomLeftRadius: 18,
            }}
          />

          <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={{ padding: 16, paddingLeft: 20 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              {/* Checkbox */}
              <Animated.View style={checkStyle}>
                <TouchableOpacity onPress={handleComplete} hitSlop={10}>
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      borderWidth: task.completed ? 0 : 2,
                      borderColor: task.completed ? 'transparent' : theme.colors.border,
                      backgroundColor: task.completed ? priorityColor : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 1,
                    }}
                  >
                    {task.completed && (
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    )}
                  </View>
                </TouchableOpacity>
              </Animated.View>

              {/* Content */}
              <View style={{ flex: 1, gap: 4 }}>
                <Text
                  style={{
                    color: task.completed ? theme.colors.textMuted : theme.colors.text,
                    fontSize: 15,
                    fontWeight: '600',
                    textDecorationLine: task.completed ? 'line-through' : 'none',
                    letterSpacing: -0.2,
                  }}
                  numberOfLines={2}
                >
                  {task.title}
                </Text>

                {task.description ? (
                  <Text
                    style={{
                      color: theme.colors.textSecondary,
                      fontSize: 13,
                      lineHeight: 19,
                    }}
                    numberOfLines={1}
                  >
                    {task.description}
                  </Text>
                ) : null}

                {/* Meta row */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    marginTop: 4,
                    flexWrap: 'wrap',
                  }}
                >
                  {task.assignedByAdmin && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: theme.colors.accent, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                      <Ionicons name="person" size={10} color="#fff" />
                      <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{task.assignerName || 'Admin'}</Text>
                    </View>
                  )}

                  {/* Priority badge */}
                  <View
                    style={{
                      backgroundColor: `${priorityColor}20`,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: priorityColor,
                        fontSize: 11,
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: 0.4,
                      }}
                    >
                      {getPriorityLabel(task.priority)}
                    </Text>
                  </View>

                  {/* Due date */}
                  {task.dueDate && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                      <Ionicons
                        name={overdue ? 'alert-circle' : 'calendar-outline'}
                        size={12}
                        color={dateColor}
                      />
                      <Text style={{ color: dateColor, fontSize: 12, fontWeight: '500' }}>
                        {formatDate(task.dueDate)}
                      </Text>
                    </View>
                  )}

                  {/* Tags */}
                  {task.tags.slice(0, 2).map(tag => (
                    <View
                      key={tag}
                      style={{
                        backgroundColor: theme.colors.glassBorder,
                        paddingHorizontal: 7,
                        paddingVertical: 2,
                        borderRadius: 6,
                      }}
                    >
                      <Text style={{ color: theme.colors.textMuted, fontSize: 11 }}>#{tag}</Text>
                    </View>
                  ))}

                  {/* Attachments indicator */}
                  {task.attachments.length > 0 && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                      <Ionicons name="attach" size={13} color={theme.colors.textMuted} />
                      <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>
                        {task.attachments.length}
                      </Text>
                    </View>
                  )}

                  {/* Repeat indicator */}
                  {task.repeat !== 'none' && (
                    <Ionicons name="repeat" size={13} color={theme.colors.accent} />
                  )}

                  {/* Favorite */}
                  {task.isFavorite && (
                    <Ionicons name="star" size={13} color={theme.colors.warning} />
                  )}
                </View>
              </View>

              {/* Color dot and swipe indicator */}
              <View style={{ alignItems: 'center', marginTop: 5, gap: 12 }}>
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: task.color,
                  }}
                />
                <Ionicons name="chevron-back" size={14} color={theme.colors.textMuted} style={{ opacity: 0.5 }} />
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}
