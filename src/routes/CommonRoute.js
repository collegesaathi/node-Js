const express = require("express");
const { List } = require("../Controllers/CommonController");
const router = express.Router();


router.get("/list", List);

module.exports = router;
