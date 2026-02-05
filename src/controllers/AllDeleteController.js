const prisma = require("../config/prisma");
const catchAsync = require("../utils/catchAsync");
const { successResponse, errorResponse, validationErrorResponse } = require("../utils/ErrorHandling");



exports.DeleteCourseBySlug = catchAsync(async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return errorResponse(res, "Course slug is required", 400);
    }

    const course = await prisma.Course.findFirst({
      where: { slug },
    });

    if (!course) {
      return errorResponse(res, "Course not found", 404);
    }

    await prisma.Course.delete({
      where: {
        id: course.id,
      },
    });

    return successResponse(
      res,
      "Course permanently deleted successfully",
      200
    );
  } catch (error) {
    console.error("DeleteCourseBySlug error:", error);
    return errorResponse(
      res,
      error.message || "Error deleting course",
      500,
      error
    );
  }
});

exports.DeleteUniversityBySlug = catchAsync(async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return errorResponse(res, "University slug is required", 400);
    }

    // Find university
    const university = await prisma.University.findFirst({
      where: { slug },
    });

    if (!university) {
      return errorResponse(res, "University not found", 404);
    }

    // 🔥 PERMANENT DELETE
    await prisma.University.delete({
      where: {
        id: university.id,
      },
    });

    return successResponse(
      res,
      "University permanently deleted successfully",
      200
    );
  } catch (error) {
    console.error("DeleteUniversityBySlug error:", error);
    return errorResponse(
      res,
      error.message || "Error deleting university",
      500,
      error
    );
  }
});