import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/** Initialize the Firebase app from the .env config values
 * @returns FirebaseApp
 */
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

/** Initialize the Firebase database module
 * @param {FirebaseApp} fbapp
 * @returns Firestore
 */
export function getFirebaseDB(fbapp) {
  return getFirestore(fbapp);
}

/** Initialize the Firebase auth module
 * @param {FirebaseApp} fbapp
 * @returns Auth
 */
export function getFirebaseAuth(fbapp) {
  return getAuth(fbapp);
}

/** Initialize the Firebase storage module
 * @param {FirebaseApp} fbapp
 * @returns FirebaseStorage
 */
export function getFirebaseStorage(fbapp) {
  return getStorage(fbapp);
}
