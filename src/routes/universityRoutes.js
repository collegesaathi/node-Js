const express = require("express");
const router = express.Router();
const { allUniversities, adminUniversity } = require("../controllers/universityController");

router.get("/all-universities", allUniversities);

router.get("/admin-universities", adminUniversity);
module.exports = router;
