const express = require("express");
const router = express.Router();
const { allUniversities, adminapprovalsplacements, adminUniversitylisting, addUniversity } = require("../controllers/universityController");
const upload = require("../utils/Uploader");

router.get("/all/universities", allUniversities);

router.get("/admin/approvalandpartners", adminapprovalsplacements);

router.get("/admin/universities/listing", adminUniversitylisting);

router.post("/admin/universities/add", upload.fields([
    { name: "icon", maxCount: 1 },
    { name: "cover_image", maxCount: 1 }
  ]), addUniversity);

module.exports = router;
