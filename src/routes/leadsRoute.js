const express = require("express");
const router = express.Router();
const { home, LeadsAdd, LeadsGet } = require("../Controllers/LeadsController");

router.post("/leads/add", LeadsAdd);

router.get("/leads/get", LeadsGet);


module.exports = router;
