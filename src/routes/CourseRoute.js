const express = require("express");
const router = express.Router();
const dynamicUpload = require("../utils/dynamicUpload");
const { AllCourses, AddCourse, CoursesDelete, GetCourseById, GetUniversityCourseList, GetCourseByName, UpdateCourse, DeleteCourseBySlug, GetAllCourses, AdminGetCourseById } = require("../controllers/CourseController");
// const { upload } = require("../utils/s3");

router.get("/all/course", AllCourses);
router.post("/admin/course/add", dynamicUpload("course").any(), AddCourse);
router.get("/course/delete/:id", CoursesDelete)
router.get("/course/:univ/:slug", GetCourseById)

router.get("/university-course/:id", GetUniversityCourseList)
router.get("/course_name/:id", GetCourseByName)
router.post("/admin/course/update", dynamicUpload("universities").any(), UpdateCourse)

router.delete("/course/slug/:slug", DeleteCourseBySlug);


router.get("/all/data/course" , GetAllCourses)

// Admin Route  

router.get("/admin/course-get/:id/:slug", AdminGetCourseById );

module.exports = router;
