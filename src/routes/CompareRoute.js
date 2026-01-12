const express = require("express");
const { GetCoursesList, GetUniversityList, GetClickPickData } = require("../controllers/CompareController");
const router = express.Router();

router.get("/compare/courses/:university_id", GetCoursesList);
router.post('/compare/universities', GetUniversityList); 
router.get('/compare/clickpick', GetClickPickData);

module.exports = router; 