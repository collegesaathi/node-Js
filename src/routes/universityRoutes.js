const express = require("express");
const router = express.Router();
const { allUniversities, adminapprovalsplacements, adminUniversitylisting, addUniversity } = require("../controllers/universityController");
const upload = require("../utils/Uploader");
const dynamicUpload = require("../utils/Uploader");

router.get("/all/universities", allUniversities);

router.get("/admin/approvalandpartners", adminapprovalsplacements);

router.get("/admin/universities/listing", adminUniversitylisting);

router.post("/admin/universities/add",  dynamicUpload("universities").any(), addUniversity);


module.exports = router;
