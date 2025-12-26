const express = require("express");
const { LeadsAdd, LeadsGet, AllLeadsUniversities } = require("../Controllers/EnqiuryController");
const router = express.Router();

router.post("/leads/add", LeadsAdd);

router.get("/leads/get", LeadsGet);

router.get("/leads/university", AllLeadsUniversities);

module.exports = router;
