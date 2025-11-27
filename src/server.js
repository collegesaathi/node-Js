const express = require("express");
const bodyParser = require("body-parser");

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const homeRoutes = require("./routes/homeRoutes");

const app = express();

// Middlewares
app.use(bodyParser.json());

// API Routes
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", homeRoutes);

// Start server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
