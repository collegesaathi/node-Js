const express = require("express");
const router = express.Router();
const { allUniversities, adminapprovalsplacements, adminUniversitylisting, addUniversity, allAdminUniversities, universitiesDelete, editUniversity, getUniversityById, updateUniversity } = require("../controllers/universityController");
const dynamicUpload = require("../utils/dynamicUpload");

router.get("/universities", allUniversities);
router.get("/admin/approvalandpartners", adminapprovalsplacements);
router.get("/admin/universities/listing", adminUniversitylisting);
router.post("/admin/universities/add", dynamicUpload("universities").any(), addUniversity);
router.get("/admin/university", allAdminUniversities);
router.get("/university/delete/:id", universitiesDelete)
router.get("/university/:slug", getUniversityById)
router.post("/admin/universities/update", dynamicUpload("universities").any(), updateUniversity)

module.exports = router;
