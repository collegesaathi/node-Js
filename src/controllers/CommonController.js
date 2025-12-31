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
            deleted_at: null
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


exports.CompareUniversity = catchAsync(async (req, res) => {
  try {
    const { firstslug, secondslug, thirdslug } = req.params;

    const [UniversityFirst, UniversitySecond, UniversityThird] =
      await Promise.all([
        prisma.university.findUnique({
          where: { slug: firstslug },
          include: {
            approvals: true,

          },
        }),
        prisma.university.findUnique({
          where: { slug: secondslug },
          include: {
            approvals: true,
          },
        }),
        prisma.university.findUnique({
          where: { slug: thirdslug },
          include: {
            approvals: true,
          },
        }),
      ]);

    return successResponse(
      res,
      "Compare University List fetched successfully",
      200,
      { UniversityFirst, UniversitySecond, UniversityThird }
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});



exports.AllProgram = catchAsync(async (req, res) => {
  try {
    const course = req.query.course
    const specialisation = req.query.specialisation
    const universities = req.query.universities

    const CategoryLists = await prisma.Category.findMany({});
    const CourseData = await prisma.course.findMany({
      where: {
        category_id: Number(course)
      },
      select: {
        id: true,
        name: true,
        icon: true,
      }
    });
    const SpecialisationData = await prisma.Specialisation.findMany({
      where: {
        course_id: Number(specialisation)
      },
      select: {
        id: true,
        name: true,
        icon: true,
        university_id: true
      }
    });

    const UniversityData = await prisma.university.findFirst({
      where: {
        id: Number(universities)
      },
      select: {
        id: true,
        name: true,
        icon: true,
      }
    });
    return successResponse(
      res,
      "List fetched successfully",
      200,
      { CategoryLists, CourseData, SpecialisationData, UniversityData }
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

exports.PopUniversityApi = catchAsync(async (req, res) => {
  try {
    const slug = req.params.slug
    const Universities = await prisma.university.findUnique({
      where: { slug },
      include: {
        approvals: {
          select: {
            approval_ids: true
          }
        },
        universityCampuses: true
      }
    });


    const toArray = (val) => {
      if (!val && val !== 0) return [];
      return Array.isArray(val) ? val : [val];
    };

    // ----------- Extract approval IDs (defensively) -----------
    let approvalIds = [];

    const approvalsRaw = Universities.approvals;
    if (approvalsRaw) {
      const approvalsArr = toArray(approvalsRaw);
      approvalIds = approvalsArr.flatMap((a) => {
        if (!a) return [];
        if (Array.isArray(a.approval_ids)) return a.approval_ids;
        if (a.approval_ids) return [a.approval_ids];
        if (Array.isArray(a.approval_id)) return a.approval_id;
        if (a.approval_id) return [a.approval_id];
        if (a.id) return [a.id];
        return [];
      });
      approvalIds = Array.from(new Set(approvalIds)).filter(
        (v) => v !== null && v !== undefined
      );
    }

    let approvalsData = [];
    if (approvalIds.length > 0) {
      approvalsData = await prisma.Approvals.findMany({
        where: { id: { in: approvalIds } },
      });
    }
    const Id = Universities.id;
    const coursedata = await prisma.course.findMany({
      where: {
        university_id: Number(Id)
      },
      select: {
        name: true,
        icon: true
      }
    });


    console.log("coursedata", coursedata)
    return successResponse(
      res,
      "Popular University fetched successfully",
      200,
      {
        Universities,
        approvalsData,
        coursedata
      }
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});


exports.GetUniversityCategroyList = catchAsync(async (req, res) => {
  const { id } = req.params;
  console.log("id" ,id)
  if (!id) {
    return errorResponse(res, "University id is required", 400);
  }

  const UniversityData = await prisma.University.findUnique({
    where: {
      id: Number(id), // ✅ primary key
    },
  });

  if (!UniversityData) {
    return validationErrorResponse(res, "University not found", 404);
  }

  const CategoryLists = await prisma.Category.findMany();

  return successResponse(res, "Category list fetched successfully", 200, {
    CategoryLists,
    UniversityData,
  });
});



exports.GetCategroyList = catchAsync(async (req, res) => {
  try {
    const CategoryLists = await prisma.Category.findMany({});
    return successResponse(res, "Course list successfully", 200, CategoryLists);
  } catch (error) {
    if (error.code === 'P2025') {
      return errorResponse(res, "Course not found", 404);
    }
    return errorResponse(res, error.message, 500);
  }
})