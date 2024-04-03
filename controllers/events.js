import { collection, doc, getDoc, getDocs } from "@firebase/firestore";
import { db } from "../index.js";
import { readEventInfoFromDB } from "../util.js";

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
