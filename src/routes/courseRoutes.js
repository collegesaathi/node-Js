const express = require("express");
const router = express.Router();
const upload = require("../utils/Uploader");
const dynamicUpload = require("../utils/Uploader");
const { AddCourse, AllCourses, GetCourseById, CoursesDelete } = require("../Controllers/CourseController");

router.get("/all/course", AllCourses);

router.post("/admin/course/add", dynamicUpload("course").any(), AddCourse);

router.get("/course/delete/:id", CoursesDelete)

router.get("/course/:slug", GetCourseById)


// router.post("/admin/universities/update", dynamicUpload("universities").any(), updateUniversity)

module.exports = router;
