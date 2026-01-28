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

const cleanSlug = (v = "") =>
  v.toLowerCase().trim().replace(/-+/g, "-").replace(/^-|-$/g, "");

const safeParseArray = (data) => {
  try {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return JSON.parse(data);
  } catch (error) {
    console.warn("Failed to parse array:", data);
    return [];
  }
};






exports.AddClickPick = catchAsync(async (req, res) => {
  try {
    const {
      category_id,
      program_id,
      specialisation_program_id,
      title,
      description,
      graph_title,
      graph_value,
      rounded_graph_title,
      rounded_graph_desc,
      bottom_title,
      bottom_description,
      specialization_merged_title,
      specialization_merged_desc,
      specialization_merged_content,
      salary_graph_title,
      salary_graph_value,
      specialisation_graph_title,
      specialisation_graph_value,
    } = req.body;

 const data = {
  category_id: category_id ? Number(category_id) : undefined,
  program_id: program_id ? Number(program_id) : undefined,
  specialisation_program_id: specialisation_program_id
    ? Number(specialisation_program_id)
    : undefined,

  title: title || undefined,
  description: description || "",

  graph_title: graph_title || undefined,
  graph_value: graph_value ? safeParseArray(graph_value) : undefined,

  rounded_graph_title: rounded_graph_title || undefined,
  rounded_graph_desc: rounded_graph_desc || "",

  bottom_title: bottom_title || undefined,
  bottom_description: bottom_description || "",

  specialization_merged_title: specialization_merged_title || undefined,
  specialization_merged_desc: specialization_merged_desc || undefined,
  specialization_merged_content: specialization_merged_content || undefined,

  salary_graph_title: salary_graph_title || undefined,
  salary_graph_value: salary_graph_value || undefined,

  specialisation_graph_title: specialisation_graph_title || undefined,
  specialisation_graph_value: specialisation_graph_value || undefined,
};


    /* ================= DB INSERT ================= */
    const record = await prisma.ClickPick.create({
      data,
    });

    return successResponse(res, "Click Pick added successfully", 201, record);
  } catch (error) {
    console.error("ClickPick Add Error:", error);
    return errorResponse(res, error.message, 500);
  }
});





exports.GetClickpickById = catchAsync(async (req, res) => {
  try {
    const { category_id } = req.params;

    const record = await prisma.ClickPick.findFirst({
      where: {
        category_id: Number(category_id),
      },
    });

    return successResponse(
      res,
      "ClickPick record fetched successfully",
      200,
      record
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});


exports.GetProgClickpickById = catchAsync(async (req, res) => {
  try {
    const { program_id } = req.params;

    const record = await prisma.ClickPick.findFirst({
      where: {
        program_id: Number(program_id),
      },
    });

    return successResponse(
      res,
      "ClickPick record fetched successfully",
      200,
      record
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});


exports.GetSpecClickpickById = catchAsync(async (req, res) => {
  try {
    const { specialisation_program_id } = req.params;

    const record = await prisma.ClickPick.findFirst({
      where: {
        specialisation_program_id: Number(specialisation_program_id),
      },
    });

    return successResponse(
      res,
      "ClickPick record fetched successfully",
      200,
      record
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});


exports.ClickPickDelete = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return validationErrorResponse(res, "ClickPick ID is required", 400);
    }
    const existingrecord = await prisma.ClickPick.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    if (!existingrecord) {
      return validationErrorResponse(res, "ClickPick not found", 404);
    }
    let updatedRecord;
    if (existingrecord.deleted_at) {
      updatedRecord = await prisma.ClickPick.update({
        where: { id: parseInt(id) },
        data: { deleted_at: null }
      });

      return successResponse(res, "ClickPick restored successfully", 200, updatedRecord);
    }
    updatedRecord = await prisma.ClickPick.update({
      where: { id: parseInt(id) },
      data: { deleted_at: new Date() }
    });

    return successResponse(res, "ClickPick deleted successfully", 200, updatedRecord);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

const toValidIntOrUndefined = (val) => {
  if (val === undefined || val === null || val === "") return undefined;
  const num = Number(val);
  return Number.isInteger(num) && num > 0 ? num : undefined;
};


exports.updateRecord = catchAsync(async (req, res) => {
  try {
    const id = Number(req.body.id);
    if (!id) {
      return errorResponse(res, "ClickPick ID is required", 400);
    }

    const existing = await prisma.ClickPick.findUnique({
      where: { id }
    });

    if (!existing) {
      return errorResponse(res, "ClickPick record not found", 404);
    }

    const {
      category_id,
      program_id,
      specialisation_program_id,
      title,
      description,
      graph_title,
      graph_value,
      rounded_graph_title,
      rounded_graph_desc,
      bottom_title,
      bottom_description,
      specialization_merged_title,
      specialization_merged_desc,
      specialization_merged_content,
      salary_graph_title,
      salary_graph_value,
      specialisation_graph_title,
      specialisation_graph_value,
    } = req.body;

    const data = {};

    // ✅ FK SAFE ASSIGNMENTS
    const safeCategoryId = toValidIntOrUndefined(category_id);
    if (safeCategoryId !== undefined) data.category_id = safeCategoryId;

    const safeProgramId = toValidIntOrUndefined(program_id);
    if (safeProgramId !== undefined) data.program_id = safeProgramId;

    const safeSpecProgramId = toValidIntOrUndefined(specialisation_program_id);
    if (safeSpecProgramId !== undefined)
      data.specialisation_program_id = safeSpecProgramId;

    // ✅ NORMAL FIELDS
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;

    if (graph_title !== undefined) data.graph_title = graph_title;
    if (graph_value !== undefined)
      data.graph_value = safeParseArray(graph_value);

    if (rounded_graph_title !== undefined)
      data.rounded_graph_title = rounded_graph_title;

    if (rounded_graph_desc !== undefined)
      data.rounded_graph_desc = rounded_graph_desc;

    if (bottom_title !== undefined) data.bottom_title = bottom_title;
    if (bottom_description !== undefined)
      data.bottom_description = bottom_description;

    if (specialization_merged_title !== undefined)
      data.specialization_merged_title = specialization_merged_title;

    if (specialization_merged_desc !== undefined)
      data.specialization_merged_desc = specialization_merged_desc;

    if (specialization_merged_content !== undefined)
      data.specialization_merged_content = specialization_merged_content;

    if (salary_graph_title !== undefined)
      data.salary_graph_title = salary_graph_title;

    if (salary_graph_value !== undefined)
      data.salary_graph_value = salary_graph_value;

    if (specialisation_graph_title !== undefined)
      data.specialisation_graph_title = specialisation_graph_title;

    if (specialisation_graph_value !== undefined)
      data.specialisation_graph_value = specialisation_graph_value;

    const updated = await prisma.ClickPick.update({
      where: { id },
      data
    });

    return successResponse(
      res,
      "ClickPick record updated successfully",
      200,
      updated
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, error.message, 500);
  }
});



exports.GetClickpickData = catchAsync(async (req, res) => {
  try {
    const {
      category_id,
      program_id,
      specialisation_id
    } = req.query;
    // Build dynamic where condition for ClickPick
    const whereCondition = {
      deleted_at: null
    };

    if (category_id) {
      whereCondition.category_id = Number(category_id);
    }

    if (program_id) {
      whereCondition.program_id = Number(program_id);
    }

    if (specialisation_id) {
      whereCondition.specialisation_program_id = Number(specialisation_id);
    }

    // Optional: prevent empty query
    if (!category_id && !program_id && !specialisation_id) {
      return errorResponse(
        res,
        "At least one ID (category_id, program_id, or specialisation_program_id) is required",
        400
      );
    }

    // Fetch ClickPick record
    const clickPickRecord = await prisma.ClickPick.findFirst({
      where: whereCondition,
      include: {
        category: true,
        program: true,
        specialisationProgram: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    let universityIds = [];
    let universities = [];


    if (clickPickRecord?.specialisationProgram?.university_id) {
      universityIds = clickPickRecord.specialisationProgram.university_id;
      // Fetch universities using the IDs from specialisationProgram
      universities = await prisma.University.findMany({
        where: {
          id: {
            in: universityIds.map(id => Number(id))
          },
          deleted_at: null,
        },
        orderBy: {
          id: 'asc'
        }
      });

      // Sort universities to match the order in university_id array
      universities.sort((a, b) => {
        const indexA = universityIds.indexOf(a.id);
        const indexB = universityIds.indexOf(b.id);
        return indexA - indexB;
      });
    }
    // Fallback: if no specialisationProgram but program exists
    else if (clickPickRecord?.program?.id) {
      universityIds = clickPickRecord?.program.university_id;

      universities = await prisma.University.findMany({
        where: {
          id: {
            in: universityIds.map(id => Number(id))
          },
          deleted_at: null,
        },
        orderBy: {
          id: 'asc'
        }
      });

      universityIds = universities.map(univ => univ.id);
    }

    // Prepare response data
    const responseData = {
      clickPick: {
        ...clickPickRecord,
        specialisationProgram: clickPickRecord?.specialisationProgram ? {
          ...clickPickRecord?.specialisationProgram,
          university_id: undefined // Remove if you don't want to send it
        } : null
      },
      universities: universities,
    };

    return successResponse(
      res,
      "Data fetched successfully",
      200,
      responseData
    );

  } catch (error) {
    console.error("Error in GetClickpickData:", error);
    return errorResponse(res, error.message, 500);
  }
});




exports.GetClickPickListData = catchAsync(async (req, res) => {
  try {
    const { category_id, program_id } = req.query;

    /**
     * 1️⃣ NO PARAMS → FETCH ALL CATEGORIES
     */
    if (!category_id && !program_id) {
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
      const programs = await prisma.Program.findMany({
        where: {
          category_id: Number(category_id),
          deleted_at: null
        },
        orderBy: {
          id: 'asc'
        }
      });

      if (!programs.length) {
        return errorResponse(
          res,
          "No programs found for this category",
          404
        );
      }



      return successResponse(
        res,
        "Programs fetched successfully with universities",
        200,
        programs
      );
    }

    /**
     * 3️⃣ PROGRAM_ID PROVIDED → FETCH SPECIALIZATIONS WITH UNIVERSITIES
     */
    if (program_id) {
      const program = await prisma.Program.findFirst({
        where: {
          id: Number(program_id),
          deleted_at: null
        }
      });

      if (!program) {
        return errorResponse(
          res,
          "Program not found",
          404
        );
      }

      // Fetch specializations
      const specialisations = await prisma.SpecialisationProgram.findMany({
        where: {
          program_id: Number(program_id),
          deleted_at: null
        },
        orderBy: {
          id: "asc"
        }
      });

      if (!specialisations.length) {
        return errorResponse(
          res,
          "No specializations found for this program",
          404
        );
      }
      return successResponse(
        res,
        "Specializations fetched successfully with universities",
        200,
        specialisations
      );
    }
  } catch (error) {
    console.error("Error in GetClickPickListData:", error);
    return errorResponse(res, error.message, 500);
  }
});


exports.compareData = catchAsync(async (req, res) => {
  try {
    const { universities, course_name, specialisation_name } = req.query;

    /* ================= BASIC VALIDATION ================= */
    if (!universities || !course_name) {
      return errorResponse(res, "Missing required query parameters", 400);
    }

    /* ================= HELPERS ================= */

    // slug clean

    // SEO remove + hyphen → space
    const normalizeName = (v = "") =>
      v
        .split("--")[0]
        .toLowerCase()
        .replace(/-+/g, " ")
        .trim();

    // 🔥 STRONG COURSE TYPE DETECTOR
    const extractCourseType = (text = "") => {
      const types = [
        "mba",
        "mca",
        "bba",
        "msc",
        "ba",
        "bcom",
        "mcom",
        "executive mba",
      ];

      const lower = text.toLowerCase();
      return types.find(type => lower.includes(type)) || null;
    };

    const STOP_WORDS = ["updated", "guide", "overview", "details", "2024", "2025"];

    // 🔥 FINAL SAFE FILTER (MBA ≠ BA GUARANTEED)
    const buildSafeANDFilter = (text = "") => {
      const cleanText = text
        .toLowerCase()
        .replace(/-+/g, " ")
        .trim();

      const words = cleanText
        .split(" ")
        .filter(w => w.length >= 2 && !STOP_WORDS.includes(w));

      const courseType = extractCourseType(cleanText);

      const andFilters = [];

      // normal word matching
      words.forEach(word => {
        if (word !== courseType) {
          andFilters.push({
            name: { contains: word, mode: "insensitive" },
          });
        }
      });

      // strict course type
      if (courseType) {
        andFilters.push({
          name: {
            contains: courseType,
            mode: "insensitive",
          },
        });
      }

      // 🔥🔥 MAIN FIX: ONLINE MBA ≠ EXECUTIVE MBA
      if (
        courseType === "mba" &&
        !cleanText.includes("executive")
      ) {
        andFilters.push({
          NOT: {
            name: {
              contains: "executive",
              mode: "insensitive",
            },
          },
        });
      }

      return andFilters;
    };


    /* ================= NORMALIZE INPUT ================= */

    const universitySlugs = cleanSlug(universities).split("-vs-");
    const courseSearchText = normalizeName(course_name);
    const specialisationSearchText = specialisation_name
      ? normalizeName(specialisation_name)
      : null;

    /* ================= FETCH UNIVERSITIES ================= */

    const universityRecords = await prisma.university.findMany({
      where: {
        slug: { in: universitySlugs },
        deleted_at: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        cover_image: true,
        rank: true,
        pdf_download: true,
      },
    });

    if (!universityRecords.length) {
      return errorResponse(res, "Universities not found", 404);
    }

    const universityIds = universityRecords.map(u => u.id);


    /* ======================================================
       CASE 1️⃣ : UNIVERSITY + COURSE (NO SPECIALISATION)
    ====================================================== */

    if (!specialisationSearchText) {
      const courses = await prisma.course.findMany({
        where: {
          university_id: { in: universityIds },

          // ✅ FINAL SAFE FILTER
          AND: buildSafeANDFilter(courseSearchText),

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
              approvals: true,
              partners: true,
              pdf_download: true,
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
      /* ================= APPROVAL IDS ================= */


      const approvalIdsSet = new Set();

      courses.forEach(course => {
        course.university?.approvals?.approval_ids?.forEach(id => {
          approvalIdsSet.add(id);
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

      const formattedData = courses.map(course => ({
        university_id: course.university?.id,
        university_data: {
          ...course.university,
          approvals: {
            approval_list:
              course.university?.approvals?.approval_ids
                ?.map(id => approvalMap[id])
                .filter(Boolean) || [],
          },
        },

        course: {
          course_data: {
            id: course.id,
            name: course.name,
            slug: course.slug,
            mode_of_education: course.mode_of_education,
            time_frame: course.time_frame,
          },

          approvals: {
            approval_list:
              course.approvals?.approval_ids
                ?.map(id => approvalMap[id])
                .filter(Boolean) || [],
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
              total_credits: calculateTotalCredits(
                course.curriculum.semesters
              ),
            }
            : null,
        },
      }));

      return successResponse(
        res,
        "Course compare data fetched successfully",
        200,
        formattedData
      );
    }

    return successResponse(res, "No data", 200, []);
  } catch (error) {
    console.error("COMPARE API ERROR:", error);
    return errorResponse(res, error.message, 500);
  }
});


// exports.compareSpeData = catchAsync(async (req, res) => {
//   try {
//     const { universities, course_name, specialisation_name } = req.query;

//     if (!universities || !course_name || !specialisation_name) {
//       return errorResponse(
//         res,
//         "universities, course_name & specialisation_name are required",
//         400
//       );
//     }

//     const inputSpec = normalizeText(specialisation_name);
//     const inputCourse = normalizeText(course_name);

//     // university slug split
//     const universitySlugs = cleanSlug(universities).split("-vs-");

//     /* ======================================================
//        🔁 FETCH UNIVERSITY + COURSE + SPECIALISATION
//     ====================================================== */

//     const universityRecords = await prisma.university.findMany({
//       where: {
//         slug: { in: universitySlugs },
//         deleted_at: null,
//       },
//       include: {
//         courses: {
//           where: {
//             deleted_at: null,
//           },
//           include: {
//             specialisation: {
//               where: {
//                 deleted_at: null,
//               },
//               include: {
//                 approvals: true,
//                 fees: true,
//                 financialAid: true,
//                 partners: true,
//                 eligibilitycriteria: true,
//                 curriculum: true,
//               },
//             },
//           },
//         },
//       },
//     });

//     if (!universityRecords.length) {
//       return errorResponse(res, "Universities not found", 404);
//     }

//     /* ======================================================
//        🔥 85% FUZZY MATCH (COURSE + SPECIALISATION)
//     ====================================================== */

//     const matchedData = universityRecords
//       .map(university => {
//         const course = university.courses.find(c =>
//           isSimilar(normalizeText(c.name), inputCourse)
//         );

//         if (!course) return null;

//         const matchedSpec = course.specialisation.find(sp => {
//           const spName = normalizeText(sp.name);
//           const spSlug = normalizeText(sp.slug || "");
//           return isSimilar(spName, inputSpec) || isSimilar(spSlug, inputSpec);
//         });

//         if (!matchedSpec) return null;

//         return { university, course, specialisation: matchedSpec };
//       })
//       .filter(Boolean);

//     if (!matchedData.length) {
//       return errorResponse(res, "No matching data found", 404);
//     }

//     /* ======================================================
//        🔁 APPROVAL IDS
//     ====================================================== */

//     const approvalIds = new Set();

//     matchedData.forEach(d => {
//       d.specialisation.approvals?.approval_ids?.forEach(id =>
//         approvalIds.add(id)
//       );
//     });

//     const approvals = approvalIds.size
//       ? await prisma.approvals.findMany({
//           where: {
//             id: { in: [...approvalIds] },
//             deleted_at: null,
//           },
//           select: { id: true, title: true, image: true },
//         })
//       : [];

//     const approvalMap = approvals.reduce((acc, a) => {
//       acc[a.id] = a;
//       return acc;
//     }, {});

//     /* ======================================================
//        ✅ FINAL RESPONSE
//     ====================================================== */

//     const formattedData = matchedData.map(d => {
//       const sp = d.specialisation;

//       return {
//         university_id: d.university.id,
//         university_data: {
//           name: d.university.name,
//           slug: d.university.slug,
//           icon: d.university.icon,
//           cover_image: d.university.cover_image,
//           rank: d.university.rank,
//         },
//         course: {
//           course_data: {
//             id: d.course.id,
//             name: d.course.name,
//             slug: d.course.slug,
//           },
//           specialisation: {
//             id: sp.id,
//             name: sp.name,
//             slug: sp.slug,
//             description: sp.description,
//             mode_of_education: sp.mode_of_education,
//             time_frame: sp.time_frame,

//             approvals: {
//               approval_list:
//                 sp.approvals?.approval_ids
//                   ?.map(id => approvalMap[id])
//                   .filter(Boolean) || [],
//             },

//             fees: sp.fees
//               ? {
//                   semester_wise_fees: sp.fees.semester_wise_fees,
//                   tuition_fees: sp.fees.tuition_fees,
//                 }
//               : null,

//             financialAid: sp.financialAid
//               ? extractFinancialAidFlags(sp.financialAid.description)
//               : null,

//             partners: {
//               placement_partners:
//                 sp.partners?.placement_partner_id?.length > 0,
//             },

//             eligibilitycriteria: sp.eligibilitycriteria
//               ? {
//                   description: sp.eligibilitycriteria.description,
//                   IndianCriteria: sp.eligibilitycriteria.IndianCriteria,
//                   NRICriteria: sp.eligibilitycriteria.NRICriteria,
//                   notes: sp.eligibilitycriteria.notes,
//                 }
//               : null,

//             curriculum: sp.curriculum
//               ? {
//                   semesters: sp.curriculum.semesters,
//                   total_credits: calculateTotalCredits(
//                     sp.curriculum.semesters
//                   ),
//                 }
//               : null,
//           },
//         },
//       };
//     });

//     return successResponse(
//       res,
//       "Compare data fetched successfully",
//       200,
//       formattedData
//     );
//   } catch (error) {
//     return errorResponse(res, error.message, 500);
//   }
// });


/* ================= TEXT NORMALIZERS ================= */

const normalizeText = (text = "") =>
  text
    .toLowerCase()
    .replace(/--+/g, " ")
    .replace(/-+/g, " ")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

/* ================= SPECIALISATION CLEANER ================= */
// removes course & SEO noise words
const normalizeSpecialisation = (text = "") => {
  return text
    .toLowerCase()
    .replace(
      /\b(online|distance|degree|program|course|in|of|the|and|bba|mba|bcom|mcom|ba|msc|mca)\b/g,
      ""
    )
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

/* ================= COURSE TYPE DETECTOR ================= */

const extractCourseType = (text = "") => {
  const types = ["bba", "mba", "bcom", "mcom", "ba", "msc", "mca"];
  const lower = text.toLowerCase();
  return types.find(t => lower.includes(t)) || null;
};

/* ================= FUZZY MATCH ================= */

const similarity = (a, b) => {
  if (!a || !b) return 0;
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  if (longer.length === 0) return 1;
  return (
    (longer.length - editDistance(longer, shorter)) /
    longer.length
  );
};

const editDistance = (a, b) => {
  const matrix = Array.from({ length: b.length + 1 }, () =>
    Array(a.length + 1).fill(0)
  );

  for (let i = 0; i <= b.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) matrix[i][j] = matrix[i - 1][j - 1];
      else {
        matrix[i][j] =
          Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
      }
    }
  }
  return matrix[b.length][a.length];
};

const isSimilar = (a, b, threshold = 0.75) =>
  similarity(a, b) >= threshold;



exports.compareSpeData = catchAsync(async (req, res) => {
  try {
    const { universities, course_name, specialisation_name } = req.query;

    if (!universities || !course_name || !specialisation_name) {
      return errorResponse(res, "Missing parameters", 400);
    }

    /* ================= INPUT CLEAN ================= */
    const universitySlugs = cleanSlug(universities).split("-vs-");
    const inputCourse = normalizeText(course_name);
    const inputSpec = normalizeText(specialisation_name);
    const courseType = extractCourseType(inputCourse);

    /* ================= DB FETCH ================= */
    const universitiesData = await prisma.university.findMany({
      where: {
        slug: { in: universitySlugs },
        deleted_at: null,
      },
      include: {
        approvals: true, // ✅ University approvals included
        courses: {
          where: { deleted_at: null },
          include: {
            specialisation: {
              where: { deleted_at: null },
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

    /* ================= MATCH PER UNIVERSITY ================= */
    const result = universitiesData.map(university => {
      let matchedCourse = null;
      let matchedSpec = null;

      matchedCourse = university.courses.find(c => {
        const courseName = normalizeText(c.name);
        if (courseType && !courseName.includes(courseType)) return false;

        return (
          courseName.includes(inputCourse) ||
          isSimilar(courseName, inputCourse, 0.5) // 🔥 70% similarity
        );
      });

      if (matchedCourse) {
        matchedSpec = matchedCourse.specialisation.find(sp => {
          const spName = normalizeText(sp.name);
          const spSlug = normalizeText(sp.slug || "");

          return (
            spName.includes(inputSpec) ||
            inputSpec.includes(spName) ||
            spSlug.includes(inputSpec) ||
            isSimilar(spName, inputSpec, 0.5) || // 🔥 70% similarity
            isSimilar(spSlug, inputSpec, 0.5)     // 🔥 70% similarity
          );
        });
      }

      /* ===== RETURN EVEN IF NOT MATCHED ===== */
      return {
        university_id: university.id,
        university_data: {
          name: university.name,
          slug: university.slug,
          icon: university.icon,
          cover_image: university.cover_image,

          approvals: university.approvals
            ? {
                approval_ids: university.approvals.approval_ids || [],
                approval_list:
                  university.approvals.approval_ids
                    ?.map(id => approvalMap[id])
                    .filter(Boolean) || [],
              }
            : null,

          pdf_download: university.pdf_download,
          rank: university.rank,
        },

        course: matchedCourse
          ? {
              course_data: {
                id: matchedCourse.id,
                name: matchedCourse.name,
                slug: matchedCourse.slug,
              },

              specialisation: matchedSpec
                ? {
                    id: matchedSpec.id,
                    name: matchedSpec.name,
                    slug: matchedSpec.slug,
                    description: matchedSpec.description,
                    mode_of_education: matchedSpec.mode_of_education,
                    time_frame: matchedSpec.time_frame,

                    approvals: {
                      approval_ids: matchedSpec.approvals?.approval_ids || [],
                      approval_list:
                        matchedSpec.approvals?.approval_ids
                          ?.map(id => approvalMap[id])
                          .filter(Boolean) || [],
                    },

                    fees: matchedSpec.fees
                      ? {
                          semester_wise_fees: matchedSpec.fees.semester_wise_fees,
                          tuition_fees: matchedSpec.fees.tuition_fees,
                        }
                      : null,

                    financialAid: matchedSpec.financialAid
                      ? extractFinancialAidFlags(matchedSpec.financialAid.description)
                      : null,

                    partners: {
                      placement_partners:
                        matchedSpec.partners?.placement_partner_id?.length > 0,
                    },

                    eligibilitycriteria: matchedSpec.eligibilitycriteria
                      ? {
                          description: matchedSpec.eligibilitycriteria.description,
                          IndianCriteria: matchedSpec.eligibilitycriteria.IndianCriteria,
                          NRICriteria: matchedSpec.eligibilitycriteria.NRICriteria,
                          notes: matchedSpec.eligibilitycriteria.notes,
                        }
                      : null,

                    curriculum: matchedSpec.curriculum
                      ? {
                          semesters: matchedSpec.curriculum.semesters,
                          total_credits: calculateTotalCredits(matchedSpec.curriculum.semesters),
                        }
                      : null,
                  }
                : null,
            }
          : null,
      };
    });

    /* ================= SUCCESS ================= */
    return successResponse(res, "Specialisation compare success", 200, result);

  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});



