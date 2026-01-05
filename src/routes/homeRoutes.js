const express = require("express");
const router = express.Router();
const dynamicUpload = require("../utils/dynamicUpload");
const { home, AddVideo, GetVideoById, UpdateVideo, VideoDelete } = require("../controllers/homeController");

router.get("/home", home);
router.post("/admin/homeVideo/add", dynamicUpload("home").any(), AddVideo);
router.get("/admin/homeVideo/:id", GetVideoById);
router.post("/admin/homeVideo/update", dynamicUpload("home").any(), UpdateVideo)
router.delete("/admin/homeVideo/delete/:id", VideoDelete)
module.exports = router;
