const express = require("express");
const { GetClickpickById, ClickPickDelete, updateRecord, GetClickpickData, AddClickPick, GetProgClickpickById, GetSpecClickpickById, GetClickPickListData, compareData } = require("../controllers/ClickPickController");
const router = express.Router();
router.post("/admin/clickpick/add", AddClickPick); 
router.post('/admin/clickpick/update',updateRecord) 
router.delete("/clickpick/delete/:id", ClickPickDelete) 

//View Click Pick 
router.get('/clickpick', GetClickpickData) 


//Card Click PIck
router.get('/list/clickpick', GetClickPickListData);

router.get('/all-compare/clickpick', compareData);

router.get('/spe-compare/clickpick', compareData);


module.exports = router;