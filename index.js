/** This file is the application entry point */

/** Set up imports */
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import { pageNotFound } from "./middleware/custom_middlewares.js";
import { initializeFirebaseAdmin } from "./middleware/firebase_admin.js";
import {
  getFirebaseAuth,
  getFirebaseDB,
  getFirebaseStorage,
  initializeFirebaseApp,
} from "./middleware/firebase_app.js";
import api_router from "./routes/api_router.js";
import view_router from "./routes/view_router.js";

/** Set up the application directory path */
export const __dirname = dirname(fileURLToPath(import.meta.url));

/** Set up the environment variables */
dotenv.config();
const PORT = process.env.PORT || 3000;

/** Set up Firebase */
const fbapp = initializeFirebaseApp();
export const db = getFirebaseDB(fbapp);
export const storage = getFirebaseStorage(fbapp);
export const auth = getFirebaseAuth(fbapp);
initializeFirebaseAdmin();

/** Set up Express */
const app = express();

/** Set up middlewares */
app.use(bodyParser.json({ limit: "256Mb" }));
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

/** Set up routing */
// load static HTML files
app.use(express.static(`${__dirname}/Public`));

// handle page and api routing
app.use("/api", api_router);
app.use("/", view_router);

/** This middleware renders a 404 page if no other middleware responded */
app.use(pageNotFound);

/** Set up the server */
const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

export default server;
