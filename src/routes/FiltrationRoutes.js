const express = require("express");
const {  GetFilterCategroybyuniversity, GetFilterprogrambyuniversity, GetFilterSpelizationbyuniversity, ApprovalFilter, GetFilterApprovalbyuniversity } = require("../controllers/FiltrationController");
const { compare } = require("bcrypt");
const router = express.Router();

router.get("/filtration/category", GetFilterCategroybyuniversity);

router.get("/filtration/program", GetFilterprogrambyuniversity);

router.get("/filtration/SpecialisationPrograms", GetFilterSpelizationbyuniversity);

router.get("/filtration/Approval", ApprovalFilter);

router.get("/filtration/university/", GetFilterApprovalbyuniversity);







module.exports = router; 