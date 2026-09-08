import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
const firebaseConfig = {
    apiKey: "AIzaSyCSS93bFXP9L6oSgLBSToQFJda4JSmRn1c",
    authDomain: "criminal-minds-21441.firebaseapp.com",
    projectId: "criminal-minds-21441",
    storageBucket: "criminal-minds-21441.firebasestorage.app",
    messagingSenderId: "493948674164",
    appId: "1:493948674164:web:daabb440a44921e6a5f121"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence);
