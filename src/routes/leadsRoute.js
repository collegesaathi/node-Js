const express = require("express");
const router = express.Router();
const {  LeadsAdd, LeadsGet, allLeadsUniversities } = require("../Controllers/LeadsController");

router.post("/leads/add", LeadsAdd);

router.get("/leads/get", LeadsGet);

router.get("/leads/university", allLeadsUniversities);



module.exports = router;
