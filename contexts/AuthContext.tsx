import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import {
    User,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { getUserProfile, createUserProfile, UserProfile, setStartDate } from '../services/firestoreService';

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, name: string, role: 'bdr' | 'manager' | 'superadmin') => Promise<void>;
    signInWithGoogle: (role: 'bdr' | 'manager' | 'superadmin') => Promise<void>;
    createUserAsAdmin: (email: string, password: string, name: string, role: 'bdr' | 'manager', managerId?: string | null, startDate?: Date | null) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const isCreatingUser = useRef(false);
    const adminUserCache = useRef<{ user: User | null; profile: UserProfile | null }>({ user: null, profile: null });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            // If we're creating a user as admin, ignore this auth state change
            if (isCreatingUser.current) {
                return;
            }

            setUser(firebaseUser);

            if (firebaseUser) {
                const profile = await getUserProfile(firebaseUser.uid);
                setUserProfile(profile);
            } else {
                setUserProfile(null);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signIn = async (email: string, password: string) => {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const profile = await getUserProfile(result.user.uid);
        setUserProfile(profile);
    };

    const signUp = async (email: string, password: string, name: string, role: 'bdr' | 'manager' | 'superadmin') => {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await createUserProfile(result.user.uid, email, name, role, null);
        const profile = await getUserProfile(result.user.uid);
        setUserProfile(profile);
    };

    const signInWithGoogle = async (role: 'bdr' | 'manager' | 'superadmin') => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);

        // Check if user profile exists
        let profile = await getUserProfile(result.user.uid);

        if (!profile) {
            // Create profile for new Google users
            const displayName = result.user.displayName || result.user.email?.split('@')[0] || 'User';
            await createUserProfile(result.user.uid, result.user.email || '', displayName, role, null);
            profile = await getUserProfile(result.user.uid);
        }

        setUserProfile(profile);
    };

    const createUserAsAdmin = async (email: string, password: string, name: string, role: 'bdr' | 'manager', managerId: string | null = null, startDate: Date | null = null) => {
        // Cache the current admin's auth state
        adminUserCache.current = { user, profile: userProfile };

        // Set flag to ignore auth state changes
        isCreatingUser.current = true;

        try {
            // Create the new user (this will temporarily sign in as them)
            const result = await createUserWithEmailAndPassword(auth, email, password);
            await createUserProfile(result.user.uid, email, name, role, managerId);

            // If BDR and start date provided, set it immediately
            if (role === 'bdr' && startDate) {
                await setStartDate(result.user.uid, startDate);
            }

            // Sign out the newly created user
            await firebaseSignOut(auth);

            // Restore the admin's state manually
            setUser(adminUserCache.current.user);
            setUserProfile(adminUserCache.current.profile);
        } catch (error) {
            // If creation failed, restore admin state
            setUser(adminUserCache.current.user);
            setUserProfile(adminUserCache.current.profile);
            throw error;
        } finally {
            // Re-enable auth state listening
            isCreatingUser.current = false;
        }
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
        setUserProfile(null);
    };

    const value = {
        user,
        userProfile,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        createUserAsAdmin,
        signOut
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
