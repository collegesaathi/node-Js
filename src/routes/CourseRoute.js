const express = require("express");
const router = express.Router();
const dynamicUpload = require("../utils/dynamicUpload");
const { AllCourses, AddCourse, GetCourseById, GetUniversityCourseList, GetCourseByName, UpdateCourse, GetAllCourses, AdminGetCourseById, CoursesDelete } = require("../controllers/CourseController");
// const { upload } = require("../utils/s3");

// user Side 
router.get("/all/data/course" , GetAllCourses)
router.get("/course/:univ/:slug", GetCourseById)
router.get("/all/course", AllCourses);
router.get("/university-course/:id", GetUniversityCourseList)
router.get("/course_name/:id", GetCourseByName)
// Admin Route  
router.get("/course/delete/:id", CoursesDelete)
router.get("/admin/course-get/:id/:slug", AdminGetCourseById );
router.post("/admin/course/add", dynamicUpload("course").any(), AddCourse);
router.post("/admin/course/update", dynamicUpload("universities").any(), UpdateCourse)

module.exports = router;