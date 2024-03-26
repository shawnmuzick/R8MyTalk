import { readEventInfoFromDB } from "../util.js";

export async function getSpeakers(req, res) {}

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
