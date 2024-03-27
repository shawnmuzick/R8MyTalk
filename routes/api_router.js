/**
 * This file should contain routes and functionality
 * related to fetching and posting data
 */
import express from "express";
import {
  getEventList,
  getFeedbackData,
  getSpeakers,
} from "../controllers/api.js";
import { isAuthenticated } from "../custom_middlewares.js";
import { __dirname } from "../index.js";
const api_router = express.Router();

/**A route to get events for a given speaker */
api_router.get("/data/speakers/:id/events/list", getEventList);

/**
 * This endpoint returns a list of speakers, and their ids
 * to be used in the front end speaker search
 */
api_router.get("/data/speakers/list", getSpeakers);

/**A route to get chart data for event review dashboard */
api_router.post("/data/events/feedback", isAuthenticated, getFeedbackData);

export default api_router;
