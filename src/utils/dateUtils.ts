import {
  format,
  formatDistanceToNow,
  isToday,
  isTomorrow,
  isYesterday,
  isPast,
  isFuture,
  differenceInDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addDays,
} from 'date-fns';

// ─── Formatting ───────────────────────────────────────────────────────────────

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d, yyyy');
}

export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return '';
  return format(new Date(date), 'h:mm a');
}

export function formatTimeString(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes);
  return format(date, 'h:mm a');
}

export function formatRelative(date: Date | string | null | undefined): string {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

// ─── Checks ───────────────────────────────────────────────────────────────────

export function isOverdue(dueDate: Date | null | undefined, completed: boolean): boolean {
  if (!dueDate || completed) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dueDate) < today;
}

export function isDueToday(dueDate: Date | null | undefined): boolean {
  if (!dueDate) return false;
  return isToday(new Date(dueDate));
}

export function isDueSoon(dueDate: Date | null | undefined): boolean {
  if (!dueDate) return false;
  const days = differenceInDays(new Date(dueDate), new Date());
  return days >= 0 && days <= 3;
}

// ─── Calendar Helpers ─────────────────────────────────────────────────────────

export function getWeekDays(date: Date): Date[] {
  return eachDayOfInterval({
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 }),
  });
}

export function getMonthDays(date: Date): Date[] {
  return eachDayOfInterval({
    start: startOfMonth(date),
    end: endOfMonth(date),
  });
}

export function getCalendarGrid(date: Date): (Date | null)[] {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const days = eachDayOfInterval({ start, end });

  // Pad start with nulls (Mon = 1, so shift by dayOfWeek - 1)
  const startDay = (start.getDay() + 6) % 7; // Convert to Mon-first
  const prefix: null[] = Array(startDay).fill(null);

  return [...prefix, ...days];
}

export function formatDayOfWeek(date: Date): string {
  return format(date, 'EEE');
}

export function formatMonthYear(date: Date): string {
  return format(date, 'MMMM yyyy');
}

export function formatDayNumber(date: Date): string {
  return format(date, 'd');
}

export function formatFullDate(date: Date): string {
  return format(date, 'EEEE, MMMM d');
}

// ─── Date Generation ──────────────────────────────────────────────────────────

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function getTodayFormatted(): string {
  return format(new Date(), 'EEEE, MMMM d');
}
