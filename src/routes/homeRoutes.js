const express = require("express");
const router = express.Router();
const dynamicUpload = require("../utils/dynamicUpload");
const { AllTopProgram, AddVideo, GetVideoById, UpdateVideo, VideoDelete,ExploreUniversities } = require("../controllers/homeController");

router.get("/spe/home", AllTopProgram);
router.post("/admin/home/add", dynamicUpload("home").any(), AddVideo);
router.get("/admin/home/:id", GetVideoById);
router.post("/admin/home/update", dynamicUpload("home").any(), UpdateVideo)
router.delete("/admin/home/delete/:id", VideoDelete)
router.get("/explore-university",ExploreUniversities)
module.exports = router;
