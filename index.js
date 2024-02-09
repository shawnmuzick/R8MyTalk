import { dirname } from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import express from "express";
import session from "express-session";
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
import multer from "multer";
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

// Use the enviormental port number and if there is none
// use a default of 3000
const PORT = process.env.PORT || 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));
const upload = multer({
  //storage: multer.memoryStorage(),
  limits: {
    fileSize: 1000000000, // 1000MB
  },
  rename: (fieldname, filename) =>
    filename.replace(/\W+/g, "-").toLowerCase() + Date.now(),
  onFileUploadStart: (file) => {
    console.log(file.fieldname + " is starting ...");
  },
  onFileUploadData: (file, data) => {
    console.log(data.length + " of " + file.fieldname + " arrived");
  },
  onFileUploadComplete: (file) => {
    console.log(file.fieldname + " uploaded to  " + file.path);
  },
});
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Replace with a strong, random string IN .ENV!!!!!!!!!!!
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 120000 * 720 }, //120000 = 2 min
  }),
);
/*
 * If the user is authenticated, proceed to the next middleware or route handler
 * If the user is not authenticated, redirect to the login page or any other page
 * Change '/login' to the appropriate login route
 */
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
};

app.post("/contactForm", (req, res) => {
  console.log("/contactForm");
  const { fullName, phoneNumber, email, role, uid, eventName } = req.body;
  res.json({ message: "Form data received successfully!" });
  if (eventName !== "Test-Survey") {
    sendContactInfoToDB(fullName, phoneNumber, email, role, uid, eventName);
  }
});

app.get("/", (req, res) => {
  console.log("/");
  const user = req.session.user;
  res.render("homePage", { user });
});

app.get("/homePage", (req, res) => {
  console.log("/homePage");
  const user = req.session.user;
  res.render("homePage", { user });
});

app.get("/contacts", isAuthenticated, async (req, res) => {
  console.log("/contacts");
  const user = req.session.user;
  const contacts = await readContactInfoFromDb(user.uid);
  res.render("contacts", { user, contacts });
});

// Allows us to load static HTML files
app.use(express.static(`${__dirname}/Public`));

app.post("/goToTestSurveyButton", async (req, res) => {
  console.log("/goToTestSurveyButton");
  const user = req.session.user;
  const eventName = "Test-Survey";
  console.log(user.uid + eventName);
  console.log(`/survey/${user.uid}/${eventName}`);
  res.redirect(`/survey/${user.uid}/${eventName}`);
});

app.post("/goToSurveyButton", async (req, res) => {
  console.log("/goToSurveyButton");
  const user = req.session.user;
  let { rowIndex, eventName } = req.body;
  eventName = spaceToHyphen(eventName);
  console.log(user.uid + eventName);
  console.log(`/survey/${user.uid}/${eventName}`);
  res.redirect(`/survey/${user.uid}/${eventName}`);
});

app.get("/survey/:uid/:eventName", (req, res) => {
  //this is the route that brings you to a survey page for the event
  console.log("/survey/:uid/:eventName");
  const { uid, eventName } = req.params;
  console.log(`${uid}   ${eventName}`);
  res.sendFile(`${__dirname}/Public/survey.html`);
});

app.get("/feedback/:uid/:eventName", async (req, res) => {
  console.log("/feedback/:uid/:eventName");
  const { uid, eventName } = req.params;
  console.log(`${uid}   ${eventName}`);
  let customQ = "";

  //get custom question
  try {
    if (eventName !== "Test-Survey") {
      const theObject = await readEventInfoFromDB(uid, eventName);
      customQ = theObject.customQuestion;
    } else {
      customQ = "Unique Question";
    }

    console.log(`HERE IS CUSTOM QUESTION GOOOOOOOOOOOOOOOO: ${customQ}`);
  } catch (error) {
    console.log("Event does not exist");
    res.redirect("/homePage");
  }

  res.render("Feedback", { eventName, customQ });
});

app.post("/feedbackSelection", (req, res) => {
  console.log("/feedbackSelection");
  const { uid, eventName } = req.body;
  const question = req.body.feedbackQuestion;
  const answer = req.body.feedbackAnswer;
  console.log(`UID:${uid}, EventName:${eventName}, ${question} | ${answer}`);

  if (eventName !== "Test-Survey" && answer.length > 4) {
    sendFeedbackToDB(question, answer, uid, eventName);
  }

  res.json({ status: "Success", message: "Data received successfully." });
});

app.post("/deleteEvent", isAuthenticated, async (req, res) => {
  console.log("/deleteEvent");
  const user = req.session.user;
  const eventName = req.body.eventName;
  console.log(eventName);
  try {
    await deleteDoc(
      doc(
        db,
        "theFireUsers",
        user.uid,
        "userEventList",
        spaceToHyphen(eventName),
      ),
    );
    await deleteEventFromStorage(spaceToHyphen(eventName), user.uid); //dont think working right
  } catch (error) {
    console.log("error deleting");
  }
});

//change custom question
app.post("/editCustomQ", async (req, res) => {
  console.log("/editCustomQ");
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

  console.log(`custom in index: ${customQ}`);
  console.log(`Event Name in index: ${eventName}`);

  await updateDoc(docRef, { customQuestion: customQ });
});

app.post("/emojiSelection", (req, res) => {
  console.log("/emojiSelection");

  const { sendQuestion, emoji, uid, eventName } = req.body;
  const cleanQuestion = sendQuestion.replace("?", "");
  // Log the received data
  console.log(`${cleanQuestion} | ${emoji}`);
  //addToAnswers(`${cleanQuestion}`, `${emoji}`);
  if (eventName !== "Test-Survey") {
    sendFeedbackToDB(cleanQuestion, emoji, uid, eventName);
  }
  res.json({ status: "Success", message: "Data received successfully." });
});

app.get("/register", (req, res) => {
  console.log("/register");
  res.sendFile(`${__dirname}/Public/register.html`);
});

app.post("/register", async (req, res) => {
  console.log("/register");
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userName = req.body.userName;

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userEmail,
      userPassword,
    );
    const user = userCredential.user;
    await updateProfile(user, { displayName: userName });
    req.session.user = user;
    // Now user.uid contains the user's UID
    //const newDocRef = doc(db, "theFireUsers", userEmail, "userEventList", "Your first event"); //(the database, the name of the collection, what we send in for document ID)
    const newDocRef = doc(db, "theFireUsers", user.uid);
    //what we went to put into the user db on a register
    await setDoc(newDocRef, {
      //fields we want to add directly tied to the user
    });

    console.log("Document written with ID:", user.uid);
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

app.get("/login", (req, res) => {
  console.log("/login");
  res.sendFile(`${__dirname}/Public/login.html`);
});

app.post("/login", async (req, res) => {
  console.log("/login");
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      userEmail,
      userPassword,
    );
    // Signed in
    const user = userCredential.user;
    req.session.user = user;
    //console.log(user);
    //res.sendFile(__dirname + '/views/profilePage.ejs'); //sending download file lol
    res.redirect("/profilePage");
  } catch (error) {
    error.customData = "Invalid Login";
    res.render("login", { error });
    const errorCode = error.code;
    const errorMessage = error.message;
  }
});

app.get("/profilePage", async (req, res) => {
  console.log("/profilePage");
  const user = req.session.user;
  if (!user) {
    //cannot access profile page unless logged in
    return res.redirect("/homePage"); //might want to redirect to login
  }
  const docRef = doc(db, "theFireUsers", user.uid); //starting reference point
  const docSnap = await getDoc(docRef);
  const eventArray = []; //will be sent to profilePage.ejs for accessing

  try {
    //console.log("Document data:", docSnap.data());
    const subCollectionRef = collection(docRef, "userEventList"); //narrow down the starting reference point
    const subCollectionDocs = await getDocs(subCollectionRef);

    subCollectionDocs.forEach((doc) => {
      //console.log('Document ID:', doc.id); //Our doc.id is also our event name. we need to grab it to use
      //console.log('Document Data:', doc.data()); //will grab all the sub fields

      const anEventStructure = {
        localEventName: hyphenToSpace(doc.id), //doc ID is diplayAble as a string
        localEventFields: doc.data(), //while doc.data is an object with all sub fields
      };
      eventArray.push(anEventStructure);
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

//for getting chart data
app.post("/getData", isAuthenticated, async (req, res) => {
  console.log("/getData");
  const user = req.session.user;
  const eventName = req.body.eventName;
  console.log(`eventName ${eventName}`);
  try {
    const dbEventInfo = await readEventInfoFromDB(user.uid, eventName);
    console.log(dbEventInfo);
    res.send(dbEventInfo);
  } catch (error) {
    console.log("SOMETHING BAD HAPPENED: ", error);
  }
});

app.get("/review/:eventName", isAuthenticated, async (req, res) => {
  //COMEBACK
  console.log("/review/:eventName");
  const user = req.session.user;
  const eventName = req.params.eventName;
  try {
    const dbEventInfo = await readEventInfoFromDB(user.uid, eventName);
    //console.log("Here be the object in INDEX: ")
    //console.log(dbEventInfo); //dont know why it prints out twice per 1 click
    //const noFeedback = Object.values(dbEventInfo.Inspiring).every(value => value === 0); //just check if one quality doesnt have any votes
    let noFeedback = false;
    if (dbEventInfo.CustomAnswer == undefined) {
      noFeedback = true;
    }
    const customQ = dbEventInfo.customQuestion;
    console.log(`CUSTOM QUESTION: ${customQ}`);
    console.log(noFeedback);

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

app.post("/createEvent", async (req, res) => {
  console.log("/createEvent");
  const user = req.session.user; //getting currentbase off the cookie
  let eventName = req.body.eventName;
  eventName = spaceToHyphen(eventName);
  console.log(eventName);

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
    console.log(newDocRef);

    //what we went to put into the db
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
      //NO LONGER USING ENJOY OR IMPROVE
      Enjoy: [],
      Improve: [],
    });
    // const letsGoDeeperRef = collection(db, "theFireUsers/", user.uid, "userEventList", eventName, "ContactList");
    //await setDoc(doc(letsGoDeeperRef, "test"), {
    //THIS IS HERE IN CASE WE NEED TO ADD ANOTHER COLLECTION UNDER FEEDBACK
    //})

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

app.post("/qrButton", async (req, res) => {
  console.log("/qrButton");
  const user = req.session.user;
  const { rowIndex, eventName } = req.body;
  console.log(rowIndex, eventName);
  const url = await getQRURL(user.uid, eventName);
  console.log(url);
  res.send(url);
});

app.post("/downloadFile", async (req, res) => {
  console.log("/downloadFile");
  //need to get user uid and eventname from front end url
  const { uid, eventName } = req.body;
  const downloadURL = await getFileDownloadURL(uid, eventName);
  console.log(`UID: ${uid}, EventName:${eventName}`);
  console.log(`download URL: ${downloadURL}`);
  res.send(downloadURL);
});

function logger(req, res, next) {
  console.log("this is the logger");
  next();
}

function handleUpload(req, res, next) {
  try {
    console.log("no errors");
    next();
  } catch (error) {
    console.log("multer error");
    next();
  }
}

//make sure filename matches what is called in static code
app.post(
  "/uploadFile",
  //logger,
  upload.single("uploadedFile"),
  isAuthenticated,
  async (req, res) => {
    console.log("/uploadFile");
    const user = req.session.user;
    const eventName = req.body.eventName;
    const fileToUpload = req.file; //using multer middleware stuff...
    console.log(eventName);
    console.log(fileToUpload);
    try {
      const result = await uploadSharedFiles(fileToUpload, user.uid, eventName);
      console.log(result);
      res.status(200);
      res.send({ message: "Upload OK" });
    } catch (error) {
      console.log(`problem uploading file ${error}`);
      res.status(500).send("Error uploading file");
    }
  },
);

app.get("/logout", async (req, res) => {
  console.log("/logout");
  req.session.destroy((error) => {
    if (error) {
      console.log(error);
    }
    res.clearCookie("connectr.sid");
    res.redirect("/homePage");
  });
});

// Listens to the port for request
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
