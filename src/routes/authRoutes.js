const express = require("express");
const router = express.Router();
const { register, login, logout, getUser } = require("../controllers/authController");
const { verifyToken } = require("../utils/tokenVerify");

router.post("/register", register);
router.post("/login", login);
// router.post("/logout", auth, logout);

router.get("/user" ,  verifyToken ,  getUser)

module.exports = router;
