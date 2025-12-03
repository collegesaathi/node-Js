
const prisma = require("../config/prisma");
const catchAsync = require("../utils/catchAsync");
const { successResponse, errorResponse, validationErrorResponse } = require("../utils/ErrorHandling");
const Logger = require("../utils/Logger");

exports.allUniversities = catchAsync(async (req, res) => {
  // Pagination
  const page = parseInt(req.query.page);
  const limit = 9;

  // If page is invalid (NaN, negative, or zero)
  if (!page || page < 1) {
    return validationErrorResponse(res, "Page number must be 1 or greater", 400);
  }

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
exports.adminUniversity = catchAsync(async (req, res) => {
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

    Logger.info("Received University Add Payload:");
    Logger.info(JSON.stringify(req.body, null, 2));

    console.log("req.body =>", req.body);

    if (req.files) {
      Logger.info("Received Files:");
      Logger.info(JSON.stringify(req.files, null, 2));
      console.log("req.files =>", req.files);
    }

    return res.status(200).json({
      status: true,
      message: "University data received successfully!",
      receivedData: req.body,
    });

  } catch (error) {

    Logger.error("Error in addUniversity:", error);
    console.error(error);

    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};
