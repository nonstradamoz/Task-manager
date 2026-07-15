import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { firebaseAuth, firestore, COLLECTIONS } from '../../config/firebase';
import { UserProfile } from '../../types/auth';

// ─── Auth Service ─────────────────────────────────────────────────────────────
// All Firebase Auth operations. Swap this class to use Supabase/custom auth.

class AuthService {
  // ─── Register ────────────────────────────────────────────────────────────────

  async register(email: string, password: string, displayName: string): Promise<UserProfile> {
    const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    const { user } = credential;

    // Set display name on the Firebase Auth profile
    await updateProfile(user, { displayName });

    // Create user document in Firestore
    const profile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName,
      photoURL: user.photoURL ?? undefined,
      emailVerified: user.emailVerified,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(firestore, COLLECTIONS.USERS, user.uid), {
      ...profile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return profile;
  }

  // ─── Login ────────────────────────────────────────────────────────────────────

  async login(email: string, password: string): Promise<UserProfile> {
    const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
    return this._mapFirebaseUser(credential.user);
  }

  // ─── Sign Out ─────────────────────────────────────────────────────────────────

  async signOut(): Promise<void> {
    await signOut(firebaseAuth);
  }

  // ─── Forgot Password ──────────────────────────────────────────────────────────

  async sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(firebaseAuth, email);
  }

  // ─── Get User Profile ─────────────────────────────────────────────────────────

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const snap = await getDoc(doc(firestore, COLLECTIONS.USERS, uid));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      uid,
      email: data.email,
      displayName: data.displayName,
      photoURL: data.photoURL,
      emailVerified: data.emailVerified ?? false,
      role: data.role ?? 'member',
      expoPushToken: data.expoPushToken,
      createdAt: data.createdAt?.toDate() ?? new Date(),
      updatedAt: data.updatedAt?.toDate() ?? new Date(),
    };
  }

  // ─── Get All Users ────────────────────────────────────────────────────────────

  async getAllUsers(): Promise<UserProfile[]> {
    const colRef = collection(firestore, COLLECTIONS.USERS);
    const snap = await getDocs(colRef);
    return snap.docs.map(doc => {
      const data = doc.data();
      return {
        uid: doc.id,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        emailVerified: data.emailVerified ?? false,
        role: data.role ?? 'member',
        expoPushToken: data.expoPushToken,
        createdAt: data.createdAt?.toDate() ?? new Date(),
        updatedAt: data.updatedAt?.toDate() ?? new Date(),
      };
    });
  }

  // ─── Update User Role ─────────────────────────────────────────────────────────

  async updateUserRole(uid: string, role: 'admin' | 'member'): Promise<void> {
    const ref = doc(firestore, COLLECTIONS.USERS, uid);
    await setDoc(ref, { role, updatedAt: serverTimestamp() }, { merge: true });
  }

  // ─── Update Push Token ────────────────────────────────────────────────────────

  async updatePushToken(uid: string, expoPushToken: string): Promise<void> {
    const ref = doc(firestore, COLLECTIONS.USERS, uid);
    await setDoc(ref, { expoPushToken, updatedAt: serverTimestamp() }, { merge: true });
  }

  // ─── Auth State Listener ──────────────────────────────────────────────────────

  onAuthStateChanged(callback: (user: UserProfile | null) => void): () => void {
    return onAuthStateChanged(firebaseAuth, async (firebaseUser: FirebaseUser | null) => {
      if (!firebaseUser) {
        callback(null);
        return;
      }
      try {
        const profile = await this.getUserProfile(firebaseUser.uid);
        callback(profile ?? this._mapFirebaseUser(firebaseUser));
      } catch (error) {
        console.warn('Failed to fetch user profile, falling back to auth object:', error);
        callback(this._mapFirebaseUser(firebaseUser));
      }
    });
  }

  // ─── Current User ─────────────────────────────────────────────────────────────

  getCurrentUser(): FirebaseUser | null {
    return firebaseAuth.currentUser;
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  private _mapFirebaseUser(user: FirebaseUser): UserProfile {
    return {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName ?? 'User',
      photoURL: user.photoURL ?? undefined,
      emailVerified: user.emailVerified,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

export const authService = new AuthService();
