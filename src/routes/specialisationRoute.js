const express = require("express");
const router = express.Router();
const upload = require("../utils/Uploader");
const dynamicUpload = require("../utils/Uploader");
const { adminaddSpecialisation, updateSpecialisation, Allspecialisation, SpecialisationDelete, GetBySpecialisationId, GetSpecialisationCourseList } = require("../controllers/SpecialisationController");

router.get("/specialisations/:slug", GetBySpecialisationId);

router.post("/admin/specialisation/add", dynamicUpload("specialisation").any(), adminaddSpecialisation);

router.get("/all/specialisation", Allspecialisation);

router.post("/admin/specialisation/update", dynamicUpload("specialisation").any(), updateSpecialisation)


router.get("/course/specialisation/:university_id/:course_id", GetSpecialisationCourseList)


router.get("/specialisation/delete/:id", SpecialisationDelete)

router.get("/specialisation/course/:id", GetSpecialisationCourseList)



module.exports = router;
