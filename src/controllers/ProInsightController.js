const { errorResponse, successResponse, validationErrorResponse } = require("../utils/ErrorHandling");
const prisma = require("../config/prisma");
const catchAsync = require("../utils/catchAsync");


exports.GetproinsightList = catchAsync(async (req, res) => {
  try {
    const { category_id, course_id } = req.query;

    /**
     * 1️⃣ NO PARAMS → FETCH ALL CATEGORIES
     */
    if (!category_id && !course_id) {
      const categories = await prisma.category.findMany({
        where: {
          deleted_at: null
        },
        select: {
          id: true,
          name: true,
          short_title: true,
          icon: true
        },
        orderBy: {
          id: "asc"
        }
      });

      return successResponse(
        res,
        "Categories fetched successfully",
        200,
        categories
      );
    }

    if (category_id) {
      const courses = await prisma.Program.findMany({
        where: {
          category_id: Number(category_id),
          deleted_at: null
        },
         select: {
          id: true,
          title: true,
          bannerImage: true,
          slug: true
        },
      });

      if (!courses.length) {
        return errorResponse(
          res,
          "No courses found for this category",
          404
        );
      }

      return successResponse(
        res,
        "Programs fetched successfully",
        200,
        courses
      );
    }

    if (course_id) {
      const specialisations = await prisma.ProgramSpecialisation.findMany({
        where: {
          course_id: Number(course_id),
          deleted_at: null
        },
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
          cover_image: true,
          position: true
        },
        orderBy: {
          position: "asc"
        }
      });

      if (!specialisations.length) {
        return errorResponse(
          res,
          "No Program found for this course",
          404
        );
      }

      return successResponse(
        res,
        "Program Specialisations fetched successfully",
        200,
        specialisations
      );
    }


  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});
