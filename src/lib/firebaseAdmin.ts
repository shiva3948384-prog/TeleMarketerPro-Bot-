import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

const configPath = join(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(readFileSync(configPath, 'utf8'));

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: firebaseConfig.projectId,
    });
  }
} catch (e) {
  console.error('❌ Firebase Admin Initialization Error:', e);
}

export const db = firebaseConfig.firestoreDatabaseId 
  ? admin.firestore(firebaseConfig.firestoreDatabaseId)
  : admin.firestore();

// Set settings to be more resilient
try {
  db.settings({ ignoreUndefinedProperties: true });
} catch (e) {
  console.warn('Firestore settings update failed (might already be set):', e);
}

export const getDB = async () => {
  try {
    const doc = await db.collection('app').doc('state').get();
    if (doc.exists) {
      return doc.data();
    }
  } catch (err) {
    console.error('Error fetching from Firebase:', err);
  }
  return null;
};

export const syncDB = async (data: any) => {
  try {
    await db.collection('app').doc('state').set(data, { merge: true });
  } catch (err: any) {
    console.error(`❌ SyncDB Error: ${err.message || err}`);
    if (err.message?.includes('NOT_FOUND')) {
      console.warn('⚠️ Firestore Document/Database not found. Make sure Firebase is fully provisioned.');
    }
    throw err; // Still throw to let the caller decide
  }
};
