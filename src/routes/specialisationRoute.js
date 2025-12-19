const express = require("express");
const router = express.Router();
const upload = require("../utils/Uploader");
const dynamicUpload = require("../utils/Uploader");
const { adminaddSpecialisation, adminSpecialisationlisting, Allspecialisation, SpecialisationDelete, GetBySpecialisationId } = require("../controllers/SpecialisationController");

router.get("/specialisations/:slug", GetBySpecialisationId);

router.post("/admin/specialisation/add", dynamicUpload("specialisation").any(), adminaddSpecialisation);

router.get("/all/specialisation", Allspecialisation);

// router.post("/admin/specialisation/update", dynamicUpload("universities").any(), updateUniversity)

// router.get("/specialisation/delete/:id", SpecialisationDelete)

// router.get("/specialisation/:slug", GetSpecialisationById)


module.exports = router;
