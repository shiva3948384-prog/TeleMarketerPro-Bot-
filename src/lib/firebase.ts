import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, collection, getDocs, query, where } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json' with { type: 'json' };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const getGlobalConfig = async () => {
  const docRef = doc(db, 'config', 'global');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    const initialConfig = { bannedUsers: [], admins: [], loggerUsers: [], totalMessagesSent: 0, totalGroupsMessaged: 0 };
    await setDoc(docRef, initialConfig);
    return initialConfig;
  }
};

export const updateGlobalConfig = async (data: any) => {
  const docRef = doc(db, 'config', 'global');
  await updateDoc(docRef, data);
};

export const saveUser = async (userId: number, data: any) => {
  const docRef = doc(db, 'users', userId.toString());
  await setDoc(docRef, data, { merge: true });
};

export const getUser = async (userId: number) => {
  const docRef = doc(db, 'users', userId.toString());
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

export const saveAccount = async (phone: string, data: any) => {
  const docRef = doc(db, 'accounts', phone);
  await setDoc(docRef, data, { merge: true });
};

export const deleteAccount = async (phone: string) => {
  const docRef = doc(db, 'accounts', phone);
  // We don't actually delete from firestore usually in these apps, but let's implement it
  // await deleteDoc(docRef);
  // Actually, for consistency with existing code:
  await setDoc(docRef, { deleted: true }, { merge: true });
};

export const getAllAccounts = async () => {
  const querySnapshot = await getDocs(collection(db, 'accounts'));
  const accounts: any[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (!data.deleted) {
      accounts.push(data);
    }
  });
  return accounts;
};

export const getAllUsers = async () => {
  const querySnapshot = await getDocs(collection(db, 'users'));
  const users: any = {};
  querySnapshot.forEach((doc) => {
    users[doc.id] = doc.data();
  });
  return users;
};
