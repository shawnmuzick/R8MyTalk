/**
 * This file contains controllers related to speaker data for views
 */

import { doc, getDoc } from "@firebase/firestore";
import { db } from "../util.js";

export async function getSpeakerProfile(uid) {
  try {
    const userRef = doc(db, "theFireUsers", uid);
    const userDoc = await getDoc(userRef);
    const data = userDoc.data();
    return {
      firstName: data?.firstName ?? "",
      lastName: data?.lastName ?? "",
      bio: data?.bio ?? "",
      socialLink1: data?.socialLink1 ?? "",
      socialLink2: data?.socialLink2 ?? "",
      socialLink3: data?.socialLink3 ?? "",
    };
  } catch (error) {
    console.log("Error getting data: ", error);
    throw error;
  }
}
