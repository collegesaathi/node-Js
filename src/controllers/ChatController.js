const { errorResponse, successResponse, validationErrorResponse } = require("../utils/ErrorHandling");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const prisma = require("../config/prisma");


function getDeviceType(req) {
  const ua = req.headers["user-agent"] || "";

  if (/tablet|ipad/i.test(ua)) return "Tablet";
  if (/mobile|android|iphone/i.test(ua)) return "Mobile";
  return "Desktop";
}


function getClientIP(req) {
  let ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    req.ip ||
    null;
  // Convert IPv6 to IPv4 (::ffff:127.0.0.1)
  if (ip?.includes("::ffff:")) {
    ip = ip.replace("::ffff:", "");
  }
  return ip;
}

const axios = require("axios");

async function getGeoFromIP(ip) {
  try {
    // 🚫 Skip localhost & private IPs
    if (!ip || ip === "::1" || ip === "127.0.0.1") {
      return {
        city: "Jaipur",
        state: "Rajasthan"
      };
    }

    const url = `http://ip-api.com/json/${ip}?fields=status,city,regionName`;
    const { data } = await axios.get(url, { timeout: 3000 });

    if (data?.status === "success") {
      return {
        city: data.city || "Unknown City",
        state: data.regionName || "Unknown State"
      };
    }

    return {
      city: "Unknown City",
      state: "Unknown State"
    };
  } catch (error) {
    console.error("Geo IP lookup failed:", error.message);
    return {
      city: "Unknown City",
      state: "Unknown State"
    };
  }
}


exports.AddChat = catchAsync(async (req, res) => {
  try {
    // ✅ Derived values
    const ip_address = getClientIP(req);
    const device_type = getDeviceType(req);

    // ✅ Body values
    let {
      visitor_id,
      sender,
      message,
      country,
      state,
      city,
      page_url,
      job_id,
    } = req.body;

    // 🔒 Validation
    if (!visitor_id || !sender || !message) {
      return res.status(400).json({
        success: false,
        message: "visitor_id, sender and message are required",
      });
    }

    // 🌍 Geo lookup (only if city/state missing)
    if (!city || !state) {
      const geo = await getGeoFromIP(ip_address);
      city = city || geo.city;
      state = state || geo.state;
    }

    // 💾 Save chat
    const chat = await prisma.chat.create({
      data: {
        visitor_id,
        sender,
        message,
        country,
        state,
        city,
        page_url,
        job_id,
        ip_address,
        device_type,
        user_agent: req.headers["user-agent"] || null,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Chat added successfully",
      data: chat,
    });
  } catch (error) {
    console.error("Add Chat Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});



exports.ChatGet = catchAsync(async (req, res) => {
  try {
    let chat = await prisma.chat.findMany({  });

    return successResponse(res, "Chat fetched successfully", 200, chat);

  } catch (error) {
    console.log("Leads Get Error:", error);
    return errorResponse(res, error.message, 500);
  }
});

exports.ChatUserGet = catchAsync(async (req, res) => {
  try {
    const chat = await prisma.chat.findMany({
      where: {
        sender: "user",
        deleted_at: null,
      },
      orderBy: {
        created_at: "desc", // latest message first
      },
      distinct: ["visitor_id"], // 👈 same visitor_id repeat nahi hoga
      
    });

    return successResponse(
      res,
      "User chat list fetched successfully",
      200,
      chat
    );
  } catch (error) {
    console.log("ChatUserGet Error:", error);
    return errorResponse(res, error.message, 500);
  }
});



exports.ChatVisitorGet = catchAsync(async (req, res) => {
  try {
    const { visitor_id } = req.params;

    if (!visitor_id) {
      return errorResponse(res, "visitor_id is required", 400);
    }

    const chat = await prisma.chat.findMany({
      where: {
        visitor_id: visitor_id,
        deleted_at: null, // soft delete safe
      },
      orderBy: {
        created_at: "asc", // chat sequence
      },
    });

    return successResponse(
      res,
      "Chat fetched successfully",
      200,
      chat
    );
  } catch (error) {
    console.log("Chat Get Error:", error);
    return errorResponse(res, error.message, 500);
  }
});
