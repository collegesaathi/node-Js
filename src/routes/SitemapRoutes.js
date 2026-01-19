const express = require("express");
const router = express.Router();
const dynamicUpload = require("../utils/dynamicUpload");
const { GetSitemap } = require("../controllers/SitemapController");

router.get("/sitemap", GetSitemap);

module.exports = router;