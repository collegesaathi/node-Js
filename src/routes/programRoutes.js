const express = require("express");
const router = express.Router();
const dynamicUpload = require("../utils/dynamicUpload");
const {  AllPrograms, AddProgram, GetProgramById, UpdateProgram, ProgramDelete, GetFrontedProgramById } = require("../controllers/ProgramController");
// const { upload } = require("../utils/s3");

router.get("/all/programs", AllPrograms);
router.post("/admin/program/add", dynamicUpload("program").any(), AddProgram);
router.get("/admin/program/:slug", GetProgramById);
router.get("/program/:slug", GetFrontedProgramById);

router.post("/admin/program/update", dynamicUpload("program").any(), UpdateProgram);
router.delete("/program/:id", ProgramDelete);
module.exports = router;

