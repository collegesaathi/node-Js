const express = require("express");
const { List ,University } = require("../Controllers/CommonController");
const router = express.Router();

router.get("/all/catergoy/university", List);

router.get("/all/university", University);

module.exports = router;
