import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

export function initializeFirebaseApp() {
  const firebaseConfig = {
    apiKey: process.env.APIKEY,
    authDomain: process.env.AUTHDOMAIN,
    databaseURL: process.env.DATABASEURL,
    projectId: process.env.PROJECTID,
    storageBucket: process.env.STORAGEBUCKET,
    messagingSenderId: process.env.MESSAGINGSENDERID,
    appId: process.env.APPID,
    measurementId: process.env.MEASUREMENTID,
  };
  return initializeApp(firebaseConfig);
}
export function getFirebaseDB(fbapp) {
  return getFirestore(fbapp);
}
export function getFirebaseAuth(fbapp) {
  return getAuth(fbapp);
}
export function getFirebaseStorage(fbapp) {
  return getStorage(fbapp);
}
