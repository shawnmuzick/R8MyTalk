/**
 * This file should contain routes and functionality
 * related to fetching and posting data
 */
import express from "express";
import { getEventList, getFeedbackData } from "../controllers/events.js";
import {
  getProfilePictureURL,
  getSpeakerProfile,
  getSpeakers,
  getStorageItems,
  searchUsers,
  updateSpeakerProfile,
  uploadProfilePicture,
} from "../controllers/speakers.js";
import { __dirname } from "../index.js";
import { upload } from "../middleware/config_multer.js";
import { isAuthenticated } from "../middleware/custom_middlewares.js";
const api_router = express.Router();

/********************************************************
 * SPEAKER ROUTES
 *******************************************************/

/**A route to get events for a given speaker */
api_router.get("/data/speakers/:id/events/list", getEventList);

/**A route to get a list of speakers, and their ids to use in the front end speaker search */
api_router.get("/data/speakers/list", async (req, res) => {
  try {
    const users = await getSpeakers();
    res.status(200).json({ data: users });
  } catch (error) {
    console.log("Error getting speaker list: ", error);
    res.status(500).send({ message: error });
  }
});

/** A route to enable user's to update their speaker profile */
api_router.patch(
  "/speakers/:uid/profile",
  isAuthenticated,
  async (req, res) => {
    try {
      await updateSpeakerProfile(req);
      res.status(200).json({ message: "profile data updated" });
    } catch (error) {
      console.log("Error updating profile data:", error);
      res.status(500).send({ message: error });
    }
  },
);

/**A route to get profile data for a given speaker */
api_router.get("/data/speakers/:id/profile", async (req, res) => {
  try {
    const profile = await getSpeakerProfile(req.params.id);
    res.status(200).json({ data: profile });
  } catch (error) {
    console.log("Error getting data: ", error);
    res.status(500).send({ message: error });
  }
});

/**A route to get the profile picture url for a specific speaker */
api_router.get("/data/speakers/:id/profilepicture", async (req, res) => {
  try {
    const pictureUrl = await getProfilePictureURL(req.params.id);
    res.status(200).json({ data: pictureUrl });
  } catch (error) {
    console.log("Error getting profile picture: ", error);
    res.status(500).send({ message: error });
  }
});

/** A route to accept profile picture files,
 *  return the url to the new file after upload
 */
api_router.post(
  "/data/speakers/:id/profilepicture",
  upload.single("uploadedFile"),
  isAuthenticated,
  async (req, res) => {
    try {
      const file = req.file; //from multer
      const uid = req.params.id;
      const result = await uploadProfilePicture(file, uid);
      res.status(200).json({ newProfilePictureUrl: result });
    } catch (error) {
      console.log(`problem uploading file ${error}`);
      res.status(500).send({ message: error });
    }
  },
);

/** This route returns users matching the search query */
api_router.get("/data/speakers/search", async (req, res) => {
  try {
    const searchQuery = req.query.q;
    const matchingUsers = await searchUsers(searchQuery);
    res.status(200).json({ data: matchingUsers });
  } catch (error) {
    console.log("Error searching users:", error);
    res.status(500).send({ message: error });
  }
});

/**A route to get the firebase storage items for a specific speaker */
api_router.get("/data/speakers/:id/storage", async (req, res) => {
  try {
    const itemList = await getStorageItems(req.params.id);
    res.status(200).json({ data: itemList });
  } catch (error) {
    console.log("Error searching storage:", error);
    res.status(500).send({ message: error });
  }
});

/********************************************************
 * EVENT ROUTES
 *******************************************************/
/**A route to get chart data for event review dashboard */
api_router.post("/data/events/feedback", isAuthenticated, getFeedbackData);

export default api_router;
