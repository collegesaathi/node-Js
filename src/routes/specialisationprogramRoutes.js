const express = require("express");
const router = express.Router();
const dynamicUpload = require("../utils/dynamicUpload");
const { adminaddSpecialisationProgram, GetSpecialisationProgramList } = require("../controllers/ProgramSpecialisationController");



router.post("/admin/program/specialisation/add", dynamicUpload("Specialisationprogram").any(), adminaddSpecialisationProgram);


router.get("/program/specialisation/:id", GetSpecialisationProgramList)

module.exports = router;