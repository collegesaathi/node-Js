const express = require("express");
const { SearchReviews, GetInstituteData } = require("../controllers/ScrapperController");
const router = express.Router();

router.get("/scrapper-search", SearchReviews);
router.get("/institute-data", GetInstituteData);

module.exports = router; 