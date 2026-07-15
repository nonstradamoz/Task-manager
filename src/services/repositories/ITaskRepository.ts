import { Task, TaskFilter, Category } from '../../types/task';

// ─── Task Repository Interface ────────────────────────────────────────────────
// Implement this interface to swap between local/Firebase/API storage.

export interface ITaskRepository {
  // Tasks
  getTasks(userId: string, filter?: TaskFilter): Promise<Task[]>;
  getTaskById(userId: string, taskId: string): Promise<Task | null>;
  createTask(userId: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task>;
  updateTask(userId: string, taskId: string, updates: Partial<Task>): Promise<Task>;
  deleteTask(userId: string, taskId: string): Promise<void>;
  completeTask(userId: string, taskId: string): Promise<Task>;
  archiveTask(userId: string, taskId: string): Promise<Task>;
  reorderTasks(userId: string, taskIds: string[]): Promise<void>;

  // Categories
  getCategories(userId: string): Promise<Category[]>;
  createCategory(userId: string, category: Omit<Category, 'id' | 'createdAt'>): Promise<Category>;
  updateCategory(userId: string, categoryId: string, updates: Partial<Category>): Promise<Category>;
  deleteCategory(userId: string, categoryId: string): Promise<void>;

  // Real-time subscription (optional - Firestore supports this)
  subscribeToTasks?(
    userId: string,
    onUpdate: (tasks: Task[]) => void,
    onError: (error: Error) => void,
  ): () => void; // returns unsubscribe function
}
