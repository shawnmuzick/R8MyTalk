import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import qr from "qrcode";
import { getEventRef } from "./controllers/events.js";
import { db, storage } from "./index.js";
import { EmojiQuestions } from "./models/EmojiQuestions.js";

export function spaceToHyphen(string) {
  return string.replace(/ /g, "-");
}

export function hyphenToSpace(string) {
  return string ? string.replace(/-/g, " ") : "";
}

export async function createQR(url, userFolder, fileName, eventName) {
  try {
    // Generate the QR code
    const qrCodeData = await qr.toDataURL(url);
    const qrCodeBuffer = Buffer.from(
      qrCodeData.replace(/^data:image\/png;base64,/, ""),
      "base64",
    );
    const storageRef = ref(
      storage,
      userFolder + "/" + eventName + "/" + fileName,
    );

    const metadata = {
      contentType: "image/png",
    };

    uploadBytes(storageRef, qrCodeBuffer, metadata).then((snapshot) => {
      console.log("Uploaded a blob or file!");
    });
  } catch (error) {
    console.error("Error generating and storing QR code:", error);
  }
}

export async function uploadSharedFiles(file, uid, eventName) {
  try {
    const metadata = {
      contentType: file.mimetype,
    };
    const storageRef = ref(
      storage,
      uid + "/" + spaceToHyphen(eventName) + "/" + file.fieldname,
    ); //COMEBACK //test
    const result = await uploadBytes(storageRef, file.buffer, metadata);
    return result;
  } catch (error) {
    console.error("problem uploading", error);
    throw error;
  }
}
export async function deleteEventFromStorage(eventName, uid) {
  try {
    const fileRef = ref(storage, uid + "/" + eventName + "/" + "uploadedFile");
    const qrRef = ref(
      storage,
      uid + "/" + eventName + "/" + eventName + ".png",
    );
    await deleteObject(qrRef);
    await deleteObject(fileRef);
  } catch (error) {
    console.log(error);
  }
}

export async function getFileDownloadURL(userFolder, eventName) {
  try {
    const storageRef = ref(
      storage,
      userFolder + "/" + eventName + "/uploadedFile",
    );
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getQRURL(userFolder, eventName) {
  try {
    eventName = spaceToHyphen(eventName);
    const storageRef = ref(
      storage,
      userFolder + "/" + eventName + "/" + eventName + ".png",
    );
    const url = await getDownloadURL(storageRef);
    console.log(url);
    return url;
  } catch (error) {
    console.log(error);
  }
}

export async function readEventInfoFromDB(uid, eventName) {
  try {
    const eventRef = await getEventRef(uid, eventName);
    const eventDoc = await getDoc(eventRef);
    const data = eventDoc.data();
    if (eventDoc.exists()) {
      return data;
    } else {
      console.log("Document does not exist!");
    }
  } catch (error) {
    console.error("Error getting document:", error);
  }
}

export async function readContactInfoFromDb(uid) {
  // we're going to add the event Name & any contact info from each event
  const contactsArray = [];
  try {
    const userRef = doc(db, "theFireUsers", uid);
    const userEventListRef = collection(userRef, "userEventList");
    const userEventListDocs = await getDocs(userEventListRef);

    // Use Promise.all to wait for all async operations to complete
    await Promise.all(
      userEventListDocs.docs.map(async (eventDoc) => {
        // right now eventDoc.id is the event name
        const theEventName = eventDoc.id;
        const aContactRef = doc(userEventListRef, theEventName);
        const aContactDoc = await getDoc(aContactRef);

        if (aContactDoc.exists()) {
          const emailFields = Object.entries(aContactDoc.data())
            .filter(
              ([key, value]) => typeof key === "string" && key.includes("@"),
            )
            .reduce((acc, [key, value]) => {
              acc[key] = value;
              return acc;
            }, {});
          contactsArray.push({
            eventName: theEventName,
            eventData: emailFields,
          });
        }
      }),
    );
  } catch (error) {
    console.error("ERROR on sub-reference: ", error);
  }
  return contactsArray;
}

export async function sendContactInfoToDB(
  fullName,
  phoneNumber,
  email,
  role,
  uid,
  eventName,
) {
  try {
    const eventRef = await getEventRef(uid, eventName);
    const eventDoc = await getDoc(eventRef);
    if (eventDoc.exists()) {
      const encodedEmail = email.replace(/\./g, "_"); //goes into firestore funny with out it

      await updateDoc(eventRef, {
        [encodedEmail]: arrayUnion(fullName, phoneNumber, role),
      });
    }
  } catch (error) {
    console.log(error);
  }
}

export async function handleQuestion(question, answer, eventRef) {
  try {
    await updateDoc(eventRef, { [question]: arrayUnion(answer) });
  } catch (error) {
    throw error;
  }
}

export async function handleEmojiQuestion(question, index, eventDoc, eventRef) {
  try {
    const data = await eventDoc.data();
    /**   FIRESTORE DOES NOT TREAT THE ARRAY AS AN ARRAY
            RATHER AN OBJECT!!!!!
            WILL ONLY WORK HARD CODED, data.question does not work
            */
    const originalArray = Object.keys(data[question]).map(
      (key) => data[question][key],
    ); //grab array from firestore
    const copiedArray = [...originalArray]; //copy the array locally
    copiedArray[index] += 1; //increment that spit

    await updateDoc(eventRef, {
      [question]: copiedArray.reduce((acc, item, i) => {
        acc[i.toString()] = item;
        return acc;
      }, {}),
    });
  } catch (error) {
    throw error;
  }
}

export async function sendFeedbackToDB(question, answer, uid, eventName) {
  try {
    const emojis = new EmojiQuestions();
    console.log(emojis);

    const eventRef = await getEventRef(uid, eventName);
    const eventDoc = await getDoc(eventRef);
    if (!eventDoc.exists) {
      throw new Error("Doc does not exist");
    }

    if (question == "How would you describe this event to a friend?") {
      await handleQuestion("Testimonial", answer, eventRef);
    } else if (emojis.questions.includes(question)) {
      // Determine the index based on the answer, throw if bad
      const index = emojis.answers.indexOf(answer);
      if (index == -1) {
        throw new Error("SOMETHING BAD");
      } else {
        await handleEmojiQuestion(question, index, eventDoc, eventRef);
      }
    } else {
      await handleQuestion("CustomAnswer", answer, eventRef);
    }
  } catch (error) {
    throw error;
  }
}
