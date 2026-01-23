const express = require("express");
const { ClickPickDelete, updateRecord, GetClickpickData, AddClickPick, GetClickPickListData, compareData, compareSpeData } = require("../controllers/ClickPickController");
const router = express.Router();
router.post("/admin/clickpick/add", AddClickPick);
router.post('/admin/clickpick/update', updateRecord)
router.delete("/clickpick/delete/:id", ClickPickDelete)
//View Click Pick 
router.get('/clickpick', GetClickpickData)
//Card Click PIck
router.get('/list/clickpick', GetClickPickListData);
router.get('/all-compare/clickpick', compareData);
router.get('/spe-compare/clickpick', compareSpeData);


module.exports = router;