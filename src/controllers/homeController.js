const { errorResponse, successResponse, validationErrorResponse } = require("../utils/ErrorHandling");
const catchAsync = require("../utils/catchAsync");
const prisma = require("../config/prisma");

exports.home = catchAsync(async (req, res) => {
  try {

    // ✅ CATEGORY WITH COURSES
    const categories = await prisma.category.findMany({
      orderBy: { id: "asc" },
      include: {
        courses: {
          orderBy: { created_at: "asc" },
        }
      }
    });

    // ✅ UNIVERSITY LIST
    const universities = await prisma.university.findMany({
      where: {
        deleted_at: null
      },
      orderBy: [
        { position: "asc" },     
        { created_at: "desc" }
      ]
    });

    const blogs = await prisma.blog.findMany({
      where: {
        deleted_at: null
      },
      orderBy: {
        created_at: "desc"
      },
      take: 15
    });

    return successResponse(res, "Home successfully", 201, {
      categories,
      universities,
      blogs
    });


  } catch (err) {
    console.log("ERROR:", err)
    return errorResponse(err, "Something went wrong", 400);
  }
});

