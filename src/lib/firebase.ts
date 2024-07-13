import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

import FIREBASE_CONFIG from './firebase-config';

// Initialize Firebase if it hasn't been initialized yet
if (firebase.apps.length === 0) {
  firebase.initializeApp(FIREBASE_CONFIG);
}

// Firestore settings
firebase.firestore().settings({ experimentalForceLongPolling: true });

// Export auth and firestore instances
export const auth: firebase.auth.Auth = firebase.auth();
export const firestore: firebase.firestore.Firestore = firebase.firestore();
export default firebase;
