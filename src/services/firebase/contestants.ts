// services/firebase/contestants.ts
import { db, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, onSnapshot } from '@/lib/firebase';
import { Contestant } from '../../types';

const contestantsCollection = collection(db, 'contestants');

export const getContestants = async (contestId: string, activeOnly: boolean = true) => {
    const q = activeOnly
        ? query(contestantsCollection, where('contestId', '==', contestId), where('isActive', '==', true))
        : query(contestantsCollection, where('contestId', '==', contestId));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Contestant));
};

export const getContestant = async (id: string) => {
    const docRef = doc(db, 'contestants', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Contestant : null;
};

export const addContestant = async (contestant: Omit<Contestant, 'id' | 'votes' | 'amountGained'>) => {
    const docRef = doc(contestantsCollection);
    await setDoc(docRef, {
        ...contestant,
        votes: 0,
        amountGained: 0,
        createdAt: new Date(),
    });
    return docRef.id;
};

export const updateContestant = async (id: string, contestant: Partial<Contestant>) => {
    const docRef = doc(db, 'contestants', id);
    await updateDoc(docRef, contestant);
};

export const deleteContestant = async (id: string) => {
    const docRef = doc(db, 'contestants', id);
    await deleteDoc(docRef);
};

export const subscribeToContestants = (
    contestId: string,
    callback: (contestants: Contestant[]) => void,
    activeOnly: boolean = true
) => {
    const q = activeOnly
        ? query(contestantsCollection, where('contestId', '==', contestId), where('isActive', '==', true))
        : query(contestantsCollection, where('contestId', '==', contestId));

    return onSnapshot(q, (snapshot) => {
        const contestants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Contestant));
        callback(contestants);
    });
};