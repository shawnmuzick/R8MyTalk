/**
 * This file should contain routes and functionality
 * related to fetching and posting data
 */
import express from "express";
import {
  Events,
  getEventList,
  getFeedbackData,
} from "../controllers/events.js";
import { Speakers } from "../controllers/speakers.js";
import { __dirname } from "../index.js";
import { upload } from "../middleware/config_multer.js";
import { isAuthenticated } from "../middleware/custom_middlewares.js";
const api_router = express.Router();

/********************************************************
 * SPEAKER ROUTES
 *******************************************************/

/**A route to get events for a given speaker */
api_router.get("/data/speakers/:id/events/list", getEventList);
/** A route to enable user's to update their speaker profile */
api_router.patch(
  "/data/speakers/:id/profile",
  isAuthenticated,
  Speakers.updateProfile,
);
/**A route to get profile data for a given speaker */
api_router.get("/data/speakers/:id/profile", Speakers.getProfile);
/**A route to get the profile picture url for a specific speaker */
api_router.get("/data/speakers/:id/profilepicture", Speakers.getProfilePicture);
/**A route to get the firebase storage items for a specific speaker */
api_router.get("/data/speakers/:id/storage", Speakers.getStorage);
/** A route to update profile pictures, return the url to the new file */
api_router.post(
  "/data/speakers/:id/profilepicture",
  upload.single("uploadedFile"),
  isAuthenticated,
  Speakers.updatePicture,
);
/**A route to get a list of speakers, and their ids to use in the front end speaker search */
api_router.get("/data/speakers/list", Speakers.list);
/** This route returns users matching the search query */
api_router.get("/data/speakers/search", Speakers.searchSpeakers);

/********************************************************
 * EVENT ROUTES
 *******************************************************/
/**A route to get chart data for event review dashboard */
api_router.post("/data/events/feedback", isAuthenticated, getFeedbackData);
/**A route to get chart data for event review dashboard */
api_router.delete(
  "/data/events/:id/:eventName",
  isAuthenticated,
  Events.deleteEvent,
);

/**A route to edit custom event questions */
api_router.post(
  "/data/events/:id/editCustomQ",
  isAuthenticated,
  Events.updateCustomQuestion,
);
export default api_router;
