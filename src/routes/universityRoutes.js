const express = require("express");
const router = express.Router();
const { allUniversities } = require("../controllers/universityController");

router.get("/all-universities", allUniversities);

module.exports = router;
