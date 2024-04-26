import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "@firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { db, storage } from "../index.js";
import { readEventInfoFromDB, spaceToHyphen } from "../util.js";

export async function deleteEventFromStorage(eventName, uid) {
  try {
    const fileRef = ref(storage, `${uid}/${eventName}/uploadedFile`);
    const qrRef = ref(storage, `${uid}/${eventName}/${eventName}.png`);
    await deleteObject(qrRef);
    await deleteObject(fileRef);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getEventRef(uid, eventName) {
  try {
    return doc(
      db,
      "theFireUsers",
      uid,
      "userEventList",
      spaceToHyphen(eventName),
    );
  } catch (error) {
    console.log("Error getting event ref: ", error);
    throw error;
  }
}

export async function getFeedbackData(req, res) {
  try {
    const user = req.session.user;
    const eventName = req.body.eventName;
    const dbEventInfo = await readEventInfoFromDB(user.uid, eventName);
    res.send(dbEventInfo);
  } catch (error) {
    console.log("Error getting data: ", error);
    res.status(500).send({ message: error });
  }
}

export async function getEventList(req, res) {
  const events = [];
  try {
    const uid = req.params.id;
    const userRef = doc(db, "theFireUsers", uid);
    const eventList = collection(userRef, "userEventList");
    const docs = await getDocs(eventList);

    await Promise.all(
      docs.docs.map(async (talkEvent) => {
        const eventRef = await doc(eventList, talkEvent.id);
        const eventDoc = await getDoc(eventRef);
        const data = await eventDoc?.data();
        events.push({ eventName: talkEvent.id, eventDate: data.talkDate });
      }),
    );
    res.status(200).json({ data: events });
  } catch (error) {
    console.log("Error getting data: ", error);
    res.status(500).send({ message: error });
  }
}

export const Events = {
  deleteEvent: async (req, res) => {
    try {
      const user = req.session.user;
      const eventName = spaceToHyphen(req.params.eventName);
      await deleteDoc(
        doc(db, "theFireUsers", user.uid, "userEventList", eventName),
      );
      await deleteEventFromStorage(eventName, user.uid);
      res.status(200).json({ message: `${eventName} successfully deleted` });
    } catch (error) {
      console.log("error deleting event");
      res.status(500).send({ message: error });
    }
  },
  updateCustomQuestion: async (req, res) => {
    try {
      const user = req.session.user;
      const customQ = req.body.customQuestion;
      const eventName = req.params.id;
      const docRef = await getEventRef(user.uid, eventName);
      await updateDoc(docRef, { customQuestion: customQ });
      res.status(200).json({ message: "Update OK!" });
    } catch (error) {
      console.log("Error editing custom question: ", error);
      res.status(500).send({ message: error });
    }
  },
};
