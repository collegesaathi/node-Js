const express = require("express");
const router = express.Router();
const { allUniversities, adminapprovalsplacements, adminUniversitylisting, addUniversity, allAdminUniversities, universitiesDelete, getUniversityById, updateUniversity, GetServicesUniversityById, AdminGetUniversityById } = require("../controllers/universityController");
const dynamicUpload = require("../utils/dynamicUpload");
//user Route
router.get("/universities", allUniversities);
router.get("/university/:slug", getUniversityById)
router.get("/university/services/:slug", GetServicesUniversityById)

//Admin Route
router.post("/admin/universities/update", dynamicUpload("universities").any(), updateUniversity)
router.post("/admin/universities/add", dynamicUpload("universities").any(), addUniversity);
router.get("/university/delete/:id", universitiesDelete)
router.get("/admin/university/:slug", AdminGetUniversityById)
router.get("/admin/approvalandpartners", adminapprovalsplacements);
router.get("/admin/universities/listing", adminUniversitylisting);
router.get("/admin/university", allAdminUniversities);


module.exports = router;
