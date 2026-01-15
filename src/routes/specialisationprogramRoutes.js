const express = require("express");
const router = express.Router();
const dynamicUpload = require("../utils/dynamicUpload");
const { adminaddSpecialisationProgram } = require("../controllers/ProgramSpecialisationController");



router.post("/admin/program/specialisation/add", dynamicUpload("Specialisationprogram").any(), adminaddSpecialisationProgram);

module.exports = router;