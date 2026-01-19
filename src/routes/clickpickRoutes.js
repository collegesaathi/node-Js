const express = require("express");
const { addRecords, GetClickpickById, ClickPickDelete, updateRecord, GetClickpickData } = require("../controllers/ClickPickController");
const router = express.Router();

router.post("/clickpick/add", addRecords); // Create
router.get("/clickpick/:id", GetClickpickById); // Read
router.post('/clickpick/update/:id',updateRecord) // Update
router.delete("/clickpick/delete/:id", ClickPickDelete) // Delete


router.get('/clickpick', GetClickpickData) //Frontend data fetch
module.exports = router;