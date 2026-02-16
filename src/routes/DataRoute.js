const {  DeleteCourseBySlug, DeleteUniversityBySlug, SpecialisationDelete, ProgramGenraic, GenraixcalSpecialisationProgramDeelte } = require("../controllers/DataController");
const express = require("express");
const router = express.Router();

router.delete("/course/slug/:id", DeleteCourseBySlug);

router.delete( "/university/slug/:id",DeleteUniversityBySlug);

router.delete( "/spe/slug/:id",SpecialisationDelete);

router.delete( "/genra/progrma/:id",ProgramGenraic);
router.delete( "/genra/speprogram/:id",GenraixcalSpecialisationProgramDeelte);


module.exports = router;
