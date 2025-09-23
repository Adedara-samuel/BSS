// services/events.ts
import { db, collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, where, getDocs } from '@/lib/firebase';
import { Event } from '@/types';

const eventsCollection = collection(db, 'events');

export const getEvents = async () => {
    const q = query(eventsCollection, where('isFeatured', '==', true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
};

export const subscribeToEvents = (callback: (events: Event[]) => void) => {
    return onSnapshot(eventsCollection, (snapshot) => {
        const eventsData = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
        } as Event));
        callback(eventsData);
    });
};

// Admin functions (for the separate project)
export const addEvent = async (event: Omit<Event, 'id'>) => {
    const docRef = await addDoc(eventsCollection, event);
    return docRef.id;
};

export const updateEvent = async (id: string, event: Partial<Event>) => {
    const docRef = doc(db, 'events', id);
    await updateDoc(docRef, event);
};

export const deleteEvent = async (id: string) => {
    const docRef = doc(db, 'events', id);
    await deleteDoc(docRef);
};