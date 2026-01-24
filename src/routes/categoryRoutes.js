const express = require("express");
const { List, addCategory, editCategory, updateCategory, deleteCategory } = require("../controllers/CategoryController");
const router = express.Router();
const dynamicUpload = require("../utils/dynamicUpload");

router.get("/all/catergoy/university", List);
router.post("/add/category", dynamicUpload("category").any() , addCategory);
router.put("/edit/category/:id", editCategory);
router.post("/update/category/:id", dynamicUpload("universities").any(), updateCategory);
router.delete("/delete/category/:id", deleteCategory);

module.exports = router;