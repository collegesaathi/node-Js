const express = require("express");
const router = express.Router();
const upload = require("../utils/Uploader");
const dynamicUpload = require("../utils/Uploader");
const { AddCourse, AllCourses, GetCourseById } = require("../Controllers/CourseController");

router.get("/all/Coueses", AllCourses);

router.post("/admin/course/add", dynamicUpload("course").any(), AddCourse);

// router.get("/university/delete/:id", universitiesDelete)

router.get("/course/:slug", GetCourseById)

// router.post("/admin/universities/update", dynamicUpload("universities").any(), updateUniversity)

module.exports = router;
