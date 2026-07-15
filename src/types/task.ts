// ─── Priority ────────────────────────────────────────────────────────────────

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// ─── Repeat Interval ─────────────────────────────────────────────────────────

export enum RepeatInterval {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  CUSTOM = 'custom',
}

// ─── Task Status ─────────────────────────────────────────────────────────────

export enum TaskStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

// ─── View Mode ────────────────────────────────────────────────────────────────

export enum ViewMode {
  LIST = 'list',
  GRID = 'grid',
  KANBAN = 'kanban',
  CALENDAR = 'calendar',
  TIMELINE = 'timeline',
}

// ─── Category ────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  isCustom: boolean;
  userId?: string;
  createdAt: Date;
}

// ─── Attachment ───────────────────────────────────────────────────────────────

export interface Attachment {
  id: string;
  uri: string;
  type: 'image' | 'video' | 'audio' | 'file';
  name: string;
  size?: number;
  uploadedAt: Date;
}

// ─── Task ─────────────────────────────────────────────────────────────────────

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: string; // category id
  priority: Priority;
  status: TaskStatus;
  dueDate?: Date | null;
  dueTime?: string | null; // 'HH:mm'
  reminder?: Date | null;
  repeat: RepeatInterval;
  repeatCustomDays?: number; // for CUSTOM interval
  completed: boolean;
  completedAt?: Date | null;
  color: string;
  attachments: Attachment[];
  notes?: string;
  tags: string[];
  estimatedTime?: number; // minutes
  actualTime?: number; // minutes
  isFavorite: boolean;
  order: number;
  assignedByAdmin?: boolean;
  assignerId?: string;
  assignerName?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Task Form Data ───────────────────────────────────────────────────────────

export interface TaskFormData {
  title: string;
  description?: string;
  category: string;
  priority: Priority;
  dueDate?: Date | null;
  dueTime?: string | null;
  reminder?: Date | null;
  repeat: RepeatInterval;
  color: string;
  tags: string[];
  estimatedTime?: number;
  notes?: string;
  assignedByAdmin?: boolean;
  assignerId?: string;
  assignerName?: string;
}

// ─── Task Filter ──────────────────────────────────────────────────────────────

export interface TaskFilter {
  priority?: Priority[];
  category?: string[];
  status?: TaskStatus[];
  dueToday?: boolean;
  dueTomorrow?: boolean;
  overdue?: boolean;
  completed?: boolean;
  isFavorite?: boolean;
  tags?: string[];
  searchQuery?: string;
  sortBy?: 'dueDate' | 'priority' | 'createdAt' | 'title' | 'order';
  sortOrder?: 'asc' | 'desc';
}

// ─── Statistics ───────────────────────────────────────────────────────────────

export interface DailyStats {
  date: string; // ISO date string
  completed: number;
  created: number;
  focusTime: number; // minutes
}

export interface Statistics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number; // 0–100
  currentStreak: number; // days
  longestStreak: number; // days
  averageTasksPerDay: number;
  totalFocusTime: number; // minutes
  weeklyData: DailyStats[];
  monthlyData: DailyStats[];
  tasksByCategory: Record<string, number>;
  tasksByPriority: Record<Priority, number>;
}
