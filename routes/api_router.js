/**
 * This file should contain routes and functionality
 * related to fetching and posting data
 */
import express from "express";
import {
  getEventList,
  getFeedbackData,
  getSpeakers,
  searchUsers,
} from "../controllers/api.js";
import {
  getProfilePictureURL,
  getSpeakerProfile,
  getStorageItems,
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
    res.json({ data: users });
  } catch (error) {
    console.log("Error getting data: ", error);
    res.status(500);
    res.send({ message: error });
  }
});

/**A route to get profile data for a given speaker */
api_router.get("/data/speakers/:id/profile", async (req, res) => {
  try {
    const profile = await getSpeakerProfile(req.params.id);
    res.json({ data: profile });
  } catch (error) {
    console.log("Error getting data: ", error);
    res.status(500);
    res.send({ message: error });
  }
});

/**A route to get the profile picture url for a specific speaker */
api_router.get("/data/speakers/:id/profilepicture", async (req, res) => {
  const pictureUrl = await getProfilePictureURL(req.params.id);
  res.json({ data: pictureUrl });
});

/**A route to accept profile picture files */
api_router.post(
  "/data/speakers/:id/profilepicture",
  upload.single("uploadedFile"),
  isAuthenticated,
  async (req, res) => {
    try {
      console.log("user_id", req.params.id);
      const result = await uploadProfilePicture();
      res.status(200);
      res.json({ message: "Upload OK" });
    } catch (error) {
      console.log(`problem uploading file ${error}`);
      res.status(500).send("Error uploading file");
    }
  },
);

/** This route returns users matching the search query */
api_router.get("/data/speakers/search", async (req, res) => {
  try {
    const searchQuery = req.query.q;
    const matchingUsers = await searchUsers(searchQuery);
    res.json({ data: matchingUsers });
  } catch (error) {
    console.log("Error searching users:", error);
    res.status(500);
    res.send({ message: error });
  }
});

/**A route to get the firebase storage items for a specific speaker */
api_router.get("/data/speakers/:id/storage", async (req, res) => {
  const itemList = await getStorageItems(req.params.id);
  res.json({ data: itemList });
});

/********************************************************
 * EVENT ROUTES
 *******************************************************/
/**A route to get chart data for event review dashboard */
api_router.post("/data/events/feedback", isAuthenticated, getFeedbackData);

export default api_router;
