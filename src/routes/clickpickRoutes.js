const express = require("express");
const { GetClickpickById, ClickPickDelete, updateRecord, GetClickpickData, AddClickPick, GetProgClickpickById, GetSpecClickpickById, GetClickPickListData } = require("../controllers/ClickPickController");
const router = express.Router();
router.post("/admin/clickpick/add", AddClickPick); 
router.post('/admin/clickpick/update',updateRecord) 
router.delete("/clickpick/delete/:id", ClickPickDelete) 
router.get('/clickpick', GetClickpickData) 

router.get('/list/clickpick', GetClickPickListData);

module.exports = router;