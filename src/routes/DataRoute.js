const {  DeleteCourseBySlug, DeleteUniversityBySlug, SpecialisationDelete, ProgramGenraic, GenraixcalSpecialisationProgramDeelte } = require("../controllers/DataController");
const express = require("express");
const router = express.Router();

router.get("/course/slug/:id", DeleteCourseBySlug);

router.get( "/university/slug/:id",DeleteUniversityBySlug);

router.get( "/spe/slug/:id",SpecialisationDelete);

router.get( "/genra/progrma/:id",ProgramGenraic);
router.get( "/genra/speprogram/:id",GenraixcalSpecialisationProgramDeelte);


module.exports = router;
