const express = require("express");
const { List, University, CompareUniversity, AllProgram, PopUniversityApi, GetUniversityCategroyList, GetCategroyList } = require("../controllers/CommonController");
const router = express.Router();

router.get("/all/catergoy/university", List);

router.get("/all/university", University);

// router.get("/compare/university/:firstslug/:secondslug/:thirdslug", CompareUniversity);
router.get("/compare/university/:slug", CompareUniversity);

router.get("/all/program", AllProgram);

router.get("/all/popup/:slug", PopUniversityApi);

router.get("/categroy/university/:id", GetUniversityCategroyList);

router.get("/common/categroy", GetCategroyList);


module.exports = router;
