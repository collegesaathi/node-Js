const express = require("express");
const router = express.Router();
const dynamicUpload = require("../utils/dynamicUpload");
const { AllCourses, AddCourse, CoursesDelete, GetCourseById, GetUniversityCourseList, GetCourseByName, UpdateCourse } = require("../controllers/CourseController");
// const { upload } = require("../utils/s3");

router.get("/all/course", AllCourses);
router.post("/admin/course/add", dynamicUpload("course").any(), AddCourse);
router.get("/course/delete/:id", CoursesDelete)
router.get("/course/:slug", GetCourseById)
router.get("/course/university/:id", GetUniversityCourseList)
router.get("/course_name/:id", GetCourseByName)
router.post("/admin/course/update", dynamicUpload("universities").any(), UpdateCourse)


module.exports = router;
