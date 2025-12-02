const dotenv = require("dotenv");
dotenv.config();

// require("./dbconfigration");
require("./config/prisma");
const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
// const serverless = require('serverless-http');

const corsOptions = {
  origin: "*", // Allowed origins
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "*", // Allow all headers
  credentials: true,
  optionsSuccessStatus: 200, // for legacy browsers
};
app.use(cors(corsOptions));

app.use(express.json({ limit: "2000mb" }));
app.use(express.urlencoded({ extended: true, limit: "2000mb" }));

// -----------------------------------------------------
// ✅ STATIC IMAGE FOLDERS (VERY IMPORTANT)
// -----------------------------------------------------
app.use("/approval_images", express.static(path.join(__dirname, "../public/approval_images")));
app.use("/placement_partners", express.static(path.join(__dirname, "../public/placement_partners")));

app.use("/universities/icon", express.static(path.join(__dirname, "../public/universities/icon")));
app.use("/universities/main", express.static(path.join(__dirname, "../public/universities/main")));

// -----------------------------------------------------


const PORT = process.env.REACT_APP_SERVER_DOMAIN || 5000;

app.use("/api", require("./routes/authRoutes"));
app.use("/api", require("./routes/homeRoutes"));
app.use("/api", require("./routes/userRoutes"));
app.use("/api", require("./routes/universityRoutes"));



app.get("/", (req, res) => {
  res.json({
    msg: "Hello World",
    status: 200,
  });
});

const server = app.listen(PORT, () => console.log("Server is running at port : " + PORT));
server.timeout = 360000;