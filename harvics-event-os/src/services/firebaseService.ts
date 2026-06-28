import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { db, auth } from '../firebase';

export const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
};

function handleFirestoreError(error: unknown, operationType: string, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Seed Data Function
export async function seedInitialData() {
  try {
    const configRef = doc(db, 'events', 'global-discovery-2026');
    const configSnap = await getDoc(configRef);

    if (!configSnap.exists()) {
      console.log('Seeding initial data to Firestore...');
      
      // Event Config
      await setDoc(configRef, {
        name: "HARVICS EVENTOS",
        edition: "Intelligence for Global Discovery",
        primary_color: "#5A0F1A",
        accent_color: "#C6A55A",
        sponsors: [{ name: "Harvics Global Ventures", role: "Strategic Partner" }]
      });

      // Exhibitors
      const exhibitors = [
        { id: 'global-discovery', name: 'Global Discovery Solutions', category: 'Strategic Intelligence', booth: 'Booth A-102', hall: 'Main Hall', description: 'Advanced intelligence solutions for global market discovery and strategic professional networking.', tags: ['Intelligence', 'Strategy', 'Global Discovery'] },
        { id: 'elite-insights', name: 'Elite Market Insights', category: 'Professional Services', booth: 'Booth B-405', hall: 'North Hall', description: 'Premium market analysis and strategic insights for high-level decision makers and global leaders.', tags: ['Insights', 'Analysis', 'Strategy'] },
        { id: 'future-ecosystems', name: 'Future Ecosystems', category: 'Innovation & Tech', booth: 'Booth C-3.1', hall: 'Hall 3', description: 'Designing the next generation of professional ecosystems through technology and collaborative intelligence.', tags: ['Innovation', 'Ecosystems', 'Tech'] },
        { id: 'strategic-ventures', name: 'Strategic Ventures Group', category: 'Business Growth', booth: 'Booth D-201', hall: 'West Hall', description: 'Empowering global growth through strategic investments and intelligent professional discovery.', tags: ['Growth', 'Investment', 'Strategy'] }
      ];
      for (const ex of exhibitors) {
        await setDoc(doc(db, 'exhibitors', ex.id), ex);
      }

      // Agenda
      const agenda = [
        { id: 'opening-keynote', title: 'The Future of Global Discovery', time: '09:00 AM', location: 'Main Stage', speaker: 'Sarah Chen (Harvics Global)', type: 'Keynote' },
        { id: 'intelligence-workshop', title: 'Intelligence-Driven Strategy', time: '11:30 AM', location: 'Innovation Lab', speaker: 'Dr. Hans Mueller', type: 'Workshop' },
        { id: 'market-seminar', title: 'Global Market Intelligence 2026', time: '02:00 PM', location: 'Trend Gallery', speaker: 'Elena Rossi', type: 'Seminar' },
        { id: 'discovery-mixer', title: 'Elite Discovery Networking', time: '05:00 PM', location: 'Sky Lounge', speaker: 'Various', type: 'Networking' }
      ];
      for (const item of agenda) {
        await setDoc(doc(db, 'agenda', item.id), item);
      }

      // Upcoming Events
      const upcoming = [
        { id: 'tech-summit-2026', name: 'Global Tech & AI Summit', date: '15-18 June 2026', location: 'Singapore Expo', description: 'The premier gathering for AI innovators and tech visionaries.', image_url: 'https://picsum.photos/seed/tech/800/400' },
        { id: 'strategy-week-2026', name: 'Global Strategy Week', date: '10-12 Sept 2026', location: 'Milan Fiera', description: 'Redefining the future of global business through strategic innovation.', image_url: 'https://picsum.photos/seed/strategy/800/400' },
        { id: 'innovation-expo-2026', name: 'Future Innovation Expo', date: '22-25 Oct 2026', location: 'London Olympia', description: 'Discover the next generation of professional ecosystems and intelligent growth.', image_url: 'https://picsum.photos/seed/innovation/800/400' }
      ];
      for (const ev of upcoming) {
        await setDoc(doc(db, 'upcoming_events', ev.id), ev);
      }
      console.log('Seeding complete.');
    } else {
      console.log('Data already exists, skipping seed.');
    }
  } catch (error) {
    console.error('Seeding failed:', error);
  }
}

// User Profile
export async function getUserProfile(uid: string) {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}`);
  }
}

export async function createUserProfile(profile: any) {
  try {
    await setDoc(doc(db, 'users', profile.uid), profile);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${profile.uid}`);
  }
}

// Bookmarks
export async function toggleExhibitorBookmark(userId: string, exhibitorId: string, isBookmarked: boolean) {
  try {
    const ref = doc(db, 'users', userId, 'bookmarks', exhibitorId);
    if (isBookmarked) {
      await deleteDoc(ref);
    } else {
      await setDoc(ref, { timestamp: serverTimestamp() });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/bookmarks/${exhibitorId}`);
  }
}

export async function toggleAgendaBookmark(userId: string, agendaId: string, isBookmarked: boolean) {
  try {
    const ref = doc(db, 'users', userId, 'agenda_bookmarks', agendaId);
    if (isBookmarked) {
      await deleteDoc(ref);
    } else {
      await setDoc(ref, { timestamp: serverTimestamp() });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/agenda_bookmarks/${agendaId}`);
  }
}

// Real-time Listeners
export function listenToExhibitors(callback: (data: any[]) => void) {
  return onSnapshot(collection(db, 'exhibitors'), (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => handleFirestoreError(error, OperationType.LIST, 'exhibitors'));
}

export function listenToAgenda(callback: (data: any[]) => void) {
  return onSnapshot(collection(db, 'agenda'), (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => handleFirestoreError(error, OperationType.LIST, 'agenda'));
}

export function listenToConfig(callback: (data: any) => void) {
  return onSnapshot(doc(db, 'events', 'global-discovery-2026'), (doc) => {
    callback(doc.data());
  }, (error) => handleFirestoreError(error, OperationType.GET, 'events/global-discovery-2026'));
}

export function listenToBookmarks(userId: string, callback: (data: string[]) => void) {
  return onSnapshot(collection(db, 'users', userId, 'bookmarks'), (snapshot) => {
    callback(snapshot.docs.map(doc => doc.id));
  }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${userId}/bookmarks`));
}

export function listenToAgendaBookmarks(userId: string, callback: (data: string[]) => void) {
  return onSnapshot(collection(db, 'users', userId, 'agenda_bookmarks'), (snapshot) => {
    callback(snapshot.docs.map(doc => doc.id));
  }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${userId}/agenda_bookmarks`));
}

export function listenToUpcomingEvents(callback: (data: any[]) => void) {
  return onSnapshot(collection(db, 'upcoming_events'), (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => handleFirestoreError(error, OperationType.LIST, 'upcoming_events'));
}
