import { dirname } from "path";
import { fileURLToPath } from "url";
import express from "express";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { DateTime } from "luxon";
import { upload } from "./config_multer.js";
import { isAuthenticated } from "./custom_middlewares.js";
import {
  addToAnswers,
  auth,
  createQR,
  db,
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
} from "./util.js";
const router = express.Router();
const __dirname = dirname(fileURLToPath(import.meta.url));
/********************************************************
 * EVENT ROUTES
 *******************************************************/

/**A route to get chart data for event review dashboard */
router.post("/getData", isAuthenticated, async (req, res) => {
  try {
    const user = req.session.user;
    const eventName = req.body.eventName;
    const dbEventInfo = await readEventInfoFromDB(user.uid, eventName);
    res.send(dbEventInfo);
  } catch (error) {
    console.log("SOMETHING BAD HAPPENED: ", error);
  }
});

/**A route to create a QR code for an event */
router.post("/qrButton", async (req, res) => {
  console.log("/qrButton");
  const user = req.session.user;
  const { rowIndex, eventName } = req.body;
  console.log(rowIndex, eventName);
  const url = await getQRURL(user.uid, eventName);
  console.log(url);
  res.send(url);
});

/**A route to render a survey page for an event*/
router.get("/survey/:uid/:eventName", (req, res) => {
  res.sendFile(`${__dirname}/Public/survey.html`);
});

/**A route to delete an event from storage */
router.post("/deleteEvent", isAuthenticated, async (req, res) => {
  try {
    const user = req.session.user;
    const eventName = spaceToHyphen(req.body.eventName);
    await deleteDoc(
      doc(db, "theFireUsers", user.uid, "userEventList", eventName),
    );
    await deleteEventFromStorage(eventName, user.uid);
  } catch (error) {
    console.log("error deleting");
  }
});

/**A route to render the review page for a given eventname parameter */
router.get("/review/:eventName", isAuthenticated, async (req, res) => {
  try {
    const user = req.session.user;
    const eventName = req.params.eventName;
    const dbEventInfo = await readEventInfoFromDB(user.uid, eventName);
    const noFeedback = dbEventInfo.CustomAnswer == undefined ? true : false;
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
router.post("/createEvent", async (req, res) => {
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
router.get("/feedback/:uid/:eventName", async (req, res) => {
  try {
    const { uid, eventName } = req.params;
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
router.post("/feedbackSelection", (req, res) => {
  const { uid, eventName } = req.body;
  const question = req.body.feedbackQuestion;
  const answer = req.body.feedbackAnswer;
  if (eventName !== "Test-Survey" && answer.length > 4) {
    sendFeedbackToDB(question, answer, uid, eventName);
  }
  res.json({ status: "Success", message: "Data received successfully." });
});

/**A route to edit custom event questions */
router.post("/editCustomQ", async (req, res) => {
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
});

/**A route to post emoji selections for an event */
router.post("/emojiSelection", (req, res) => {
  const { sendQuestion, emoji, uid, eventName } = req.body;
  const cleanQuestion = sendQuestion.replace("?", "");
  if (eventName !== "Test-Survey") {
    sendFeedbackToDB(cleanQuestion, emoji, uid, eventName);
  }
  res.json({ status: "Success", message: "Data received successfully." });
});

/**A route to go to the survey test*/
router.post("/goToTestSurveyButton", async (req, res) => {
  const user = req.session.user;
  const eventName = "Test-Survey";
  res.redirect(`/survey/${user.uid}/${eventName}`);
});

/**A route to go to the survey*/
router.post("/goToSurveyButton", async (req, res) => {
  const user = req.session.user;
  let { eventName } = req.body;
  eventName = spaceToHyphen(eventName);
  res.redirect(`/survey/${user.uid}/${eventName}`);
});
/********************************************************
 * FILE UPLOAD/DOWNLOAD ROUTES
 *******************************************************/

/** A route to download a file after submitting feedback
 *  This returns a URL to a firebase file, not an actual file
 */
router.post("/downloadFile", async (req, res) => {
  const { uid, eventName } = req.body;
  console.log(uid, eventName);
  const downloadURL = await getFileDownloadURL(uid, eventName);
  res.send(downloadURL);
});

/**
 * A route to upload a file reward for event reviewers
 * make sure filename matches what is called in static code
 */
router.post(
  "/uploadFile",
  upload.single("uploadedFile"),
  isAuthenticated,
  async (req, res) => {
    try {
      const user = req.session.user;
      const eventName = req.body.eventName;
      const fileToUpload = req.file; //from multer middleware
      const result = await uploadSharedFiles(fileToUpload, user.uid, eventName);
      res.status(200);
      res.json({ message: "Upload OK" });
    } catch (error) {
      console.log(`problem uploading file ${error}`);
      res.status(500).send("Error uploading file");
    }
  },
);

/********************************************************
 * PAGE ROUTES
 *******************************************************/

/**A route to redirect "/" to the homepage */
router.get("/", (req, res) => {
  const user = req.session.user;
  res.render("homePage", { user });
});

/**A route to render the homepage */
router.get("/homePage", (req, res) => {
  const user = req.session.user;
  res.render("homePage", { user });
});

/**A route to render the contact form */
router.post("/contactForm", (req, res) => {
  const { fullName, phoneNumber, email, role, uid, eventName } = req.body;
  res.json({ message: "Form data received successfully!" });
  if (eventName !== "Test-Survey") {
    sendContactInfoToDB(fullName, phoneNumber, email, role, uid, eventName);
  }
});

/**A route to render the contacts page */
router.get("/contacts", isAuthenticated, async (req, res) => {
  const user = req.session.user;
  const contacts = await readContactInfoFromDb(user.uid);
  res.render("contacts", { user, contacts });
});

/**A route to display the user login page */
router.get("/login", (req, res) => {
  res.sendFile(`${__dirname}/Public/login.html`);
});

/**A route to post a user login, redirect to profile page */
router.post("/login", async (req, res) => {
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
    res.render("login", { error });
  }
});

/***A route to log a user out, redirect to home page */
router.get("/logout", async (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.log(error);
    }
    res.clearCookie("connectr.sid");
    res.redirect("/homePage");
  });
});

/**A route to display the new user registration page */
router.get("/register", (req, res) => {
  res.sendFile(`${__dirname}/Public/register.html`);
});

/**A route to post a new user registration
 * user.uid contains the user's UID
 * doc(the database, the name of the collection, what we send in for document ID)
 */
router.post("/register", async (req, res) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      req.body.email,
      req.body.password,
    );
    const user = userCredential.user;
    await updateProfile(user, { displayName: req.body.userName });
    req.session.user = user;

    //what we went to put into the user db on a register
    //fields we want to add directly tied to the user
    const newDocRef = doc(db, "theFireUsers", user.uid);
    await setDoc(newDocRef, {});

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
 * forEach is a (misleadingly named) method on the querySnapshot object type
 * see: https://firebase.google.com/docs/reference/js/v8/firebase.firestore.QuerySnapshot
 * you can't convert it to a normal for...of, because it is not iterable
 */
router.get("/profilePage", isAuthenticated, async (req, res) => {
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

export default router;
