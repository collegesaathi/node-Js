const express = require("express");
const { GetCoursesList, GetUniversityList } = require("../controllers/CompareController");
const router = express.Router();

router.get("/compare/courses/:university_id", GetCoursesList);
router.post('/compare/fetch-universities', GetUniversityList); 

module.exports = router;