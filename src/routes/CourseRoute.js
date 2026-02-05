const express = require("express");
const router = express.Router();
const dynamicUpload = require("../utils/dynamicUpload");
const { AllCourses, AddCourse, GetCourseById, GetUniversityCourseList, GetCourseByName, UpdateCourse, GetAllCourses, AdminGetCourseById, CoursesDelete } = require("../controllers/CourseController");
// const { upload } = require("../utils/s3");

router.get("/all/course", AllCourses);
router.post("/admin/course/add", dynamicUpload("course").any(), AddCourse);
router.get("/university-course/:id", GetUniversityCourseList)
router.get("/course_name/:id", GetCourseByName)
router.post("/admin/course/update", dynamicUpload("universities").any(), UpdateCourse)






// user Side 
router.get("/all/data/course" , GetAllCourses)
router.get("/course/:univ/:slug", GetCourseById)

// Admin Route  

router.get("/course/delete/:id", CoursesDelete)
router.get("/admin/course-get/:id/:slug", AdminGetCourseById );

module.exports = router;
