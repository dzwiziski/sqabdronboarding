import { db } from './firebase';
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    collection,
    query,
    where,
    getDocs,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { ActivityState, CertificationEvidence } from '../types';

// User types
export interface UserProfile {
    email: string;
    name: string;
    role: 'bdr' | 'manager' | 'superadmin';
    managerId: string | null;
    createdAt: Timestamp;
}

export interface BDROnboardingData {
    startDate: Timestamp | null;  // NEW: BDR's start date
    completedActivities: ActivityState;
    evidence: Record<string, CertificationEvidence>;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface ManagerNotesData {
    dailyNotes: Record<string, string>;
    weeklySummary: Record<string, string>;
    checklist: Record<string, boolean>;
    updatedAt: Timestamp;
}

// ============ USER OPERATIONS ============

export async function createUserProfile(
    userId: string,
    email: string,
    name: string,
    role: 'bdr' | 'manager' | 'superadmin',
    managerId: string | null = null
): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
        email,
        name,
        role,
        managerId,
        createdAt: serverTimestamp()
    });
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? (userSnap.data() as UserProfile) : null;
}

export async function updateUserProfile(
    userId: string,
    updates: { name?: string; role?: 'bdr' | 'manager' | 'superadmin'; managerId?: string | null }
): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, updates);
}

export async function deleteUserProfile(userId: string): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
}

export async function getAllUsers(): Promise<{ id: string; profile: UserProfile }[]> {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(doc => ({ id: doc.id, profile: doc.data() as UserProfile }));
}

export async function getBDRsForManager(managerId: string): Promise<{ id: string; profile: UserProfile }[]> {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('managerId', '==', managerId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, profile: doc.data() as UserProfile }));
}

export async function getAllBDRs(): Promise<{ id: string; profile: UserProfile }[]> {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', 'bdr'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, profile: doc.data() as UserProfile }));
}

// ============ BDR ONBOARDING DATA ============

export async function getBDROnboardingData(bdrUserId: string): Promise<BDROnboardingData | null> {
    const docRef = doc(db, 'bdrOnboarding', bdrUserId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as BDROnboardingData) : null;
}

export async function saveBDROnboardingData(
    bdrUserId: string,
    completedActivities: ActivityState,
    evidence: Record<string, CertificationEvidence>
): Promise<void> {
    const docRef = doc(db, 'bdrOnboarding', bdrUserId);
    const existing = await getDoc(docRef);

    if (existing.exists()) {
        await updateDoc(docRef, {
            completedActivities,
            evidence,
            updatedAt: serverTimestamp()
        });
    } else {
        await setDoc(docRef, {
            completedActivities,
            evidence,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
    }
}

export async function updateCompletedActivities(
    bdrUserId: string,
    completedActivities: ActivityState
): Promise<void> {
    const docRef = doc(db, 'bdrOnboarding', bdrUserId);
    const existing = await getDoc(docRef);

    if (existing.exists()) {
        await updateDoc(docRef, { completedActivities, updatedAt: serverTimestamp() });
    } else {
        await setDoc(docRef, {
            completedActivities,
            evidence: {},
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
    }
}

export async function updateEvidence(
    bdrUserId: string,
    evidence: Record<string, CertificationEvidence>
): Promise<void> {
    const docRef = doc(db, 'bdrOnboarding', bdrUserId);
    const existing = await getDoc(docRef);

    if (existing.exists()) {
        await updateDoc(docRef, { evidence, updatedAt: serverTimestamp() });
    } else {
        await setDoc(docRef, {
            startDate: null,
            completedActivities: {},
            evidence,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
    }
}

export async function setStartDate(bdrUserId: string, startDate: Date): Promise<void> {
    const docRef = doc(db, 'bdrOnboarding', bdrUserId);
    const existing = await getDoc(docRef);

    if (existing.exists()) {
        await updateDoc(docRef, {
            startDate: Timestamp.fromDate(startDate),
            updatedAt: serverTimestamp()
        });
    } else {
        await setDoc(docRef, {
            startDate: Timestamp.fromDate(startDate),
            completedActivities: {},
            evidence: {},
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
    }
}

// ============ MANAGER NOTES ============


export async function getManagerNotes(managerId: string, bdrUserId: string): Promise<ManagerNotesData | null> {
    const docRef = doc(db, 'managerNotes', managerId, 'bdrs', bdrUserId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as ManagerNotesData) : null;
}

export async function saveManagerNotes(
    managerId: string,
    bdrUserId: string,
    data: { dailyNotes: Record<string, string>; weeklySummary: Record<string, string>; checklist: Record<string, boolean> }
): Promise<void> {
    const docRef = doc(db, 'managerNotes', managerId, 'bdrs', bdrUserId);
    await setDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
    }, { merge: true });
}
