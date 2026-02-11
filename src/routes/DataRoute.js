const {  DeleteCourseBySlug, DeleteUniversityBySlug } = require("../controllers/DataController");
const express = require("express");
const router = express.Router();

router.delete("/course/slug/:slug", DeleteCourseBySlug);

router.delete( "/university/slug/:slug",DeleteUniversityBySlug);

module.exports = router;
