const express = require("express");
const router = express.Router();
const { allUniversities, adminapprovalsplacements, adminUniversitylisting, addUniversity, allAdminUniversities, universitiesDelete } = require("../controllers/universityController");
const upload = require("../utils/Uploader");
const dynamicUpload = require("../utils/Uploader");

router.get("/all/universities", allUniversities);

router.get("/admin/approvalandpartners", adminapprovalsplacements);

router.get("/admin/universities/listing", adminUniversitylisting);

router.post("/admin/universities/add", dynamicUpload("universities").any(), addUniversity);

router.get("/admin/university", allAdminUniversities);

router.get("/university/delete/:id", universitiesDelete)

module.exports = router;
