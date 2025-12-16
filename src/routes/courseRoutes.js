const express = require("express");
const router = express.Router();
const upload = require("../utils/Uploader");
const dynamicUpload = require("../utils/Uploader");
const { AddCourse,  } = require("../Controllers/CourseController");
const { AllCourses } = require("../Controllers/CourseController");

router.get("/all/Coueses", AllCourses);

router.post("/admin/course/add", dynamicUpload("course").any(), AddCourse);

// router.get("/university/delete/:id", universitiesDelete)

// router.get("/university/:slug", getUniversityById)

// router.post("/admin/universities/update", dynamicUpload("universities").any(), updateUniversity)

module.exports = router;
