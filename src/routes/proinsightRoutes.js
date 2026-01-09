const express = require("express");
const { GetproinsightList } = require("../controllers/ProInsightController");
const router = express.Router();

router.get("/proinsight", GetproinsightList);

module.exports = router; 