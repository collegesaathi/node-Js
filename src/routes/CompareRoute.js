const express = require("express");
const { GetCoursesList } = require("../controllers/CompareController");
const router = express.Router();

router.post("/compare/courses", GetCoursesList);


module.exports = router;