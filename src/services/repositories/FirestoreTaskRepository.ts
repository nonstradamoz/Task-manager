import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { firestore, COLLECTIONS } from '../../config/firebase';
import { Task, TaskFilter, Category, TaskStatus, Priority } from '../../types/task';
import { ITaskRepository } from './ITaskRepository';
import { DEFAULT_CATEGORIES } from '../../constants';
import { notificationService } from '../notifications/NotificationService';

// ─── Firestore Serialization Helpers ─────────────────────────────────────────

function toFirestore(task: Partial<Task>): Record<string, unknown> {
  const data: Record<string, unknown> = { ...task };
  // Convert Date objects to Firestore Timestamps
  if (data.dueDate instanceof Date) data.dueDate = Timestamp.fromDate(data.dueDate as Date);
  if (data.reminder instanceof Date) data.reminder = Timestamp.fromDate(data.reminder as Date);
  if (data.completedAt instanceof Date) data.completedAt = Timestamp.fromDate(data.completedAt as Date);
  if (data.createdAt instanceof Date) data.createdAt = Timestamp.fromDate(data.createdAt as Date);
  if (data.updatedAt instanceof Date) data.updatedAt = Timestamp.fromDate(data.updatedAt as Date);
  return data;
}

function fromFirestore(id: string, data: Record<string, unknown>): Task {
  return {
    ...data,
    id,
    dueDate: data.dueDate instanceof Timestamp ? data.dueDate.toDate() : null,
    reminder: data.reminder instanceof Timestamp ? data.reminder.toDate() : null,
    completedAt: data.completedAt instanceof Timestamp ? data.completedAt.toDate() : null,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
  } as Task;
}

function categoryFromFirestore(id: string, data: Record<string, unknown>): Category {
  return {
    ...data,
    id,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
  } as Category;
}

// ─── Apply Filters ────────────────────────────────────────────────────────────

function applyFilters(tasks: Task[], filter?: TaskFilter): Task[] {
  if (!filter) return tasks;
  let result = [...tasks];
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (filter.priority?.length) {
    result = result.filter(t => filter.priority!.includes(t.priority));
  }
  if (filter.category?.length) {
    result = result.filter(t => filter.category!.includes(t.category));
  }
  if (filter.status?.length) {
    result = result.filter(t => filter.status!.includes(t.status));
  }
  if (filter.completed !== undefined) {
    result = result.filter(t => t.completed === filter.completed);
  }
  if (filter.isFavorite) {
    result = result.filter(t => t.isFavorite);
  }
  if (filter.dueToday) {
    result = result.filter(t => {
      if (!t.dueDate) return false;
      const due = new Date(t.dueDate);
      return due >= today && due < tomorrow;
    });
  }
  if (filter.dueTomorrow) {
    result = result.filter(t => {
      if (!t.dueDate) return false;
      const due = new Date(t.dueDate);
      const dayAfter = new Date(tomorrow);
      dayAfter.setDate(dayAfter.getDate() + 1);
      return due >= tomorrow && due < dayAfter;
    });
  }
  if (filter.overdue) {
    result = result.filter(t => {
      if (!t.dueDate || t.completed) return false;
      return new Date(t.dueDate) < today;
    });
  }
  if (filter.tags?.length) {
    result = result.filter(t => filter.tags!.some(tag => t.tags.includes(tag)));
  }
  if (filter.searchQuery) {
    const q = filter.searchQuery.toLowerCase();
    result = result.filter(t =>
      t.title.toLowerCase().includes(q) ||
      (t.description ?? '').toLowerCase().includes(q) ||
      t.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }
  // Sort
  const sortBy = filter.sortBy ?? 'createdAt';
  const sortOrder = filter.sortOrder ?? 'desc';
  result.sort((a, b) => {
    let valA: number | string = 0;
    let valB: number | string = 0;
    if (sortBy === 'dueDate') {
      valA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      valB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
    } else if (sortBy === 'createdAt') {
      valA = new Date(a.createdAt).getTime();
      valB = new Date(b.createdAt).getTime();
    } else if (sortBy === 'title') {
      valA = a.title;
      valB = b.title;
    } else if (sortBy === 'priority') {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      valA = order[a.priority];
      valB = order[b.priority];
    } else if (sortBy === 'order') {
      valA = a.order;
      valB = b.order;
    }
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return result;
}

// ─── Firestore Task Repository ────────────────────────────────────────────────

export class FirestoreTaskRepository implements ITaskRepository {
  // ─── Tasks ──────────────────────────────────────────────────────────────────

  async getTasks(userId: string, filter?: TaskFilter): Promise<Task[]> {
    const colRef = collection(firestore, COLLECTIONS.tasks(userId));
    const snapshot = await getDocs(colRef);
    const tasks = snapshot.docs.map(d => fromFirestore(d.id, d.data() as Record<string, unknown>));
    return applyFilters(tasks, filter);
  }

  async getTaskById(userId: string, taskId: string): Promise<Task | null> {
    const ref = doc(firestore, COLLECTIONS.tasks(userId), taskId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return fromFirestore(snap.id, snap.data() as Record<string, unknown>);
  }

  async createTask(
    userId: string,
    task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Task> {
    const colRef = collection(firestore, COLLECTIONS.tasks(userId));
    const data = {
      ...toFirestore(task as Partial<Task>),
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(colRef, data);
    const created = await getDoc(docRef);

    // Send push notification if assigned by someone else
    if (task.assignedByAdmin && task.assignerId !== userId) {
      try {
        const userDoc = await getDoc(doc(firestore, COLLECTIONS.USERS, userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.expoPushToken) {
            await notificationService.sendTaskAssignmentNotification(
              userData.expoPushToken,
              task.title,
              task.assignerName || 'Admin'
            );
          }
        }
      } catch (error) {
        console.error('Failed to send push notification:', error);
      }
    }

    return fromFirestore(created.id, created.data() as Record<string, unknown>);
  }

  async updateTask(userId: string, taskId: string, updates: Partial<Task>): Promise<Task> {
    const ref = doc(firestore, COLLECTIONS.tasks(userId), taskId);
    await updateDoc(ref, {
      ...toFirestore(updates),
      updatedAt: serverTimestamp(),
    });
    const snap = await getDoc(ref);
    return fromFirestore(snap.id, snap.data() as Record<string, unknown>);
  }

  async deleteTask(userId: string, taskId: string): Promise<void> {
    await deleteDoc(doc(firestore, COLLECTIONS.tasks(userId), taskId));
  }

  async completeTask(userId: string, taskId: string): Promise<Task> {
    return this.updateTask(userId, taskId, {
      completed: true,
      completedAt: new Date(),
      status: TaskStatus.COMPLETED,
    });
  }

  async archiveTask(userId: string, taskId: string): Promise<Task> {
    return this.updateTask(userId, taskId, { status: TaskStatus.ARCHIVED });
  }

  async reorderTasks(userId: string, taskIds: string[]): Promise<void> {
    const batch = writeBatch(firestore);
    taskIds.forEach((id, index) => {
      const ref = doc(firestore, COLLECTIONS.tasks(userId), id);
      batch.update(ref, { order: index, updatedAt: serverTimestamp() });
    });
    await batch.commit();
  }

  // ─── Real-time Subscription ──────────────────────────────────────────────────

  subscribeToTasks(
    userId: string,
    onUpdate: (tasks: Task[]) => void,
    onError: (error: Error) => void
  ): () => void {
    const colRef = collection(firestore, COLLECTIONS.tasks(userId));
    return onSnapshot(
      colRef,
      snapshot => {
        const tasks = snapshot.docs.map(d =>
          fromFirestore(d.id, d.data() as Record<string, unknown>)
        );
        onUpdate(tasks);
      },
      onError
    );
  }

  // ─── Categories ──────────────────────────────────────────────────────────────

  async getCategories(userId: string): Promise<Category[]> {
    const colRef = collection(firestore, COLLECTIONS.categories(userId));
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      // Seed default categories
      await this._seedDefaultCategories(userId);
      return this.getCategories(userId);
    }
    return snapshot.docs.map(d => categoryFromFirestore(d.id, d.data() as Record<string, unknown>));
  }

  async createCategory(
    userId: string,
    category: Omit<Category, 'id' | 'createdAt'>
  ): Promise<Category> {
    const colRef = collection(firestore, COLLECTIONS.categories(userId));
    const docRef = await addDoc(colRef, {
      ...category,
      userId,
      createdAt: serverTimestamp(),
    });
    const snap = await getDoc(docRef);
    return categoryFromFirestore(snap.id, snap.data() as Record<string, unknown>);
  }

  async updateCategory(
    userId: string,
    categoryId: string,
    updates: Partial<Category>
  ): Promise<Category> {
    const ref = doc(firestore, COLLECTIONS.categories(userId), categoryId);
    await updateDoc(ref, updates);
    const snap = await getDoc(ref);
    return categoryFromFirestore(snap.id, snap.data() as Record<string, unknown>);
  }

  async deleteCategory(userId: string, categoryId: string): Promise<void> {
    await deleteDoc(doc(firestore, COLLECTIONS.categories(userId), categoryId));
  }

  private async _seedDefaultCategories(userId: string): Promise<void> {
    const batch = writeBatch(firestore);
    DEFAULT_CATEGORIES.forEach(cat => {
      const ref = doc(firestore, COLLECTIONS.categories(userId), cat.id);
      batch.set(ref, {
        ...cat,
        userId,
        createdAt: serverTimestamp(),
      });
    });
    await batch.commit();
  }
}
