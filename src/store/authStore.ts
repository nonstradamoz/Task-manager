import { create } from 'zustand';
import { UserProfile } from '../types/auth';
import { authService } from '../services/auth/AuthService';

interface AuthStore {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updateUserRole: (uid: string, role: 'admin' | 'member') => Promise<void>;
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.login(email, password);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: unknown) {
      const message = getFirebaseErrorMessage(error);
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  register: async (email, password, displayName) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.register(email, password, displayName);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: unknown) {
      const message = getFirebaseErrorMessage(error);
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.signOut();
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  sendPasswordReset: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await authService.sendPasswordReset(email);
      set({ isLoading: false });
    } catch (error: unknown) {
      const message = getFirebaseErrorMessage(error);
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  updateUserRole: async (uid, role) => {
    set({ isLoading: true, error: null });
    try {
      await authService.updateUserRole(uid, role);
      // Update local state if it's the current user
      const currentUser = get().user;
      if (currentUser?.uid === uid) {
        set({ user: { ...currentUser, role }, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  clearError: () => set({ error: null }),
}));

// ─── Firebase Error Messages ───────────────────────────────────────────────────

function getFirebaseErrorMessage(error: unknown): string {
  const code = (error as { code?: string }).code ?? '';
  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/invalid-credential': 'Invalid email or password.',
  };
  return messages[code] ?? (error as Error).message ?? 'An unexpected error occurred.';
}
