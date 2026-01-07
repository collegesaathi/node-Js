const express = require("express");
const router = express.Router();
const dynamicUpload = require("../utils/dynamicUpload");
const { sendOtp, verifyOtp } = require("../controllers/OTPController");

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);


module.exports = router;