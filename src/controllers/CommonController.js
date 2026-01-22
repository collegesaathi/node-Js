const { errorResponse, successResponse, validationErrorResponse } = require("../utils/ErrorHandling");
const prisma = require("../config/prisma");
const catchAsync = require("../utils/catchAsync");

exports.GlobalSearch = catchAsync(async (req, res) => {
  try {
    const { search } = req.query;

    if (!search || search.length < 3) {
      return successResponse(res, "Search term too short", 500);
    }

    const contains = {
      contains: search,
      mode: "insensitive"
    };

    const [
      universities,
      courses,
      specialisations,
      programs,
      specialisationPrograms
    ] = await prisma.$transaction([
      prisma.university.findMany({
        where: {
          deleted_at: null,
          OR: [
            { name: contains },
            { slug: contains }
          ]
        },
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true
        }
      }),

      prisma.course.findMany({
        where: {
          deleted_at: null,
          OR: [
            { name: contains },
            { slug: contains }
          ]
        },
        include: {
          university: {
            select: { id: true, name: true, slug: true }
          }
        }
      }),

      prisma.specialisation.findMany({
        where: {
          deleted_at: null,
          OR: [
            { name: contains },
            { slug: contains }
          ]
        },
        include: {
          course: {
            select: { id: true, name: true, slug: true }
          },
          university: {
            select: { id: true, name: true, slug: true }
          }
        }
      }),

      prisma.program.findMany({
        where: {
          deleted_at: null,
          OR: [
            { title: contains },
            { slug: contains },
            { shortDescription: contains }
          ]
        }
      }),

      prisma.specialisationProgram.findMany({
        where: {
          deleted_at: null,
          OR: [
            { title: contains },
            { slug: contains },
            { shortDescription: contains }
          ]
        },
        include: {
          program: {
            select: { id: true, title: true, slug: true }
          }
        }
      })
    ]);

    return successResponse(res, "Search results", 200, {
      universities,
      courses,
      specialisations,
      programs,
      specialisationPrograms
    });
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

exports.UniversityList = catchAsync(async (req, res) => {
  try {
    const universities = await prisma.university.findMany({});
    return successResponse(
      res,
      "List fetched successfully",
      200,
      universities
     
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

exports.CompareUniversity = catchAsync(async (req, res) => {
  try {
    const { slug } = req.params;


    const slugs = slug.split("-vs-");


    const universities = await Promise.all(
      slugs.map((s) =>
        prisma.university.findUnique({
          where: { slug: s },
          include: {
            approvals: true,
            rankings: true,
            financialAid: true,
            examPatterns: true, 
          },
        })
      )
    );

    const validUniversities = universities.filter(u => u !== null);

    return successResponse(
      res,
      "Compare University List fetched successfully",
      200,
      { 
        universities: validUniversities, 
        count: validUniversities.length 
      }
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

exports.GetApprovalUniversity = catchAsync(async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      return errorResponse(res, "University slug is required", 400);
    }
    const university = await prisma.University.findFirst({
      where: {
        slug: slug,
        deleted_at: null,
      },
      include: {
        approvals: true,
        partners: true,
      },
    });

    if (!university) {
      return errorResponse(res, "University not found", 404);
    }

    const toArray = (val) => {
      if (!val && val !== 0) return [];
      return Array.isArray(val) ? val : [val];
    };

    // ----------- Extract partner IDs (defensively) -----------
    let placementPartnerIds = [];

    const partnersRaw = university.partners;
    if (partnersRaw) {
      const partnersArr = toArray(partnersRaw);
      placementPartnerIds = partnersArr.flatMap((p) => {
        if (!p) return [];
        if (Array.isArray(p.placement_partner_id)) return p.placement_partner_id;
        if (p.placement_partner_id) return [p.placement_partner_id];
        if (Array.isArray(p.partner_id)) return p.partner_id;
        if (p.partner_id) return [p.partner_id];
        if (p.id) return [p.id];
        return [];
      });
      placementPartnerIds = Array.from(new Set(placementPartnerIds)).filter(
        (v) => v !== null && v !== undefined
      );
    }

    let placementPartners = [];
    if (placementPartnerIds.length > 0) {
      placementPartners = await prisma.placements.findMany({
        where: { id: { in: placementPartnerIds } },
      });
    }

    // ----------- Extract approval IDs (defensively) -----------
    let approvalIds = [];

    const approvalsRaw = university.approvals;
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


    return successResponse(
      res,
      "University fetched successfully",
      200,
      {approvalsData, placementPartners }
    );
  } catch (error) {
    console.error("getUniversityById error:", error);
    return errorResponse(
      res,
      error.message || "Something went wrong while fetching university",
      500,
      error
    );
  }
});
