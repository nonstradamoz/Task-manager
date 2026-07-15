import { Task, TaskFilter, Category } from '../../types/task';
import { ITaskRepository } from './ITaskRepository';
import { storeData, getData } from '../../storage/asyncStorage';
import { STORAGE_KEYS } from '../../constants';
import { DEFAULT_CATEGORIES } from '../../constants';

// ─── Local (AsyncStorage) Task Repository ────────────────────────────────────
// Used as offline fallback when Firebase is unavailable.

function generateId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export class LocalTaskRepository implements ITaskRepository {
  // ─── Tasks ──────────────────────────────────────────────────────────────────

  async getTasks(_userId: string, _filter?: TaskFilter): Promise<Task[]> {
    const tasks = await getData<Task[]>(STORAGE_KEYS.TASKS) ?? [];
    return tasks;
  }

  async getTaskById(_userId: string, taskId: string): Promise<Task | null> {
    const tasks = await getData<Task[]>(STORAGE_KEYS.TASKS) ?? [];
    return tasks.find(t => t.id === taskId) ?? null;
  }

  async createTask(
    userId: string,
    task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Task> {
    const tasks = await getData<Task[]>(STORAGE_KEYS.TASKS) ?? [];
    const newTask: Task = {
      ...task,
      id: generateId(),
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await storeData(STORAGE_KEYS.TASKS, [...tasks, newTask]);
    return newTask;
  }

  async updateTask(userId: string, taskId: string, updates: Partial<Task>): Promise<Task> {
    const tasks = await getData<Task[]>(STORAGE_KEYS.TASKS) ?? [];
    const idx = tasks.findIndex(t => t.id === taskId);
    if (idx === -1) throw new Error(`Task ${taskId} not found`);
    const updated = { ...tasks[idx], ...updates, updatedAt: new Date() };
    tasks[idx] = updated;
    await storeData(STORAGE_KEYS.TASKS, tasks);
    return updated;
  }

  async deleteTask(_userId: string, taskId: string): Promise<void> {
    const tasks = await getData<Task[]>(STORAGE_KEYS.TASKS) ?? [];
    await storeData(STORAGE_KEYS.TASKS, tasks.filter(t => t.id !== taskId));
  }

  async completeTask(userId: string, taskId: string): Promise<Task> {
    return this.updateTask(userId, taskId, {
      completed: true,
      completedAt: new Date(),
      status: 'completed' as Task['status'],
    });
  }

  async archiveTask(userId: string, taskId: string): Promise<Task> {
    return this.updateTask(userId, taskId, { status: 'archived' as Task['status'] });
  }

  async reorderTasks(_userId: string, taskIds: string[]): Promise<void> {
    const tasks = await getData<Task[]>(STORAGE_KEYS.TASKS) ?? [];
    const reordered = taskIds.map((id, index) => {
      const task = tasks.find(t => t.id === id);
      if (!task) throw new Error(`Task ${id} not found`);
      return { ...task, order: index };
    });
    const rest = tasks.filter(t => !taskIds.includes(t.id));
    await storeData(STORAGE_KEYS.TASKS, [...reordered, ...rest]);
  }

  // ─── Categories ──────────────────────────────────────────────────────────────

  async getCategories(_userId: string): Promise<Category[]> {
    const cats = await getData<Category[]>(STORAGE_KEYS.CATEGORIES);
    if (!cats || cats.length === 0) {
      const defaults: Category[] = DEFAULT_CATEGORIES.map(c => ({
        ...c,
        createdAt: new Date(),
      }));
      await storeData(STORAGE_KEYS.CATEGORIES, defaults);
      return defaults;
    }
    return cats;
  }

  async createCategory(userId: string, category: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
    const cats = await getData<Category[]>(STORAGE_KEYS.CATEGORIES) ?? [];
    const newCat: Category = {
      ...category,
      id: generateId(),
      userId,
      createdAt: new Date(),
    };
    await storeData(STORAGE_KEYS.CATEGORIES, [...cats, newCat]);
    return newCat;
  }

  async updateCategory(_userId: string, categoryId: string, updates: Partial<Category>): Promise<Category> {
    const cats = await getData<Category[]>(STORAGE_KEYS.CATEGORIES) ?? [];
    const idx = cats.findIndex(c => c.id === categoryId);
    if (idx === -1) throw new Error(`Category ${categoryId} not found`);
    cats[idx] = { ...cats[idx], ...updates };
    await storeData(STORAGE_KEYS.CATEGORIES, cats);
    return cats[idx];
  }

  async deleteCategory(_userId: string, categoryId: string): Promise<void> {
    const cats = await getData<Category[]>(STORAGE_KEYS.CATEGORIES) ?? [];
    await storeData(STORAGE_KEYS.CATEGORIES, cats.filter(c => c.id !== categoryId));
  }
}
