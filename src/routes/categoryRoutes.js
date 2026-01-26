const express = require("express");
const { List, addCategory, editCategory, updateCategory, deleteCategory, ListId, listcategroy } = require("../controllers/CategoryController");
const router = express.Router();
const dynamicUpload = require("../utils/dynamicUpload");

router.get("/all/catergoy/university", List);
router.post("/add/category", dynamicUpload("category").any() , addCategory);
router.get("/get/category/:id" , ListId)
router.put("/edit/category/:id", editCategory);
router.post("/update/category", dynamicUpload("category").any(), updateCategory);
router.delete("/delete/category/:id", deleteCategory);

router.get("/program/category/:id", listcategroy);


module.exports = router;