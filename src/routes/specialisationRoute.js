const express = require("express");
const router = express.Router();
const dynamicUpload = require("../utils/dynamicUpload");
const { adminaddSpecialisation, updateSpecialisation, Allspecialisation, SpecialisationDelete, GetBySpecialisationId, GetSpecialisationCourseList, DeleteSpecialisationBySlug, GetAllSpecialisationsdata, AdminGetSpecialisationById } = require("../controllers/SpecialisationController");

router.get("/specialisations/:slug", GetBySpecialisationId);

router.get("/all/specialisation", Allspecialisation);

router.get("/specialisation/delete/:id", SpecialisationDelete)


router.delete("/specialisation/slug/:slug",
  DeleteSpecialisationBySlug
);

router.get("/all/data/spe" , GetAllSpecialisationsdata)


//Admin Router 
router.get("/admin/specialisation-get/:id/:slug", AdminGetSpecialisationById );
router.get("/specialisation-course/:course_id", GetSpecialisationCourseList)
router.post("/admin/specialisation/update", dynamicUpload("specialisation").any(), updateSpecialisation)
router.post("/admin/specialisation/add", dynamicUpload("specialisation").any(), adminaddSpecialisation);

module.exports = router;
