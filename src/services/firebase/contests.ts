// services/contests.ts
import { db, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, onSnapshot, query, where, arrayUnion, arrayRemove, Timestamp } from '@/lib/firebase';
import { Contest, Contestant } from '@/types';

const contestsCollection = collection(db, 'contests');

export const getContests = async () => {
    const q = query(contestsCollection, where('isActive', '==', true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Contest));
};

export const subscribeToContests = (callback: (contests: Contest[]) => void) => {
    const q = query(contestsCollection, where('isActive', '==', true));
    return onSnapshot(q, (snapshot) => {
        const contestsData = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
            createdAt: docSnap.data().createdAt?.toDate() || new Date(),
        } as Contest));
        callback(contestsData);
    });
};

// Admin functions (for the separate project)
export const addContest = async (contest: Omit<Contest, 'id' | 'createdAt' | 'contestants'>) => {
    const docRef = doc(contestsCollection);
    await setDoc(docRef, {
        ...contest,
        contestants: [],
        createdAt: Timestamp.now(),
    });
    return docRef.id;
};

export const updateContest = async (id: string, contest: Partial<Contest>) => {
    const docRef = doc(db, 'contests', id);
    await updateDoc(docRef, contest);
};

export const deleteContest = async (id: string) => {
    const docRef = doc(db, 'contests', id);
    await deleteDoc(docRef);
};

export const updateContestant = async (contestId: string, contestant: Contestant) => {
    const contestRef = doc(db, 'contests', contestId);
    const contestSnap = await getDoc(contestRef);

    if (contestSnap.exists()) {
        const existingContest = contestSnap.data() as Contest;
        const updatedContestants = existingContest.contestants.map((c: { id: string; }) =>
            c.id === contestant.id ? contestant : c
        );
        await updateDoc(contestRef, { contestants: updatedContestants });
    }
};

export const addContestant = async (contestId: string, contestant: Contestant) => {
    const docRef = doc(db, 'contests', contestId);
    await updateDoc(docRef, {
        contestants: arrayUnion(contestant)
    });
};

export const deleteContestant = async (contestId: string, contestant: Contestant) => {
    const docRef = doc(db, 'contests', contestId);
    await updateDoc(docRef, {
        contestants: arrayRemove(contestant)
    });
};