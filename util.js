import dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  FieldValue,
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  increment,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from "firebase/storage";
import qr from "qrcode";

dotenv.config();

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

const fbapp = initializeApp(firebaseConfig);
export const db = getFirestore(fbapp);
export const auth = getAuth(fbapp);
const storage = getStorage(fbapp);

export function registerUser(email, password, successCallback, errorCallback) {
  createUserWithEmailAndPassword(
    auth,
    email,
    password,
    successCallback,
    errorCallback,
  )
    .then((userCredential) => {
      const user = userCredential.user;
      successCallback(user);
    })
    .catch((error) => {
      errorCallback(error);
    });
}

export function loginUser(email, password, successCallback, errorCallback) {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      successCallback(user);
    })
    .catch((error) => {
      errorCallback(error);
    });
}

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
    // return null;
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
const surveyResponseStruct = {
  actionableAns: "",
  engagingAns: "",
  interactiveAns: "",
  inspiringAns: "",
  relevantAns: "",
  areasEnjoyedAns: "",
  qualitiesImprovedAns: "",
};

export async function readEventInfoFromDB(uid, eventName) {
  try {
    const eventRef = doc(db, "theFireUsers", uid, "userEventList", eventName);
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

export function addToAnswers(question, answer) {
  //not being used RIP

  switch (question) {
    case "Actionable":
      surveyResponseStruct.actionableAns = answer;
      break;
    case "Engaging":
      surveyResponseStruct.engagingAns = answer;
      break;
    case "Interactive":
      surveyResponseStruct.interactiveAns = answer;
      break;
    case "Inspiring":
      surveyResponseStruct.inspiringAns = answer;
      break;
    case "Relevant":
      surveyResponseStruct.relevantAns = answer;
      break;
    case "What areas of presentation did you enjoy?":
      surveyResponseStruct.areasEnjoyedAns = answer;
      break;
    case "What qualities of the presentation do you think could be improved?":
      surveyResponseStruct.qualitiesImprovedAns = answer;
      break;
    default:
      console.log("SOMETHING WENT WRONG");
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
    const eventRef = doc(db, "theFireUsers", uid, "userEventList", eventName);
    const eventDoc = await getDoc(eventRef);
    if (eventDoc.exists()) {
      const encodedEmail = email.replace(/\./g, "_"); //goes into firestore funny with out it
      // opposite is needed when grabbing it

      await updateDoc(eventRef, {
        [encodedEmail]: arrayUnion(fullName, phoneNumber, role),
      });
    }
  } catch (error) {
    console.log(error); //prob put weird argument in, or didnt put anything in
  }
}

export async function sendFeedbackToDB(question, answer, uid, eventName) {
  //if written feedback question
  if (question == "How would you describe this event to a friend?") {
    //change question to the name of appropiate array in Firestore
    question = "Testimonial";
    const eventRef = doc(db, "theFireUsers", uid, "userEventList", eventName);
    // Retrieve the document
    const eventDoc = await getDoc(eventRef);
    try {
      if (eventDoc.exists) {
        //console.log("Before Addition: " + JSON.stringify(data[question], null, 2)); //this prints specific array
        // Atomically add a new region to the "regions" array field.
        await updateDoc(eventRef, {
          [question]: arrayUnion(answer),
        });

        // Atomically remove a region from the "regions" array field.
        //await updateDoc(eventRef, {
        //[qeustion]: arrayRemove("east_coast")
        //});
        // Atomically add a new region to the "regions" array field.
      } else {
        console.log("Doc does not exist");
      }
    } catch (error) {
      console.log(error); //probably put in a weird argument
    }
  }

  //if emoji question
  else if (
    question == "Actionable" ||
    question == "Engaging" ||
    question == "Interactive" ||
    question == "Inspiring" ||
    question == "Relevant"
  ) {
    // Determine the index based on the answer
    let index; // which answer in array to increment
    switch (answer) {
      case "angry":
        index = 0;
        break;
      case "sad":
        index = 1;
        break;
      case "ok":
        index = 2;
        break;
      case "smile":
        index = 3;
        break;
      case "love":
        index = 4;
        break;
      default:
        console.log("SOMETHING BAD");
        return; // Exit the function if the answer is not recognized
    }

    const eventRef = doc(db, "theFireUsers", uid, "userEventList", eventName);

    // Retrieve the document
    const eventDoc = await getDoc(eventRef);
    //why

    if (eventDoc.exists()) {
      const data = eventDoc.data();
      /**   FIRESTORE DOES NOT TREAT THE ARRAY AS AN ARRAY
            RATHER AN OBJECT!!!!!
            WILL ONLY WORK HARD CODED, data.question does not work
            */
      const originalArray = Object.keys(data[question]).map(
        (key) => data[question][key],
      ); //grab array from firestore
      try {
        const copiedArray = [...originalArray]; //copy the array locally
        copiedArray[index] += 1; //increment that spit

        await updateDoc(eventRef, {
          //update the firestore array with the new array by treating as an
          [question]: copiedArray.reduce((acc, item, i) => {
            acc[i.toString()] = item;
            return acc;
          }, {}),
        });

        console.log("Array item incremented successfully.");
      } catch {
        console.log("Something went wrong");
      }
    } else {
      console.log("Document does not exist.");
    }
  } else {
    const eventRef = doc(db, "theFireUsers", uid, "userEventList", eventName);
    // Retrieve the document
    const eventDoc = await getDoc(eventRef);
    question = "CustomAnswer";

    try {
      if (eventDoc.exists) {
        await updateDoc(eventRef, {
          [question]: arrayUnion(answer),
        });
      } else {
        console.log("Doc does not exist");
      }
    } catch (error) {
      console.log(error); //probably put in a weird argument
    }
  }
}
