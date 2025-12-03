
const prisma = require("../config/prisma");
const catchAsync = require("../utils/catchAsync");
const { successResponse, errorResponse, validationErrorResponse } = require("../utils/ErrorHandling");
const Logger = require("../utils/Logger");

const parseJSON = (data) => {
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
};

// inject uploaded file paths inside JSON fields
const applyImagesToJSON = (jsonData, uploadedFiles, prefix) => {
  const arr = parseJSON(jsonData);

  if (!Array.isArray(arr)) return arr;

  return arr.map((item, index) => {
    for (let key in item) {
      const field = `${prefix}[${index}][${key}]`;
      if (uploadedFiles[field]) {
        item[key] = uploadedFiles[field];  // replace with uploaded file path
      }
    }
    return item;
  });
};


exports.allUniversities = catchAsync(async (req, res) => {
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = 9;

  const skip = (page - 1) * limit;

  // --- Fetch categories with courses ---
  const categories = await prisma.category.findMany({
    orderBy: { id: "asc" },
    include: {
      courses: { orderBy: { created_at: "asc" } }
    }
  });

  // If categories failed (rare but possible)
  if (!categories) {
    return errorResponse(res, "Failed to fetch categories", 500);
  }

  // --- Fetch universities ---
  const universities = await prisma.university.findMany({
    where: { deleted_at: null },
    orderBy: [
      { position: { sort: "asc", nulls: "last" } },
      { created_at: "desc" }
    ],
    skip,
    take: limit,
  });

  if (!universities) {
    return errorResponse(res, "Failed to fetch universities", 500);
  }

  // --- Count total ---
  const totalUniversities = await prisma.university.count({
    where: { deleted_at: null }
  });

  const totalPages = Math.ceil(totalUniversities / limit);

  return successResponse(res, "Universities fetched successfully", 201, {
    categories,
    universities,
    pagination: {
      page,
      limit,
      totalPages,
      totalUniversities,
    }
  });

});

// Admin University Listing
exports.adminUniversitylisting = catchAsync(async (req, res) => {
  const BASE_URL = process.env.BASE_URL;

  let universities = await prisma.university.findMany({
    where: { deleted_at: null },
    orderBy: [
      { position: "asc" },
      { created_at: "desc" }
    ]
  });

  universities = universities.map(item => ({
    ...item,
    icon: item.icon ? `${BASE_URL}/universities/icon/${item.icon}` : null,
    cover_image: item.cover_image ? `${BASE_URL}/universities/main/${item.cover_image}` : null
  }));

  return successResponse(res, "Admin all universities data fetched successfully", 200, {
    universities
  });
});

// Admin University 
exports.adminapprovalsplacements = catchAsync(async (req, res) => {
  const BASE_URL = process.env.BASE_URL;

  // --- Fetch Approvals ---
  let approvals = await prisma.approvals.findMany({
    where: { deleted_at: null },
    orderBy: { created_at: "desc" },
  });

  if (!approvals) {
    return errorResponse(res, "Failed to fetch approvals", 500);
  }

  // Convert image paths to full URLs
  approvals = approvals.map(item => ({
    ...item,
    image: item.image ? `${BASE_URL}/approval_images/${item.image}` : null
  }));

  // --- Fetch Placements ---
  let placements = await prisma.placements.findMany({
    where: { deleted_at: null },
    orderBy: { created_at: "desc" },
  });

  if (!placements) {
    return errorResponse(res, "Failed to fetch placements", 500);
  }

  placements = placements.map(item => ({
    ...item,
    image: item.image ? `${BASE_URL}/placement_partners/${item.image}` : null
  }));

  return successResponse(res, "Admin university data fetched successfully", 200, {
    approvals,
    placements,
  });
});

exports.addUniversity = async (req, res) => {
  try {
    console.log("req.body =>", req.body);
    Logger.info(req.body)

    let uploadedFiles = {};
    req.files?.forEach((file) => {
      uploadedFiles[file.fieldname] = file.path; // store as fieldname → path
    });
    Logger.info(uploadedFiles)

    console.log("Uploaded Files =>", uploadedFiles);

    // ---------- Replace images inside JSON sections ----------

    const services = applyImagesToJSON(req.body.services, uploadedFiles, "services");
    const advantages = applyImagesToJSON(req.body.advantages, uploadedFiles, "advantages");
    const patterns = applyImagesToJSON(req.body.patterns, uploadedFiles, "patterns");
    const campusList = applyImagesToJSON(req.body.campusList, uploadedFiles, "campusList");
    const fees = applyImagesToJSON(req.body.fees, uploadedFiles, "fees");
    const facts = applyImagesToJSON(req.body.facts, uploadedFiles, "facts");
    const onlines = applyImagesToJSON(req.body.onlines, uploadedFiles, "onlines");

    // Final JSON object
    const finalData = {
      ...req.body,
      services,
      advantages,
      patterns,
      campusList,
      fees,
      facts,
      onlines,
      icon: uploadedFiles["icon"] || null,
      cover_image: uploadedFiles["cover_image"] || null
    };


    return res.status(200).json({
      status: true,
      message: "University Saved Successfully!",
      data: finalData
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

