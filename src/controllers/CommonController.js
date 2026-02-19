const { errorResponse, successResponse, validationErrorResponse } = require("../utils/ErrorHandling");
const prisma = require("../config/prisma");
const catchAsync = require("../utils/catchAsync");
const { log } = require("winston");

exports.GlobalSearch = catchAsync(async (req, res) => {
  try {
    const { search } = req.query;

    if (!search || search.length < 1) {
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
    const CategoryLists = await prisma.Category.findMany({
      orderBy: {
        id: 'asc', // 🔥 ID ascending order
      },
    });

    return successResponse(res, "Course list successfully", 200, CategoryLists);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});


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
      { approvalsData, placementPartners }
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


exports.GetSchollarshipList = catchAsync(async (req, res) => {
  try {
    const universities = await prisma.university.findMany({
      where: {
        deleted_at: null,
        financialAid: {
          is: {
            OR: [
              {
                description: {
                  contains: "Scholarship",
                  mode: "insensitive",
                },
              },
              {
                description: {
                  contains: "Scholarships",
                  mode: "insensitive",
                },
              },
            ],
          },
        },
      },
      select: {
        id: true,
        slug: true,
        name: true,
        icon: true,
        cover_image: true,
        rank: true,
      },
      orderBy: {
        position: "asc",
      },
    });

    return successResponse(
      res,
      "Scholarship universities fetched successfully",
      200,
      universities
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

exports.GetPlacementList = catchAsync(async (req, res) => {
  try {
    const placements = await prisma.Placements.findMany({
      where: {
        deleted_at: null,
      },
      select: {
        // id: true,
        image: true,
      },
      orderBy: {
        id: "asc",
      },
    });
    return successResponse(
      res,
      "Placement universities fetched successfully",
      200,
      placements
    );
  }
  catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

exports.GetSimilarUniversityList = catchAsync(async (req, res) => {
  try {
    const { program_slug, program_specialisation_slug } = req.query;

    if (!program_slug && !program_specialisation_slug) {
      return errorResponse(
        res,
        "Either program_slug or program_specialisation_slug is required",
        400
      );
    }

    let universityIds = [];

    /* -------------------------------------------------
       CASE 1: PROGRAM SLUG
    --------------------------------------------------*/
    if (program_slug) {
      const program = await prisma.program.findFirst({
        where: {
          slug: program_slug,
          deleted_at: null,
        },
        select: {
          university_id: true,
        },
      });

      if (!program) {
        return errorResponse(res, "Program not found", 404);
      }

      universityIds = program.university_id || [];
    }

    /* -------------------------------------------------
       CASE 2: SPECIALISATION PROGRAM SLUG
    --------------------------------------------------*/
    if (program_specialisation_slug) {
      const specialisation = await prisma.specialisationProgram.findFirst({
        where: {
          slug: program_specialisation_slug,
          deleted_at: null,
        },
        select: {
          university_id: true,
        },
      });

      if (!specialisation) {
        return errorResponse(res, "Specialisation program not found", 404);
      }

      universityIds = specialisation.university_id || [];
    }

    /* -------------------------------------------------
       VALIDATE UNIVERSITY IDS
    --------------------------------------------------*/
    if (!Array.isArray(universityIds) || universityIds.length === 0) {
      return successResponse(res, "No universities found", 200, []);
    }

    /* -------------------------------------------------
       FETCH UNIVERSITIES
    --------------------------------------------------*/
    const universities = await prisma.university.findMany({
      where: {
        id: {
          in: universityIds.map(Number),
        },
        deleted_at: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        cover_image: true,
        icon_alt: true,
        cover_image_alt: true,
      },
      orderBy: {
        position: "asc",
      },
    });

    return successResponse(res, "Similar universities fetched successfully", 200, universities);

  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

exports.GetOtherSpecialisations = catchAsync(async (req, res) => {
  try {
    const { program_slug, program_specialisation_slug } = req.query;

    // ------------------ VALIDATION ------------------
    if (!program_slug || !program_specialisation_slug) {
      return errorResponse(
        res,
        "program_slug & program_specialisation_slug is required",
        400
      );
    }

    // ------------------ FETCH PROGRAM ------------------
    const program = await prisma.program.findFirst({
      where: {
        slug: program_slug,
        deleted_at: null,
      },
      select: {
        id: true,
      },
    });

    if (!program) {
      return errorResponse(res, "Program not found", 404);
    }

    // ------------------ FETCH OTHER SPECIALISATIONS ------------------
    const otherSpecialisations = await prisma.specialisationProgram.findMany({
      where: {
        program_id: program.id,
        slug: {
          not: program_specialisation_slug, // ✅ skip current specialisation
        },
        deleted_at: null,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        icon: true,
        bannerImage: true,
        bannerImageAlt: true,
        shortDescription: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // ------------------ RESPONSE ------------------
    if (otherSpecialisations.length === 0) {
      return successResponse(
        res,
        "No other specialisations found",
        200,
        []
      );
    }

    return successResponse(
      res,
      "Other specialisations fetched successfully",
      200,
      otherSpecialisations
    );

  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});


exports.GetAllSpecialisations = catchAsync(async (req, res) => {
  try {
    const { program_slug } = req.query;

    // ------------------ VALIDATION ------------------
    if (!program_slug) {
      return errorResponse(res, "program_slug is required", 400);
    }

    // ------------------ FETCH PROGRAM ------------------
    const program = await prisma.program.findFirst({
      where: {
        slug: program_slug,
        deleted_at: null,
      },
      select: {
        id: true,
      },
    });

    if (!program) {
      return errorResponse(res, "Program not found", 404);
    }

    // ------------------ FETCH ALL SPECIALISATIONS ------------------
    const specialisations = await prisma.specialisationProgram.findMany({
      where: {
        program_id: program.id,
        deleted_at: null,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        icon: true,
        bannerImage: true,
        bannerImageAlt: true,
        shortDescription: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // ------------------ RESPONSE ------------------
    if (specialisations.length === 0) {
      return successResponse(res, "No specialisations found", 200, []);
    }

    return successResponse(
      res,
      "All specialisations fetched successfully",
      200,
      specialisations
    );

  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});



exports.GetPopupUniversityData = catchAsync(async (req, res) => {
  try {
    const { university_slug } = req.query;

    if (!university_slug) {
      return errorResponse(res, "university_slug is required", 400);
    }

    // 1️⃣ Fetch University with relations
    const university = await prisma.university.findFirst({
      where: {
        slug: university_slug,
        deleted_at: null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        rank: true,
        icon: true,

        // Courses
        courses: {
          where: {
            deleted_at: null,
          },
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            time_frame: true,
          },
        },

        // Campus
        universityCampuses: {
          select: {
            campus: true,
            campusInternationList: true,
          },
        },

        // Approvals Management
        approvals: {
          select: {
            title: true,
            description: true,
            approval_ids: true,
          },
        },
      },
    });

    if (!university) {
      return errorResponse(res, "University not found", 404);
    }

    // 2️⃣ Fetch approvals data using approval_ids
    let approvalsData = [];
    if (
      university.approvals &&
      Array.isArray(university.approvals.approval_ids) &&
      university.approvals.approval_ids.length > 0
    ) {
      approvalsData = await prisma.approvals.findMany({
        where: {
          id: {
            in: university.approvals.approval_ids,
          },
        },
        select: {
          id: true,
          title: true,
          image: true,
        },
      });
    }



const allowedCourseTypes = [
  "MCA",
  "MBA",
  "BBA",
  "BCA",
  "MAMJSL",
  "B.Com",
  "M.Com",
  "PGDM",
  "PGCM",
  "BA",
  "MA",
];

// Filter courses: match exact course type at end of course name
const filteredCourses = (university.courses || []).filter((c) => {
  const parts = c.name.split(" ");           // split by space
  const lastWord = parts[parts.length - 1]; // get last word
  return allowedCourseTypes.includes(lastWord);
});

// Sort courses according to allowedCourseTypes order
const sortedCourses = filteredCourses.sort(
  (a, b) =>
    allowedCourseTypes.indexOf(a.name.split(" ").pop()) -
    allowedCourseTypes.indexOf(b.name.split(" ").pop())
);



    // 5️⃣ Final response
    return successResponse(res, "Popup university data fetched", 200, {
      name: university.name,
      description: university.description,
      rank: university.rank,
      icons: university.icon,

      approvals: {
        title: university.approvals?.title || null,
        description: university.approvals?.description || null,
        items: approvalsData,
      },

      courses: sortedCourses, // ✅ now only allowed courses appear
      campuses: university.universityCampuses,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});





exports.GetReviews = catchAsync(async (req, res) => {
  try {
    const { university_slug } = req.params;
    if (!university_slug) {
      return errorResponse(res, "university_slug is required", 400);
    }

    // 1️⃣ Find university by slug
    const university = await prisma.university.findFirst({
      where: {
        slug: university_slug,
        deleted_at: null, // optional (recommended)
      },
      select: {
        id: true,
      },
    });


    if (!university) {
      return errorResponse(res, "University not found", 404);
    }
    // 2️⃣ Fetch reviews by university_id
    const reviews = await prisma.review.findMany({
      where: {
        university_id: university.id,
        // is_approved: 1, // optional: only approved reviews
      },
      orderBy: {
        created_at: "asc",
      },
    });

    if (!reviews || reviews.length === 0) {
      return errorResponse(res, "No reviews found for this university", 404);
    }

    return successResponse(
      res,
      "Reviews fetched successfully",
      200,
      reviews,
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});



exports.GetCategoryWithPrograms = catchAsync(async (req, res) => {
  try {

    const categories = await prisma.category.findMany({
      orderBy: {
        id: "asc",
      },
      include: {
        programs: {
          orderBy: {
            id: "asc",
          },
        },
      },
    });

    if (!categories || categories.length === 0) {
      return errorResponse(res, "No categories found", 404);
    }

    return successResponse(
      res,
      "Categories with programs fetched successfully",
      200,
      categories
    );

  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

