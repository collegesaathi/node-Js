const express = require("express");
const router = express.Router();
const upload = require("../utils/Uploader");
const dynamicUpload = require("../utils/Uploader");
const { adminaddSpecialisation, adminSpecialisationlisting, Allspecialisation, SpecialisationDelete } = require("../controllers/SpecialisationController");

router.get("/all/specialisations/:slug", adminSpecialisationlisting);

router.post("/admin/specialisation/add", dynamicUpload("specialisation").any(), adminaddSpecialisation);

router.get("/all/specialisation", Allspecialisation);

// router.get("/specialisation/delete/:id", SpecialisationDelete)

// router.get("/specialisation/:slug", GetSpecialisationById)


// router.post("/admin/universities/update", dynamicUpload("universities").any(), updateUniversity)

module.exports = router;
