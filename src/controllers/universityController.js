const prisma = require("../config/prisma");
const catchAsync = require("../utils/catchAsync");
const { successResponse, errorResponse, validationErrorResponse } = require("../utils/ErrorHandling");


  exports.allUniversities= catchAsync(async (req, res) => {
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

    return successResponse(res, "Universities fetched successfully", 200, {
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

