import { dirname } from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import express from "express";
import session from "express-session";
import router from "./routes.js";
const __dirname = dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT || 3000;
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

// load static HTML files
app.use(express.static(`${__dirname}/Public`));

// handle page and api routing
app.use("/", router);

// Listens to the port for request
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
