const express = require("express");
const router = express.Router();
const dynamicUpload = require("../utils/dynamicUpload");
const {  AddProgram, GetProgramById, UpdateProgram } = require("../controllers/ProgramController");
// const { upload } = require("../utils/s3");

// router.get("/all/programs", AllPrograms);

router.post("/admin/program/add", dynamicUpload("program").any(), AddProgram);
router.get("/admin/program/:slug", GetProgramById);
router.post("/admin/program/update", dynamicUpload("program").any(), UpdateProgram);
module.exports = router;

