const express = require("express");
const { LeadsAdd, LeadsGet, AllLeadsUniversities, GetUniversityCourse } = require("../controllers/EnqiuryController");
const router = express.Router();

router.post("/leads/add", LeadsAdd);

router.get("/leads/get", LeadsGet);

router.get("/leads/university", AllLeadsUniversities);

router.get('/leads/course/:id',GetUniversityCourse)


module.exports = router;
