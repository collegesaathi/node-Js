const { errorResponse, successResponse, validationErrorResponse } = require("../utils/ErrorHandling");
const prisma = require("../config/prisma");
const catchAsync = require("../utils/catchAsync");


function getDeviceType(req) {
  const ua = req.headers["user-agent"] || "";

  if (/mobile/i.test(ua)) return "Mobile";
  if (/tablet/i.test(ua)) return "Tablet";
  return "Desktop";
}

function getClientIP(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress ||
    null
  );
}

const axios = require("axios");
async function getGeoFromIP(ip) {
  try {
    const url = `http://ip-api.com/json/${ip}`;
    const response = await axios.get(url, { timeout: 3000 });

    if (response.data?.status === "success") {
      return {
        city: response.data.city || "Unknown City",
        state: response.data.regionName || "Unknown State"
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


exports.LeadsAdd = catchAsync(async (req, res) => {
  try {
    let {
      name,
      email,
      phone_number,
      course_id,
      state,
      city,
      content,
      university_id,
      page_name,
      proInsights,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      type
    } = req.body;

    // ✅ Derive these from backend
    const ip_address = getClientIP(req);
    const device_type = getDeviceType(req);

    // 🔁 Fallback: fetch city/state from IP if missing
    if (!city || !state) {
      const geo = await getGeoFromIP(ip_address);
      city = city || geo.city;
      state = state || geo.state;
    }

    const data = {
      name,
      email,
      phone_number,
      state,
      city,
      content,
      page_name,
      proInsights,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      type,
      device_type,
      ip_address
    };

    if (university_id) {
      data.university = { connect: { id: Number(university_id) } };
    }

    if (course_id) {
      data.course = { connect: { id: Number(course_id) } };
    }

    const record = await prisma.leads.create({ data });

    return successResponse(res, "Leads added successfully", 201, record);
  } catch (error) {
    console.log("Create Leads Error:", error);
    return errorResponse(res, error.message, 500);
  }
});



exports.LeadsGet = catchAsync(async (req, res) => {
  try {
    let leads = await prisma.leads.findMany({
      orderBy: { created_at: "asc" },
      include: {
        university: {
          select: { id: true, name: true, slug: true }
        },
        course: {
          select: { id: true, name: true, slug: true }
        }
      }
    });

    return successResponse(res, "Leads fetched successfully", 200, leads);

  } catch (error) {
    console.log("Leads Get Error:", error);
    return errorResponse(res, error.message, 500);
  }
});

exports.AllLeadsUniversities = catchAsync(async (req, res) => {
try {
    const universities = await prisma.university.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  return successResponse(
    res,
    "Universities fetched successfully",
    200,
    { universities }
  );
} catch (error) {
    return errorResponse(res, error.message, 500);
}
});
