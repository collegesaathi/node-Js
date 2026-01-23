const { errorResponse, successResponse, validationErrorResponse } = require("../utils/ErrorHandling");
const prisma = require("../config/prisma");
const catchAsync = require("../utils/catchAsync");

const extractFinancialAidFlags = (description = "") => {
  if (!description) {
    return {
      hasScholarships: false,
      hasEmiOrLoan: false,
    };
  }

  // Remove HTML tags safely
  const plainText = description
    .replace(/<[^>]*>/g, " ")
    .toLowerCase();

  return {
    hasScholarships:
      plainText.includes("scholarship") ||
      plainText.includes("scholarships"),

    hasEmiOrLoan:
      plainText.includes("emi") ||
      plainText.includes("loan"),
  };
};

const calculateTotalCredits = (semesters = []) => {
  let total = 0;

  semesters.forEach(semester => {
    semester.subjects?.forEach(subject => {
      const credit = Number(subject.credit);
      if (!isNaN(credit)) {
        total += credit;
      }
    });
  });

  return total;
};


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
        university_id:  Number(university_id),
        deleted_at: null
      },
      include: {
        university: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon:true
          }
        }
      },
      orderBy: {
        position: 'asc'
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

exports.GetClickPickData = catchAsync(async (req, res) => {
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
        //  select: {
        //   id: true,
        //   title: true,
        //   bannerImage: true,
        //   slug: true
        // },
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
      const specialisations = await prisma.SpecialisationProgram.findMany({
        where: {
          program_id: Number(course_id),
          deleted_at: null
        },
        // select: {
        //   id: true,
        //   name: true,
        //   slug: true,
        //   icon: true,
        //   cover_image: true,
        //   position: true
        // },
       orderBy: { id: "asc" }
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


exports.compareData = catchAsync(async (req, res) => {
  try {
    const { universities_id, course_name, specialisation_name } = req.query;

    // ✅ base validation (specialisation is OPTIONAL now)
    if (!universities_id || !course_name) {
      return errorResponse(res, "Missing required query parameters", 400);
    }

    const universityIds = universities_id.split(',').map(id => Number(id));

    /* ======================================================
       🔁 CASE 1 : UNIVERSITY + COURSE (NO SPECIALISATION)
       ⚠️ Logic to fetch data without specialisation filtering
    ====================================================== */
    if (!specialisation_name) {
      const courses = await prisma.course.findMany({
        where: {
          university_id: { in: universityIds },
          name: {
            contains: course_name,
            mode: 'insensitive',
          },
          deleted_at: null,
        },
        include: {
          university: {
            select: {
              id: true,
              name: true,
              slug: true,
              icon: true,
              cover_image: true,
              rank: true,
            },
          },
          approvals: true,
          fees: true,
          financialAid: true,
          partners: true,
          eligibilitycriteria: true,
          curriculum: true,
        },
        
      });
      /* ================= COURSE APPROVAL IDS ================= */
      const approvalIdsSet = new Set();

      courses.forEach(course => {
        course.approvals?.approval_ids?.forEach(id =>
          approvalIdsSet.add(id)
        );
      });

      const approvals = approvalIdsSet.size ? await prisma.approvals.findMany({
            where: {
              id: { in: [...approvalIdsSet] },
              deleted_at: null,
            },
            select: {
              id: true,
              title: true,
              image: true,
            },
          }) : [];

      const approvalMap = approvals.reduce((acc, a) => {
        acc[a.id] = a;
        return acc;
      }, {});
      
      const formattedData = courses.map(course => {
        const resolvedApprovals =
          course.approvals?.approval_ids
            ?.map(id => approvalMap[id])
            .filter(Boolean) || [];

        return {
          university_id: course.university?.id,
          university_data: course.university || null,

          course: {
            course_data: {
              id: course.id,
              name: course.name,
              slug: course.slug,
              mode_of_education: course.mode_of_education,
              time_frame: course.time_frame,
            },

            approvals: {
              approval_list: resolvedApprovals,
            },

            fees: course.fees
              ? {
                  semester_wise_fees: course.fees.semester_wise_fees,
                  tuition_fees: course.fees.tuition_fees,
                }
              : null,

            financialAid: course.financialAid
              ? extractFinancialAidFlags(course.financialAid.description)
              : null,

            partners: course.partners
              ? {
                  placement_partners:
                    Array.isArray(course.partners.placement_partner_id) &&
                    course.partners.placement_partner_id.length > 0,
                  // placement_ids: course.partners.placement_partner_id || [],
                }
              : null,

            eligibilitycriteria: course.eligibilitycriteria
              ? {
                  description: course.eligibilitycriteria.description,
                  IndianCriteria: course.eligibilitycriteria.IndianCriteria,
                  NRICriteria: course.eligibilitycriteria.NRICriteria,
                  notes: course.eligibilitycriteria.notes,
                }
              : null,

            curriculum: course.curriculum
              ? {
                  semesters: course.curriculum.semesters,
                  total_credits: calculateTotalCredits(course.curriculum.semesters),
                }
              : null,
          },
        };
      });


      return successResponse(
        res,
        "Course compare data fetched successfully",
        200,
        formattedData
      );
    }

    /* =========================================================   
      🔁 CASE 2 : UNIVERSITY + COURSE + SPECIALISATION
      ✅ Logic to fetch the data with specialisation filtering
    ============================================================ */

    // 1️⃣ Fetch base data
    const universities = await prisma.university.findMany({
      where: {
        id: { in: universityIds },
        deleted_at: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        cover_image: true,
        rank: true,
        courses: {
          where: {
            name: {
              contains: course_name,
              mode: 'insensitive',
            },
            deleted_at: null,
          },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            specialisation: {
              where: {
                name: {
                  contains: specialisation_name,
                  mode: 'insensitive',
                },
                deleted_at: null,
              },
              include: {
                approvals: true,
                fees: true,
                financialAid: true,
                partners: true,
                eligibilitycriteria: true,
                curriculum: true,
              },
            },
          },
        },
      },
    });

    /* ================= APPROVAL IDS ================= */

    const approvalIdsSet = new Set();

    universities.forEach(u => {
      u.courses?.forEach(c => {
        c.specialisation?.forEach(sp => {
          sp.approvals?.approval_ids?.forEach(id => approvalIdsSet.add(id));
        });
      });
    });

    const approvals = approvalIdsSet.size
      ? await prisma.approvals.findMany({
          where: {
            id: { in: [...approvalIdsSet] },
            deleted_at: null,
          },
          select: { id: true, title: true, image: true },
        })
      : [];

    const approvalMap = approvals.reduce((acc, a) => {
      acc[a.id] = a;
      return acc;
    }, {});

    /* ================= PLACEMENT IDS ================= */

    const placementIdsSet = new Set();

    universities.forEach(u => {
      u.courses?.forEach(c => {
        c.specialisation?.forEach(sp => {
          sp.partners?.placement_partner_id?.forEach(id =>
            placementIdsSet.add(id)
          );
        });
      });
    });

    const placements = placementIdsSet.size
      ? await prisma.placements.findMany({
          where: {
            id: { in: [...placementIdsSet] },
            deleted_at: null,
          },
          select: { id: true, title: true, image: true },
        })
      : [];

    const placementMap = placements.reduce((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {});

    /* ================= FINAL RESPONSE ================= */

    const formattedData = universities.map(university => {
      const course = university.courses[0];
      const sp = course?.specialisation?.[0] || null;

      const resolvedApprovals =
        sp?.approvals?.approval_ids
          ?.map(id => approvalMap[id])
          .filter(Boolean) || [];

      const resolvedPlacements =
        sp?.partners?.placement_partner_id
          ?.map(id => placementMap[id])
          .filter(Boolean) || [];

      return {
        university_id: university.id,
        university_data: {
          name: university.name,
          slug: university.slug,
          icon: university.icon,
          cover_image: university.cover_image,
          rank: university.rank,
        },
        course: course
          ? {
              course_data: {
                id: course.id,
                name: course.name,
                slug: course.slug,
              },
              specialisation: sp
                ? {
                    id: sp.id,
                    name: sp.name,
                    slug: sp.slug,
                    description: sp.description,
                    mode_of_education: sp.mode_of_education,
                    time_frame: sp.time_frame,

                    approvals: {
                      approval_list: resolvedApprovals,
                    },

                    fees: sp.fees
                      ? {
                          semester_wise_fees: sp.fees.semester_wise_fees,
                          tuition_fees: sp.fees.tuition_fees,
                        }
                      : null,

                    financialAid: sp.financialAid
                      ? extractFinancialAidFlags(
                          sp.financialAid.description
                        )
                      : null,

                    partners: {
                      placement_partners: resolvedPlacements.length > 0,
                      placement_list: resolvedPlacements,
                    },

                    eligibilitycriteria: sp.eligibilitycriteria
                      ? {
                          description:
                            sp.eligibilitycriteria.description,
                          IndianCriteria:
                            sp.eligibilitycriteria.IndianCriteria,
                          NRICriteria:
                            sp.eligibilitycriteria.NRICriteria,
                          notes: sp.eligibilitycriteria.notes,
                        }
                      : null,

                    curriculum: sp.curriculum
                      ? {
                          semesters: sp.curriculum.semesters,
                          total_credits:
                            calculateTotalCredits(
                              sp.curriculum.semesters
                            ),
                        }
                      : null,
                  }
                : null,
            }
          : null,
      };
    });

    return successResponse(
      res,
      "Compare data fetched successfully",
      200,
      formattedData
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});




