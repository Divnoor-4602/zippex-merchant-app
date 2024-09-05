// sdk functions
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAmUOnLyHOVkrKW0AaQvz1qRf4S2e5ONBc",
  authDomain: "zippex-71294.firebaseapp.com",
  projectId: "zippex-71294",
  storageBucket: "zippex-71294.appspot.com",
  messagingSenderId: "862442456268",
  appId: "1:862442456268:web:4bef673cc2ef7736a36e69",
};

// initialize firebase
const app = initializeApp(firebaseConfig);

// firebase auth

export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
export const storage = getStorage(app);
