import { collection, doc, getDoc, getDocs } from "@firebase/firestore";
import { getAuth } from "firebase-admin/auth";
import { readEventInfoFromDB } from "../util.js";
import { db } from "../util.js";

export async function getSpeakers() {
  const users = [];
  try {
    const listAllUsers = async (nextPageToken) => {
      const page = await getAuth().listUsers(1000, nextPageToken);
      page.users.forEach((userRecord) => {
        users.push({
          uid: userRecord.uid,
          displayName: userRecord.displayName,
        });
      });
      if (page.pageToken) {
        // get the next page if there is one
        listAllUsers(page.pageToken);
      }
    };
    //run the above, recursively, and return the result
    await listAllUsers();
    return users;
  } catch (error) {
    console.log("Error listing users:", error);
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
    res.status(500);
    res.send({ message: error });
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
    res.json({ data: events });
  } catch (error) {
    console.log("Error getting data: ", error);
    res.status(500);
    res.send({ message: error });
  }
}
