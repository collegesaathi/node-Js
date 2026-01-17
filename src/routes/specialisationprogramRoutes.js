const express = require("express");
const router = express.Router();
const dynamicUpload = require("../utils/dynamicUpload");
const { adminaddSpecialisationProgram, GetSpecialisationProgramList, GetSpecialisationProgramById, adminupdateSpecialisationProgram } = require("../controllers/ProgramSpecialisationController");


router.post("/admin/program/specialisation/add", dynamicUpload("Specialisationprogram").any(), adminaddSpecialisationProgram);

router.post("/admin/program/specialisation/update", dynamicUpload("Specialisationprogram").any(), adminupdateSpecialisationProgram);

router.get("/program/specialisation/:id", GetSpecialisationProgramList)

router.get("/specialisation-program/:slug", GetSpecialisationProgramById)


module.exports = router;