const express = require("express");
const { GetClickpickById, ClickPickDelete, updateRecord, GetClickpickData, AddClickPick, GetProgClickpickById, GetSpecClickpickById } = require("../controllers/ClickPickController");
const router = express.Router();
router.post("/admin/clickpick/add", AddClickPick); 
router.get("/admin/clickpick/:category_id", GetClickpickById); 
router.get("/admin/clickpick/program/:program_id", GetProgClickpickById); 
router.get("/admin/clickpick/spac/:specialisation_program_id", GetSpecClickpickById); 
router.post('/admin/clickpick/update/:id',updateRecord) 
router.delete("/clickpick/delete/:id", ClickPickDelete) 
router.get('/clickpick', GetClickpickData) 
module.exports = router;