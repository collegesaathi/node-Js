const express = require("express");
const { List, GlobalSearch, CompareUniversity, AllProgram, PopUniversityApi, GetUniversityCategroyList, GetCategroyList, GetApprovalUniversity, UniversityList, GetSchollarshipList, GetPlacementList } = require("../controllers/CommonController");
const router = express.Router();

router.get("/all/catergoy/university", List);

router.get("/all/search", GlobalSearch); //Route for global search

router.get("/all/university", UniversityList); //Route for global search


router.get("/compare/university/:slug", CompareUniversity);

router.get("/all/program", AllProgram);

router.get("/all/popup/:slug", PopUniversityApi);

router.get("/categroy/university/:id", GetUniversityCategroyList);

router.get("/common/categroy", GetCategroyList);

router.get("/approval/placement/:slug", GetApprovalUniversity);

router.get('/schollarship/list', GetSchollarshipList);

router.get('/placement/list', GetPlacementList);

module.exports = router;