import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView,
  Platform, Alert, TextInput,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { useTaskStore } from '../../store/taskStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Priority, RepeatInterval, TaskStatus } from '../../types/task';
import { DEFAULT_CATEGORIES } from '../../constants';
import { COLORS } from '../../theme/colors';
import { SAMPLE_USER_ID } from '../../constants/dummyData';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  notes: z.string().optional(),
  estimatedTime: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const PRIORITIES = [
  { value: Priority.LOW, label: 'Low', color: COLORS.priorityLow },
  { value: Priority.MEDIUM, label: 'Medium', color: COLORS.priorityMedium },
  { value: Priority.HIGH, label: 'High', color: COLORS.priorityHigh },
  { value: Priority.CRITICAL, label: 'Critical', color: COLORS.priorityCritical },
];

const REPEATS = [
  { value: RepeatInterval.NONE, label: 'None' },
  { value: RepeatInterval.DAILY, label: 'Daily' },
  { value: RepeatInterval.WEEKLY, label: 'Weekly' },
  { value: RepeatInterval.MONTHLY, label: 'Monthly' },
];

export default function CreateTaskScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { createTask, categories } = useTaskStore();
  
  const { assignTo, assignToName } = useLocalSearchParams<{ assignTo: string; assignToName: string }>();
  const isAssigning = !!assignTo;
  const targetUserId = isAssigning ? assignTo : (user?.uid ?? SAMPLE_USER_ID);

  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [selectedCategory, setSelectedCategory] = useState('personal');
  const [repeat, setRepeat] = useState<RepeatInterval>(RepeatInterval.NONE);
  const [selectedColor, setSelectedColor] = useState<string>(COLORS.taskColors[0]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const allCategories = categories.length > 0 ? categories : DEFAULT_CATEGORIES.map(c => ({ ...c, createdAt: new Date() }));

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '', notes: '', estimatedTime: '' },
  });

  function addTag() {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed]);
    }
    setTagInput('');
  }

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    try {
      await createTask(targetUserId, {
        title: data.title,
        description: data.description,
        notes: data.notes,
        category: selectedCategory,
        priority,
        status: TaskStatus.ACTIVE,
        dueDate,
        dueTime: null,
        reminder: null,
        repeat,
        completed: false,
        completedAt: null,
        color: selectedColor,
        attachments: [],
        tags,
        estimatedTime: data.estimatedTime ? parseInt(data.estimatedTime) : undefined,
        isFavorite: false,
        order: Date.now(),
        userId: targetUserId,
        assignedByAdmin: isAssigning,
        assignerId: isAssigning ? user?.uid : undefined,
        assignerName: isAssigning ? (user?.displayName || 'Admin') : undefined,
      });
      router.back();
    } catch (e) {
      Alert.alert('Error', 'Failed to create task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Animated.View entering={FadeInDown.delay(0).springify()} style={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border }}>
            <Ionicons name="close" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={{ flex: 1, color: theme.colors.text, fontSize: 20, fontWeight: '800' }} numberOfLines={1}>
            {isAssigning ? `Assign to ${assignToName}` : 'New Task'}
          </Text>
          <Button title="Save" onPress={handleSubmit(onSubmit)} isLoading={isLoading} size="sm" />
        </Animated.View>

        <View style={{ paddingHorizontal: 20, gap: 20 }}>

          {/* Title */}
          <Animated.View entering={FadeInDown.delay(60).springify()}>
            <Controller control={control} name="title" render={({ field: { onChange, value, onBlur, ref } }) => (
              <Input ref={ref} label="Task Title *" placeholder="What needs to be done?" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.title?.message} leftIcon="create-outline" />
            )} />
          </Animated.View>

          {/* Description */}
          <Animated.View entering={FadeInDown.delay(80).springify()}>
            <Controller control={control} name="description" render={({ field: { onChange, value, onBlur } }) => (
              <View style={{ gap: 6 }}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 13, fontWeight: '500' }}>Description</Text>
                <TextInput
                  multiline
                  numberOfLines={3}
                  placeholder="Add more details..."
                  placeholderTextColor={theme.colors.textMuted}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  style={{ backgroundColor: theme.colors.card, borderRadius: 14, borderWidth: 1.5, borderColor: theme.colors.border, padding: 14, color: theme.colors.text, fontSize: 15, minHeight: 80, textAlignVertical: 'top' }}
                />
              </View>
            )} />
          </Animated.View>

          {/* Priority */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 13, fontWeight: '500', marginBottom: 10 }}>Priority</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {PRIORITIES.map(p => (
                <TouchableOpacity key={p.value} onPress={() => setPriority(p.value)} style={{ flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', backgroundColor: priority === p.value ? `${p.color}25` : theme.colors.card, borderWidth: 1.5, borderColor: priority === p.value ? p.color : theme.colors.border }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: p.color, marginBottom: 4 }} />
                  <Text style={{ color: priority === p.value ? p.color : theme.colors.textSecondary, fontSize: 11, fontWeight: '700' }}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Category */}
          <Animated.View entering={FadeInDown.delay(120).springify()}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 13, fontWeight: '500', marginBottom: 10 }}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 4 }}>
              {allCategories.map(cat => (
                <TouchableOpacity key={cat.id} onPress={() => setSelectedCategory(cat.id)} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: selectedCategory === cat.id ? `${cat.color}25` : theme.colors.card, borderWidth: 1.5, borderColor: selectedCategory === cat.id ? cat.color : theme.colors.border }}>
                  <Text style={{ color: selectedCategory === cat.id ? cat.color : theme.colors.textSecondary, fontSize: 13, fontWeight: '600' }}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Due Date */}
          <Animated.View entering={FadeInDown.delay(130).springify()}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 13, fontWeight: '500', marginBottom: 10 }}>Due Date</Text>
            <TouchableOpacity 
              onPress={() => setShowDatePicker(true)}
              style={{ backgroundColor: theme.colors.card, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}
            >
              <Ionicons name="calendar-outline" size={20} color={dueDate ? theme.colors.text : theme.colors.textMuted} />
              <Text style={{ color: dueDate ? theme.colors.text : theme.colors.textMuted, fontSize: 15, flex: 1 }}>
                {dueDate ? format(dueDate, 'MMM d, yyyy') : 'No due date'}
              </Text>
              {dueDate && (
                <TouchableOpacity onPress={(e) => { e.stopPropagation(); setDueDate(null); }}>
                  <Ionicons name="close-circle" size={20} color={theme.colors.textMuted} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            {showDatePicker && (
              <View style={Platform.OS === 'ios' ? { marginTop: 10, backgroundColor: theme.colors.card, borderRadius: 12, padding: 10 } : {}}>
                {Platform.OS === 'ios' && (
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 }}>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Text style={{ color: theme.colors.accent, fontWeight: '600', padding: 4 }}>Done</Text>
                    </TouchableOpacity>
                  </View>
                )}
                <DateTimePicker
                  value={dueDate || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  style={{ width: '100%', height: 200 }}
                  onChange={(event, selectedDate) => {
                    if (Platform.OS !== 'ios') {
                      setShowDatePicker(false);
                    }
                    if (selectedDate) setDueDate(selectedDate);
                  }}
                />
              </View>
            )}
          </Animated.View>

          {/* Repeat */}
          <Animated.View entering={FadeInDown.delay(140).springify()}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 13, fontWeight: '500', marginBottom: 10 }}>Repeat</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {REPEATS.map(r => (
                <TouchableOpacity key={r.value} onPress={() => setRepeat(r.value)} style={{ flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', backgroundColor: repeat === r.value ? `${theme.colors.accent}20` : theme.colors.card, borderWidth: 1.5, borderColor: repeat === r.value ? theme.colors.accent : theme.colors.border }}>
                  <Text style={{ color: repeat === r.value ? theme.colors.accent : theme.colors.textSecondary, fontSize: 11, fontWeight: '700' }}>{r.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Color */}
          <Animated.View entering={FadeInDown.delay(160).springify()}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 13, fontWeight: '500', marginBottom: 10 }}>Color</Text>
            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
              {COLORS.taskColors.map(c => (
                <TouchableOpacity key={c} onPress={() => setSelectedColor(c)}>
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c, alignItems: 'center', justifyContent: 'center', borderWidth: selectedColor === c ? 3 : 0, borderColor: theme.colors.text }}>
                    {selectedColor === c && <Ionicons name="checkmark" size={16} color="#fff" />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Tags */}
          <Animated.View entering={FadeInDown.delay(180).springify()}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 13, fontWeight: '500', marginBottom: 10 }}>Tags</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              {tags.map(tag => (
                <TouchableOpacity key={tag} onPress={() => setTags(prev => prev.filter(t => t !== tag))} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: `${theme.colors.accent}20`, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 }}>
                  <Text style={{ color: theme.colors.accent, fontSize: 13, fontWeight: '600' }}>#{tag}</Text>
                  <Ionicons name="close-circle" size={14} color={theme.colors.accent} />
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={addTag}
                placeholder="Add tag..."
                placeholderTextColor={theme.colors.textMuted}
                returnKeyType="done"
                style={{ flex: 1, backgroundColor: theme.colors.card, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 14, height: 44, color: theme.colors.text, fontSize: 14 }}
              />
              <TouchableOpacity onPress={addTag} style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="add" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Estimated Time */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <Controller control={control} name="estimatedTime" render={({ field: { onChange, value, onBlur, ref } }) => (
              <Input ref={ref} label="Estimated Time (minutes)" leftIcon="timer-outline" placeholder="e.g. 30" keyboardType="number-pad" value={value} onChangeText={onChange} onBlur={onBlur} hint="How long do you think this will take?" />
            )} />
          </Animated.View>

          {/* Notes */}
          <Animated.View entering={FadeInDown.delay(220).springify()}>
            <Controller control={control} name="notes" render={({ field: { onChange, value, onBlur } }) => (
              <View style={{ gap: 6 }}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 13, fontWeight: '500' }}>Notes</Text>
                <TextInput
                  multiline
                  numberOfLines={4}
                  placeholder="Any additional notes..."
                  placeholderTextColor={theme.colors.textMuted}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  style={{ backgroundColor: theme.colors.card, borderRadius: 14, borderWidth: 1.5, borderColor: theme.colors.border, padding: 14, color: theme.colors.text, fontSize: 15, minHeight: 100, textAlignVertical: 'top' }}
                />
              </View>
            )} />
          </Animated.View>

          <Button title="Create Task" onPress={handleSubmit(onSubmit)} isLoading={isLoading} fullWidth size="lg" style={{ marginTop: 8 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
