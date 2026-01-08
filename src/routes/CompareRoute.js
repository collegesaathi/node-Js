const express = require("express");
const { GetCoursesList } = require("../controllers/CompareController");
const router = express.Router();

router.post("/courses", GetCoursesList);


module.exports = router;