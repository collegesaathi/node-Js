const express = require("express");
const router = express.Router();
const dynamicUpload = require("../utils/dynamicUpload");
const { UploadImage } = require("../controllers/CompressController");
// const { upload } = require("../utils/s3");

// user Side 
router.post("/upload-image", dynamicUpload("Imageuploads/original").any(),UploadImage)


module.exports = router;