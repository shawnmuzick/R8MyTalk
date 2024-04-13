/**
 * This file should contain routes and functionality
 * related to rendering pages.
 */
import express from "express";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { DateTime } from "luxon";
import {
  getProfilePictureURL,
  getSpeakerProfile,
} from "../controllers/speakers.js";
import { __dirname } from "../index.js";
import { auth, db } from "../index.js";
import { upload } from "../middleware/config_multer.js";
import { isAuthenticated } from "../middleware/custom_middlewares.js";
import {
  createQR,
  deleteEventFromStorage,
  getFileDownloadURL,
  getQRURL,
  hyphenToSpace,
  readContactInfoFromDb,
  readEventInfoFromDB,
  sendContactInfoToDB,
  sendFeedbackToDB,
  spaceToHyphen,
  uploadSharedFiles,
} from "../util.js";
const view_router = express.Router();
/********************************************************
 * EVENT ROUTES
 *******************************************************/

/**A route to create a QR code for an event */
view_router.post("/qrButton", async (req, res) => {
  try {
    const user = req.session.user;
    const { rowIndex, eventName } = req.body;
    const url = await getQRURL(user.uid, eventName);
    res.send(url);
  } catch (error) {
    console.log("Error creating QR code: ", error);
    res.status(500).send({ message: error });
  }
});

/**A route to render a survey page for an event*/
view_router.get("/survey/:uid/:eventName", (req, res) => {
  const eventName = req.params.eventName;
  res.render("survey");
});

/**A route to delete an event from storage */
view_router.post("/deleteEvent", isAuthenticated, async (req, res) => {
  try {
    const user = req.session.user;
    const eventName = spaceToHyphen(req.body.eventName);
    await deleteDoc(
      doc(db, "theFireUsers", user.uid, "userEventList", eventName),
    );
    await deleteEventFromStorage(eventName, user.uid);
    res.status(200).json({ message: `${eventName} successfully deleted` });
  } catch (error) {
    console.log("error deleting event");
    res.status(500).send({ message: error });
  }
});

/**A route to render the review page for a given eventname parameter */
view_router.get("/review/:eventName", isAuthenticated, async (req, res) => {
  try {
    const user = req.session.user;
    const eventName = req.params.eventName;
    const dbEventInfo = await readEventInfoFromDB(user.uid, eventName);

    /*If all of the metric fields are set to 0, then this event recieved no feedback. */
    const noFeedback =
      dbEventInfo.Interactive["0"] == 0 &&
      dbEventInfo.Interactive["1"] == 0 &&
      dbEventInfo.Interactive["2"] == 0 &&
      dbEventInfo.Interactive["3"] == 0 &&
      dbEventInfo.Interactive["4"] == 0;

    const customQ = dbEventInfo.customQuestion;
    res.render("eventPage", {
      user,
      eventName,
      dbEventInfo,
      noFeedback,
      customQ,
    });
  } catch (error) {
    console.log(`Something Bad: ${error}`);
    res.redirect("/homePage");
  }
});

/**A route to post a new event record */
view_router.post("/createEvent", async (req, res) => {
  const user = req.session.user;
  let eventName = req.body.eventName;
  eventName = spaceToHyphen(eventName);

  const customQuestion = req.body.eventCustomQuestion;
  const organizer = req.body.organizer;
  const talkDate = req.body.talkDate;
  // Date uses - yyyy-MM-dd format
  const parsedDate = DateTime.fromFormat(talkDate, "yyyy-MM-dd");
  // Reformat the date in the correct order
  const reformatDate = parsedDate.toFormat("MM-dd-yyyy");
  const attendees = req.body.attendees;
  const eventEarnings = req.body.eventEarnings;
  const talkType = req.body.talkType;

  try {
    const newDocRef = collection(
      db,
      "theFireUsers/",
      user.uid,
      "userEventList",
    );

    //what we want to put into the db
    //no longer using enjoy or improve
    await setDoc(doc(newDocRef, eventName), {
      customQuestion: customQuestion,
      organizer: organizer,
      talkDate: reformatDate,
      talkType: talkType,
      attendees: attendees,
      eventEarnings: eventEarnings,
      Actionable: [0, 0, 0, 0, 0],
      Engaging: [0, 0, 0, 0, 0],
      Interactive: [0, 0, 0, 0, 0],
      Inspiring: [0, 0, 0, 0, 0],
      Relevant: [0, 0, 0, 0, 0],
      Enjoy: [],
      Improve: [],
    });

    //COMEBACK when hosting, make sure port works for a real url or might have to change
    const url = `https://r8temytalk-nkqs.onrender.com/survey/${user.uid}/${eventName}`;
    createQR(url, user.uid, `${eventName}.png`, eventName);
    res.redirect("/profilePage");
  } catch (error) {
    //cookie probably expired
    console.log(error);
    res.redirect("/login");
  }
});

/********************************************************
 * FEEDBACK ROUTES
 *******************************************************/
/**A route to render the feedback page for an event */
view_router.get("/feedback/:uid/:eventName", async (req, res) => {
  try {
    const { uid, eventName } = req.params;
    console.log("test", eventName);
    let customQ = "";
    if (eventName !== "Test-Survey") {
      const theObject = await readEventInfoFromDB(uid, eventName);
      customQ = theObject.customQuestion;
    } else {
      customQ = "Unique Question";
    }
    res.render("Feedback", { eventName, customQ });
  } catch (error) {
    console.log("Event does not exist");
    res.redirect("/homePage");
  }
});

/**A route to post feedback answers for an event */
view_router.post("/feedbackSelection", (req, res) => {
  try {
    const { uid, eventName } = req.body;
    const question = req.body.feedbackQuestion;
    const answer = req.body.feedbackAnswer;
    if (eventName !== "Test-Survey" && answer.length > 4) {
      sendFeedbackToDB(question, answer, uid, eventName);
    }
    res
      .status(200)
      .json({ status: "Success", message: "Data received successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: error });
  }
});

/**A route to edit custom event questions */
view_router.post("/editCustomQ", async (req, res) => {
  try {
    const user = req.session.user;
    const customQ = req.body.customQuestion;
    const eventName = req.body.eventName;
    const docRef = doc(
      db,
      "theFireUsers",
      user.uid,
      "userEventList",
      spaceToHyphen(eventName),
    );
    await updateDoc(docRef, { customQuestion: customQ });
  } catch (error) {
    console.log("Error editing custom question: ", error);
    res.status(500).send({ message: error });
  }
});

/**A route to post emoji selections for an event */
view_router.post("/emojiSelection", (req, res) => {
  const { sendQuestion, emoji, uid, eventName } = req.body;
  const cleanQuestion = sendQuestion.replace("?", "");
  if (eventName !== "Test-Survey") {
    sendFeedbackToDB(cleanQuestion, emoji, uid, eventName);
  }
  res.json({ status: "Success", message: "Data received successfully." });
});

/**A route to go to the survey test*/
view_router.post("/goToTestSurveyButton", async (req, res) => {
  const user = req.session.user;
  const eventName = "Test-Survey";
  res.redirect(`/survey/${user.uid}/${eventName}`);
});

/**A route to go to the survey*/
view_router.post("/goToSurveyButton", async (req, res) => {
  const user = req.session.user;
  let { eventName } = req.body;
  eventName = spaceToHyphen(eventName);
  res.redirect(`/survey/${user.uid}/${eventName}`);
});

/**A route to post data from the contact form */
view_router.post("/contactForm", (req, res) => {
  const { fullName, phoneNumber, email, role, uid, eventName } = req.body;
  res.json({ message: "Form data received successfully!" });
  if (eventName !== "Test-Survey") {
    sendContactInfoToDB(fullName, phoneNumber, email, role, uid, eventName);
  }
});

/********************************************************
 * FILE UPLOAD/DOWNLOAD ROUTES
 *******************************************************/

/**A route to download a file after submitting feedback */
view_router.post("/downloadFile", async (req, res) => {
  try {
    const { uid, eventName } = req.body;
    console.log("params:", uid, eventName);
    const downloadURL = await getFileDownloadURL(uid, eventName);
    res.status(200).send(downloadURL);
  } catch (error) {
    console.log("Error downloading file: ", error);
    res.status(500).send({ message: error });
  }
});

/**
 * A route to upload a file reward for event reviewers
 * make sure filename matches what is called in static code
 */
view_router.post(
  "/uploadFile",
  upload.single("uploadedFile"),
  isAuthenticated,
  async (req, res) => {
    try {
      const user = req.session.user;
      const eventName = req.body.eventName;
      const fileToUpload = req.file; //from multer middleware
      const result = await uploadSharedFiles(fileToUpload, user.uid, eventName);
      res.status(200).send({ message: "Upload OK" });
    } catch (error) {
      console.log(`problem uploading file ${error}`);
      res.status(500).send({ message: "Error uploading file" });
    }
  },
);

/********************************************************
 * PAGE ROUTES
 *******************************************************/

/**A route to redirect "/" to the homepage */
view_router.get("/", (req, res) => {
  const user = req.session.user;
  res.render("homePage", { user });
});

/**A route to render the homepage */
view_router.get("/homePage", (req, res) => {
  const user = req.session.user;
  res.render("homePage", { user });
});

/**A route to render the contacts page */
view_router.get("/contacts", isAuthenticated, async (req, res) => {
  try {
    const user = req.session.user;
    const contacts = await readContactInfoFromDb(user.uid);
    res.render("contacts", { user, contacts });
  } catch (error) {
    res.status(500).send({ mesage: "Error getting contacts file" });
  }
});

/**A route to display the user login page */
view_router.get("/login", (req, res) => {
  res.render("login", { error: null, user: null });
});

/**A route to post a user login, redirect to profile page */
view_router.post("/login", async (req, res) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      req.body.email,
      req.body.password,
    );
    req.session.user = userCredential.user;
    res.redirect("/profilePage");
  } catch (error) {
    error.customData = "Invalid Login";
    console.log(`failed log in ${req.body.email}`);
    res.status(401);
    res.render("login", { error, user: null });
  }
});

/***A route to log a user out, redirect to home page */
view_router.get("/logout", async (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.log(error);
    }
    res.clearCookie("connectr.sid");
    res.redirect("/homePage");
  });
});

/**A route to display the new user registration page */
view_router.get("/register", (req, res) => {
  res.render("register", { error: null, user: null });
});

/**A route to post a new user registration
 * user.uid contains the user's UID
 * doc(the database, the name of the collection, what we send in for document ID)
 */
view_router.post("/register", async (req, res) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      req.body.email,
      req.body.password,
    );
    const user = userCredential.user;
    await updateProfile(user, { displayName: req.body.userName });
    req.session.user = user;

    //what we want to put into the user db on a register
    //fields we want to add directly tied to the user
    const newDocRef = doc(db, "theFireUsers", user.uid);
    await setDoc(newDocRef, {
      firstName: req.body.firstName ?? "",
      lastName: req.body.lastName ?? "",
      bio: "",
      socialLink1: "",
      socialLink2: "",
      socialLink3: "",
    });

    res.redirect("/profilePage");
  } catch (error) {
    console.error("Error during registration:", error);
    let errorMSG = "Error: Try Again";
    if (error.code === "auth/email-already-in-use") {
      errorMSG = "Account with that email already exists";
    } else if (error.code === "auth/weak-password") {
      errorMSG = "Password should be at least 6 characters";
    }
    res.render("register", { error: { customData: errorMSG } });
  }
});

/**A route to render the profile page ejs template
 * get the user's event list from storage,
 * push the list into the template
 */
view_router.get("/profilePage", isAuthenticated, async (req, res) => {
  const user = req.session.user;
  const docRef = doc(db, "theFireUsers", user.uid); //starting reference point
  const docSnap = await getDoc(docRef);
  const eventArray = []; //will be sent to profilePage.ejs for accessing

  try {
    const subCollectionRef = collection(docRef, "userEventList"); //narrow down the starting reference point
    const subCollectionDocs = await getDocs(subCollectionRef);
    subCollectionDocs.forEach((doc) => {
      eventArray.push({
        localEventName: hyphenToSpace(doc.id),
        localEventFields: doc.data(),
      });
    });
  } catch (error) {
    console.log("SOMETHING BAD HAPPENED: ", error);
  }

  //if user logged in, render profilePage
  if (req.session.user) {
    res.render("profilePage", {
      user,
      docSnap,
      eventArray,
    });
  } else {
    //cookie expired probably
    res.redirect("/login");
  }
});

/**A route to render the speakerSearch page */
view_router.get("/speakerSearch", async (req, res) => {
  try {
    //to populate the navbar
    const user = req.session.user ?? null;
    res.render("speakerSearch", { user });
  } catch (error) {
    console.log("Error getting data: ", error);
    res.status(500).send({ message: error });
  }
});

/**A route to render the edit speakerProfile page */
view_router.get(
  "/speakerProfile/edit/:uid",
  isAuthenticated,
  async (req, res) => {
    try {
      const user = req.session.user ?? null;
      const uid = req.params.uid;
      const profile = await getSpeakerProfile(uid);
      profile.profilePictureUrl = await getProfilePictureURL(uid);
      // Render the profile page with the user's data
      res.render("editProfile", { profile, user: user });
    } catch (error) {
      console.log("Error getting profile data:", error);
      res.status(500).send({ message: error });
    }
  },
);

/**A route to render the speakerProfile page */
view_router.get("/speakerProfile/:uid", async (req, res) => {
  try {
    const user = req.session.user ?? null;
    const uid = req.params.uid;
    const profile = await getSpeakerProfile(uid);
    profile.profilePictureUrl = await getProfilePictureURL(uid);
    res.render("speakerProfile", { profile, user: user });
  } catch (error) {
    console.log("Error getting profile data:", error);
    res.status(500).send({ message: error });
  }
});

export default view_router;
