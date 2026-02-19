const { errorResponse, successResponse, validationErrorResponse } = require("../utils/ErrorHandling");
const prisma = require("../config/prisma");
const catchAsync = require("../utils/catchAsync");
const Logger = require("../utils/Logger");
const deleteUploadedFiles = require("../utils/fileDeleter");
const Loggers = require("../utils/Logger");
const axios = require("axios");
const otpCache = require("../utils/otpCache");
exports.sendOtp = catchAsync(async (req, res) => {
  try {
    const { mobile } = req.body;
    // ✅ Step 1: Validate mobile number
    if (!mobile) {
      return errorResponse(res, "Mobile number is required", 400);
    }
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return errorResponse(res, "Invalid mobile number. Enter a valid 10-digit number", 400);
    }
    // ✅ Step 2: Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    console.log("otp" ,otp)

    // ✅ Step 3: Send OTP via MSG91 (PHP cURL equivalent)
    await axios.post(
      "https://control.msg91.com/api/v5/otp",
      {
        OTP: otp
      },
      {
        params: {
          template_id: process.env.MSG91_TEMPLATE_ID,
          mobile: `91${mobile}`
        },
        headers: {
          authkey: process.env.MSG91_AUTH_KEY,
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        timeout: 30000
      }
    );

    // ✅ Step 4: Store OTP in cache (5 min expiry)
    otpCache.set(mobile, {
      otp: otp.toString(),
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    });

    // ✅ Step 5: Auto-remove OTP after expiry
    setTimeout(() => {
      otpCache.delete(mobile);
    }, 5 * 60 * 1000);

    // 🚧 TEMP: log OTP (remove in production)

    return successResponse(res, "OTP sent successfully", 200);
  } catch (err) {
    console.log("ERROR:", err);
    return errorResponse(res, "Something went wrong", 400);
  }
});


exports.verifyOtp = catchAsync(async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    // ✅ Step 1: Validate inputs
    if (!mobile || !otp) {
      return errorResponse(res, "Mobile number and OTP are required", 400);
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return errorResponse(res, "Invalid mobile number", 400);
    }

    if (!/^\d{4}$/.test(otp)) {
      return errorResponse(res, "Invalid OTP format", 400);
    }

    // ✅ Step 2: Check OTP exists in cache
    const cachedData = otpCache.get(mobile);

    if (!cachedData) {
      return errorResponse(res, "OTP expired or not found", 400);
    }

    // ✅ Step 3: Check expiry (extra safety)
    if (Date.now() > cachedData.expiresAt) {
      otpCache.delete(mobile);
      return errorResponse(res, "OTP has expired", 400);
    }

    // ✅ Step 4: Match OTP
    if (cachedData.otp !== otp.toString()) {
      return errorResponse(res, "Invalid OTP", 400);
    }

    // ✅ Step 5: OTP verified – remove from cache
    otpCache.delete(mobile);

    return successResponse(res, "OTP verified successfully", 200);
  } catch (err) {
    console.log("VERIFY OTP ERROR:", err);
    return errorResponse(res, "OTP verification failed", 400);
  }
});
