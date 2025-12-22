const { errorResponse, successResponse, validationErrorResponse } = require("../utils/ErrorHandling");
const prisma = require("../config/prisma");
const catchAsync = require("../utils/catchAsync");

exports.University = catchAsync(async (req, res) => {
  try {
    const { search } = req.query;

    const universities = await prisma.university.findMany({
      where:
        search && search.length >= 3
          ? {
            name: {
              contains: search,
              mode: "insensitive",
            },
          }
          : {},
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



exports.List = catchAsync(async (req, res) => {
  try {
    const CategoryLists = await prisma.Category.findMany({});
    const universities = await prisma.university.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    return successResponse(
      res,
      "List fetched successfully",
      200,
      { CategoryLists, universities }
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});
