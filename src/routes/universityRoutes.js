const express = require("express");
const router = express.Router();
const { allUniversities, adminUniversity, adminUniversitylisting, addUniversity } = require("../controllers/universityController");

router.get("/all-universities", allUniversities);

router.get("/admin-universities", adminUniversity);

router.get("/admin-universities-listing", adminUniversitylisting);

router.post("/admin-add-university", addUniversity);

module.exports = router;
