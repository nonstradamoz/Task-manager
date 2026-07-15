// ─── User Profile ─────────────────────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  expoPushToken?: string;
  emailVerified: boolean;
  role?: 'admin' | 'member';
  notificationPreferences?: {
    chat?: boolean;
    tasks?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ─── Auth State ───────────────────────────────────────────────────────────────

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// ─── Login Form ───────────────────────────────────────────────────────────────

export interface LoginFormData {
  email: string;
  password: string;
}

// ─── Register Form ────────────────────────────────────────────────────────────

export interface RegisterFormData {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// ─── Forgot Password Form ─────────────────────────────────────────────────────

export interface ForgotPasswordFormData {
  email: string;
}
