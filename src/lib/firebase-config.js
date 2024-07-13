// ENV configs for firebase (Super Important!)

export enum FirebaseConfigKeys {
  API_KEY = "apiKey",
  AUTH_DOMAIN = "authDomain",
  PROJECT_ID = "projectId",
  STORAGE_BUCKET = "storageBucket",
  MESSAGING_SENDER_ID = "messagingSenderId",
  APP_ID = "appId",
}

export interface FirebaseConfig {
  [FirebaseConfigKeys.API_KEY]: string;
  [FirebaseConfigKeys.AUTH_DOMAIN]: string;
  [FirebaseConfigKeys.PROJECT_ID]: string;
  [FirebaseConfigKeys.STORAGE_BUCKET]: string;
  [FirebaseConfigKeys.MESSAGING_SENDER_ID]: string;
  [FirebaseConfigKeys.APP_ID]: string;
}

export const FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: "AIzaSyBL4FKAG_mofaxZiG2q0j3543Ims_80GaA",
  authDomain: "jrle-216c1.firebaseapp.com",
  projectId: "jrle-216c1",
  storageBucket: "jrle-216c1.appspot.com",
  messagingSenderId: "21313569188",
  appId: "1:21313569188:web:648724b2e6d6cb8bdd4131",
}

export default FIREBASE_CONFIG;
