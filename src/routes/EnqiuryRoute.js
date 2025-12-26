const express = require("express");
const { LeadsAdd, LeadsGet, allLeadsUniversities } = require("../Controllers/EnqiuryController");
const router = express.Router();

router.post("/leads/add", LeadsAdd);

router.get("/leads/get", LeadsGet);

router.get("/leads/university", allLeadsUniversities);

module.exports = router;
