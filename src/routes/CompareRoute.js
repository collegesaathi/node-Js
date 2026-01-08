const express = require("express");
const { GetCoursesList } = require("../controllers/CompareController");
const router = express.Router();

router.get("/compare/courses/:university_id", GetCoursesList);


module.exports = router;