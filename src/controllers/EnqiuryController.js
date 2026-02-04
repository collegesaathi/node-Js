const {
  errorResponse,
  successResponse,
  validationErrorResponse,
} = require("../utils/ErrorHandling");
const prisma = require("../config/prisma");
const catchAsync = require("../utils/catchAsync");

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

const LSQ_ACCESS_KEY = "u$r286e34b975a130c5c265ade41e030d10";
const LSQ_SECRET_KEY = "a4f03869c860afeef6d2439f1ca209b30eec1881";

async function sendLeadToLSQ({
  name,
  email,
  phone_number,
  city,
  unv_nm,
  unv_co,
}) {
  try {
    const apiURL = `https://api-in21.leadsquared.com/v2/LeadManagement.svc/Lead.Capture?accessKey=${LSQ_ACCESS_KEY}&secretKey=${LSQ_SECRET_KEY}`;

    const payload = [
      { Attribute: "FirstName", Value: name || "NA" },
      { Attribute: "LastName", Value: "" },
      { Attribute: "EmailAddress", Value: email || "" },
      { Attribute: "Phone", Value: phone_number || "" },
      { Attribute: "mx_Specialization", Value: "" },
      { Attribute: "mx_Course_Applying_For", Value: unv_co || "" },
      { Attribute: "mx_City", Value: city || "" },
      { Attribute: "from_fb", Value: false },
      { Attribute: "Source", Value: "Website" },
      { Attribute: "mx_Opportunity_source", Value: "Opportunity source" },
      { Attribute: "SourceCampaign", Value: unv_nm || "" },
      { Attribute: "SourceMedium", Value: "Website" },
      { Attribute: "mx_University_Name", Value: (unv_nm || "").trim() },
      { Attribute: "SearchBy", Value: "Phone" },
    ];

    await axios.post(apiURL, payload, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 5000,
    });

    console.log("LSQ lead sent");
  } catch (error) {
    console.error("LSQ Error:", error.response?.data || error.message);
  }
}

async function getGeoFromIP(ip) {
  try {
    // 🚫 Skip localhost & private IPs
    if (!ip || ip === "::1" || ip === "127.0.0.1") {
      return {
        city: "Localhost",
        state: "Localhost",
      };
    }

    const url = `http://ip-api.com/json/${ip}?fields=status,city,regionName`;
    const { data } = await axios.get(url, { timeout: 3000 });

    if (data?.status === "success") {
      return {
        city: data.city || "Unknown City",
        state: data.regionName || "Unknown State",
      };
    }

    return {
      city: "Unknown City",
      state: "Unknown State",
    };
  } catch (error) {
    console.error("Geo IP lookup failed:", error.message);
    return {
      city: "Unknown City",
      state: "Unknown State",
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
      type,
    } = req.body;

    // ✅ Backend derived values
    const ip_address = getClientIP(req);
    const device_type = getDeviceType(req);

    console.log("IP:", ip_address);
    console.log("Device:", device_type);

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
      ip_address,
    };

    if (university_id) {
      data.university = { connect: { id: Number(university_id) } };
    }

    if (course_id) {
      data.course = { connect: { id: Number(course_id) } };
    }

    const record = await prisma.leads.create({ data });
    sendLeadToLSQ({
      name,
      email,
      phone_number,
      city,
      unv_nm: page_name, // or university name
      unv_co: content , // or course name
    });

    return successResponse(res, "Leads added successfully", 201, record);
  } catch (error) {
    console.error("Create Leads Error:", error);
    return errorResponse(res, error.message, 500);
  }
});

exports.LeadsGet = catchAsync(async (req, res) => {
  try {
    let leads = await prisma.leads.findMany({
      orderBy: { created_at: "asc" },
      include: {
        university: {
          select: { id: true, name: true, slug: true },
        },
        course: {
          select: { id: true, name: true, slug: true },
        },
      },
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

    return successResponse(res, "Universities fetched successfully", 200, {
      universities,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});
