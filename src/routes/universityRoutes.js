const express = require("express");
const router = express.Router();
const { allUniversities, adminapprovalsplacements, adminUniversitylisting, addUniversity, allAdminUniversities, universitiesDelete, getUniversityById, updateUniversity, GetServicesUniversityById, DeleteUniversityBySlug } = require("../controllers/universityController");
const dynamicUpload = require("../utils/dynamicUpload");

router.get("/universities", allUniversities);
router.get("/admin/approvalandpartners", adminapprovalsplacements);
router.get("/admin/universities/listing", adminUniversitylisting);
router.post("/admin/universities/add", dynamicUpload("universities").any(), addUniversity);
router.get("/admin/university", allAdminUniversities);
router.get("/university/delete/:id", universitiesDelete)
router.get("/university/:slug", getUniversityById)

router.get("/university/services/:slug", GetServicesUniversityById)

router.post("/admin/universities/update", dynamicUpload("universities").any(), updateUniversity)


router.delete(
  "/university/slug/:slug",
  DeleteUniversityBySlug
);

module.exports = router;
