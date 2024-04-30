import admin from "firebase-admin";

/** Initialize the firebase-admin middleware from the service key file
 */
export function initializeFirebaseAdmin() {
  console.log("initializing firebase");
  admin.initializeApp({
    credential: admin.credential.cert("./admin-service-key.json"),
    databaseURL: process.env.DATABASEURL,
  });
}
