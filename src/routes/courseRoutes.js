const express = require("express");
const router = express.Router();
const upload = require("../utils/Uploader");
const dynamicUpload = require("../utils/Uploader");
const { AddCourse, AllCourses, GetCourseById, CoursesDelete, UpdateCourse,GetUniversityCourseList } = require("../Controllers/CourseController");

router.get("/all/course", AllCourses);

router.post("/admin/course/add", dynamicUpload("course").any(), AddCourse);

router.get("/course/delete/:id", CoursesDelete)

router.get("/course/:slug", GetCourseById)
router.get("/course/university/:id", GetUniversityCourseList)


router.post("/admin/course/update", dynamicUpload("universities").any(), UpdateCourse)

module.exports = router;
