import { create } from 'zustand';
import { Task, TaskFilter, Category, TaskStatus } from '../types/task';
import { FirestoreTaskRepository } from '../services/repositories/FirestoreTaskRepository';
import { LocalTaskRepository } from '../services/repositories/LocalTaskRepository';
import { ITaskRepository } from '../services/repositories/ITaskRepository';
import * as Notifications from 'expo-notifications';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ─── Repository Selection ─────────────────────────────────────────────────────
// Switches to LocalTaskRepository when Firebase credentials aren't configured.

const IS_FIREBASE_CONFIGURED =
  process.env.EXPO_PUBLIC_FIREBASE_API_KEY !== undefined &&
  process.env.EXPO_PUBLIC_FIREBASE_API_KEY !== 'YOUR_API_KEY';

const repository: ITaskRepository = IS_FIREBASE_CONFIGURED
  ? new FirestoreTaskRepository()
  : new LocalTaskRepository();

// ─── Task Store ───────────────────────────────────────────────────────────────

interface TaskStore {
  tasks: Task[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  filter: TaskFilter;
  viewMode: 'list' | 'grid' | 'kanban';
  unsubscribe: (() => void) | null;

  // Computed selectors
  getTodaysTasks: () => Task[];
  getUpcomingTasks: () => Task[];
  getOverdueTasks: () => Task[];
  getCompletedTasks: () => Task[];
  getArchivedTasks: () => Task[];
  getTasksByCategory: (categoryId: string) => Task[];
  getFilteredTasks: () => Task[];

  // Actions
  loadTasks: (userId: string) => Promise<void>;
  subscribeToTasks: (userId: string) => void;
  unsubscribeFromTasks: () => void;
  createTask: (userId: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Task>;
  updateTask: (userId: string, taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (userId: string, taskId: string) => Promise<void>;
  completeTask: (userId: string, taskId: string) => Promise<void>;
  archiveTask: (userId: string, taskId: string) => Promise<void>;
  reorderTasks: (userId: string, taskIds: string[]) => Promise<void>;
  setFilter: (filter: Partial<TaskFilter>) => void;
  clearFilter: () => void;
  setViewMode: (mode: 'list' | 'grid' | 'kanban') => void;

  // Categories
  loadCategories: (userId: string) => Promise<void>;
  createCategory: (userId: string, category: Omit<Category, 'id' | 'createdAt'>) => Promise<void>;
  deleteCategory: (userId: string, categoryId: string) => Promise<void>;

  clearError: () => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  categories: [],
  isLoading: false,
  error: null,
  filter: { sortBy: 'createdAt', sortOrder: 'desc' },
  viewMode: 'list',
  unsubscribe: null,

  // ─── Computed Selectors ────────────────────────────────────────────────────

  getTodaysTasks: () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return get().tasks.filter(t => {
      if (t.status === TaskStatus.ARCHIVED) return false;
      if (!t.dueDate) return false;
      const due = new Date(t.dueDate);
      return due >= today && due < tomorrow;
    });
  },

  getUpcomingTasks: () => {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const nextWeek = new Date(tomorrow);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return get().tasks.filter(t => {
      if (t.status === TaskStatus.ARCHIVED || t.completed) return false;
      if (!t.dueDate) return false;
      const due = new Date(t.dueDate);
      return due >= tomorrow && due <= nextWeek;
    });
  },

  getOverdueTasks: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return get().tasks.filter(t => {
      if (t.completed || t.status === TaskStatus.ARCHIVED) return false;
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < today;
    });
  },

  getCompletedTasks: () => get().tasks.filter(t => t.completed),

  getArchivedTasks: () => get().tasks.filter(t => t.status === TaskStatus.ARCHIVED),

  getTasksByCategory: (categoryId) => get().tasks.filter(t => t.category === categoryId),

  getFilteredTasks: () => {
    const { tasks, filter } = get();
    if (!filter || Object.keys(filter).length === 0) return tasks;
    return tasks.filter(t => {
      if (filter.priority?.length && !filter.priority.includes(t.priority)) return false;
      if (filter.category?.length && !filter.category.includes(t.category)) return false;
      if (filter.status?.length && !filter.status.includes(t.status)) return false;
      if (filter.completed !== undefined && t.completed !== filter.completed) return false;
      if (filter.isFavorite && !t.isFavorite) return false;
      if (filter.searchQuery) {
        const q = filter.searchQuery.toLowerCase();
        const match = t.title.toLowerCase().includes(q) ||
          (t.description ?? '').toLowerCase().includes(q) ||
          t.tags.some(tag => tag.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  },

  // ─── Actions ───────────────────────────────────────────────────────────────

  loadTasks: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await repository.getTasks(userId);
      set({ tasks, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  subscribeToTasks: (userId) => {
    get().unsubscribeFromTasks();
    if (!repository.subscribeToTasks) {
      get().loadTasks(userId);
      return;
    }
    const unsub = repository.subscribeToTasks(
      userId,
      (newTasks) => {
        const currentTasks = get().tasks;
        // Check for newly added tasks assigned by an admin
        // We only notify if the app has already loaded tasks (currentTasks.length > 0)
        // to avoid spamming notifications on initial load.
        if (currentTasks.length > 0) {
          const currentTaskIds = new Set(currentTasks.map(t => t.id));
          newTasks.forEach(task => {
            if (!currentTaskIds.has(task.id) && task.assignedByAdmin) {
              Notifications.scheduleNotificationAsync({
                content: {
                  title: 'New Task Assigned! 📋',
                  body: `${task.assignerName || 'Admin'} assigned you: ${task.title}`,
                },
                trigger: null, // trigger immediately
              });
            }
          });
        }
        set({ tasks: newTasks });
      },
      (error) => set({ error: error.message })
    );
    set({ unsubscribe: unsub });
  },

  unsubscribeFromTasks: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null });
    }
  },

  createTask: async (userId, task) => {
    set({ error: null });
    try {
      const newTask = await repository.createTask(userId, task);
      set(state => ({ tasks: [newTask, ...state.tasks] }));
      return newTask;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  updateTask: async (userId, taskId, updates) => {
    try {
      const updated = await repository.updateTask(userId, taskId, updates);
      set(state => ({
        tasks: state.tasks.map(t => t.id === taskId ? updated : t),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  deleteTask: async (userId, taskId) => {
    try {
      await repository.deleteTask(userId, taskId);
      set(state => ({ tasks: state.tasks.filter(t => t.id !== taskId) }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  completeTask: async (userId, taskId) => {
    try {
      const updated = await repository.completeTask(userId, taskId);
      set(state => ({
        tasks: state.tasks.map(t => t.id === taskId ? updated : t),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  archiveTask: async (userId, taskId) => {
    try {
      const updated = await repository.archiveTask(userId, taskId);
      set(state => ({
        tasks: state.tasks.map(t => t.id === taskId ? updated : t),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  reorderTasks: async (userId, taskIds) => {
    try {
      await repository.reorderTasks(userId, taskIds);
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  setFilter: (filter) => set(state => ({ filter: { ...state.filter, ...filter } })),
  clearFilter: () => set({ filter: { sortBy: 'createdAt', sortOrder: 'desc' } }),
  setViewMode: (viewMode) => set({ viewMode }),

  loadCategories: async (userId) => {
    try {
      const categories = await repository.getCategories(userId);
      set({ categories });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  createCategory: async (userId, category) => {
    try {
      const newCat = await repository.createCategory(userId, category);
      set(state => ({ categories: [...state.categories, newCat] }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  deleteCategory: async (userId, categoryId) => {
    try {
      await repository.deleteCategory(userId, categoryId);
      set(state => ({ categories: state.categories.filter(c => c.id !== categoryId) }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  clearError: () => set({ error: null }),
}));
