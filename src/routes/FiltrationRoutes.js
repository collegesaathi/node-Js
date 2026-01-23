const express = require("express");
const { GetFiltrationList } = require("../controllers/FiltrationController");
const { compare } = require("bcrypt");
const router = express.Router();

router.get("/filtration", GetFiltrationList);



module.exports = router; 