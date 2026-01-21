const express = require("express");
const { GetCoursesList, GetUniversityList, GetClickPickData, compareData } = require("../controllers/CompareController");
const { compare } = require("bcrypt");
const router = express.Router();

router.get("/compare/courses/:university_id", GetCoursesList);
router.post('/compare/universities', GetUniversityList); 
router.get('/compare/clickpick', GetClickPickData);


module.exports = router; 