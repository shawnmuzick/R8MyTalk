/**
 * This file contains controllers related to speaker data for views
 */

import { collection, doc, getDoc, getDocs } from "@firebase/firestore";
import { db } from "../util.js";

export async function getSpeakerProfile(req, res) {
  try {
    const uid = req.params.id;
    const userRef = doc(db, "theFireUsers", uid);
    const userDoc = await getDoc(userRef);
    const data = userDoc.data();
    const speaker = {
      firstName: data.firstName,
      lastName: data.lastName,
      bio: data.bio,
      socialLink1: data.socialLink1,
      socialLink2: data.socialLink2,
      socialLink3: data.socialLink3,
    };

    res.json({ data: speaker });
  } catch (error) {
    console.log("Error getting data: ", error);
    res.status(500);
    res.send({ message: error });
  }
}
