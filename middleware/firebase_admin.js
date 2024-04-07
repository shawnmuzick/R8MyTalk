import admin from "firebase-admin";

export function initializeFirebaseAdmin() {
  console.log("initializing firebase");
  admin.initializeApp({
    credential: admin.credential.cert("./admin-service-key.json"),
    databaseURL: process.env.DATABASEURL,
  });
}
