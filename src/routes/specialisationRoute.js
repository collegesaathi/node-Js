const express = require("express");
const router = express.Router();
const dynamicUpload = require("../utils/dynamicUpload");
const { adminaddSpecialisation, updateSpecialisation, Allspecialisation, SpecialisationDelete, GetBySpecialisationId, GetSpecialisationCourseList } = require("../controllers/SpecialisationController");

router.get("/specialisations/:slug", GetBySpecialisationId);

router.post("/admin/specialisation/add", dynamicUpload("specialisation").any(), adminaddSpecialisation);

router.get("/all/specialisation", Allspecialisation);

router.post("/admin/specialisation/update", dynamicUpload("specialisation").any(), updateSpecialisation)


router.get("/course/specialisation/:course_id", GetSpecialisationCourseList)


router.get("/specialisation/delete/:id", SpecialisationDelete)

module.exports = router;
