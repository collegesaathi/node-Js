const express = require("express");
const router = express.Router();
const dynamicUpload = require("../utils/dynamicUpload");
const { adminaddSpecialisationProgram, GetSpecialisationProgramList, GetSpecialisationProgramById, adminupdateSpecialisationProgram, specialisationDelete, GetSpecialisationProgramByUniverty, GetFrontendSpe } = require("../controllers/ProgramSpecialisationController");
router.post("/admin/program/specialisation/add", dynamicUpload("Specialisationprogram").any(), adminaddSpecialisationProgram);

router.post("/admin/program/specialisation/update", dynamicUpload("Specialisationprogram").any(), adminupdateSpecialisationProgram);

router.get("/program/specialisation/:id", GetSpecialisationProgramList)

router.get("/specialisation-program/:id/:slug", GetSpecialisationProgramById)

router.get("/specialisation-univeristy", GetSpecialisationProgramByUniverty)

router.delete("/admin/program/specialisation/delete/:id", specialisationDelete);


router.get("/frontend-specialisation-program/:categr/:programslug/:slug", GetFrontendSpe)



module.exports = router;