const { errorResponse, successResponse, validationErrorResponse } = require("../utils/ErrorHandling");
const prisma = require("../config/prisma");
const catchAsync = require("../utils/catchAsync");

exports.GetCoursesList = catchAsync(async (req, res) => {
  try {
    const { university_id } = req.params;

    // 1️⃣ Validate input
    if (!university_id) {
      return errorResponse(res, "University ID is required", 400);
    }

    // 2️⃣ Optional: check if university exists
    const university = await prisma.university.findUnique({
      where: { id: Number(university_id) },
      select: { id: true }
    });

    if (!university) {
      return errorResponse(res, "University not found", 404);
    }

    // 3️⃣ Fetch courses for that university
    const courses = await prisma.course.findMany({
      where: {
        university_id: Number(university_id),
        deleted_at: null
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: {
        position: "asc"
      }
    });

    // 4️⃣ No courses case (optional)
    if (!courses.length) {
      return errorResponse(res, "No courses found for this university", 404);
    }

    // 5️⃣ Success response
    return successResponse(res, "Courses fetched successfully", 200, courses);

  } catch (error) {
    if (error.code === "P2025") {
      return errorResponse(res, "Course not found", 404);
    }
    return errorResponse(res, error.message, 500);
  }
});

exports.GetUniversityList = catchAsync(async (req, res) => {
  try {
    const { category_id, course_name } = req.body;

    // 1️⃣ Validate input
    if (!category_id || !course_name) {
      return errorResponse(
        res,
        "category_id and course_name are required",
        400
      );
    }

    // 2️⃣ Fetch universities based on course + category
    const universities = await prisma.university.findMany({
      where: {
        deleted_at: null,
        courses: {
          some: {
            deleted_at: null,
            category_id: Number(category_id),
            name: {
              equals: course_name,
              mode: "insensitive" // ✅ case-insensitive match
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        cover_image: true,
        rank: true,
        position: true
      },
      orderBy: {
        position: "asc"
      }
    });

    // 3️⃣ No universities found
    if (!universities.length) {
      return errorResponse(
        res,
        "No universities found for the selected course and category",
        404
      );
    }

    // 4️⃣ Success
    return successResponse(
      res,
      "Universities fetched successfully",
      200,
      universities
    );

  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});
