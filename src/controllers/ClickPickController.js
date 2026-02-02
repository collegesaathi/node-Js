const { errorResponse, successResponse, validationErrorResponse } = require("../utils/ErrorHandling");
const prisma = require("../config/prisma");
const catchAsync = require("../utils/catchAsync");


function levenshteinDistance(a, b) {
  if (!a) return b.length;
  if (!b) return a.length;

  const matrix = Array.from({ length: b.length + 1 }, () =>
    Array(a.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[j][i] = matrix[j - 1][i - 1];
      } else {
        matrix[j][i] = Math.min(
          matrix[j - 1][i] + 1,     // deletion
          matrix[j][i - 1] + 1,     // insertion
          matrix[j - 1][i - 1] + 1  // substitution
        );
      }
    }
  }

  return matrix[b.length][a.length];
}


function similarityScore(a, b) {
  if (!a || !b) return 0;
  return 1 - levenshteinDistance(a, b) / Math.max(a.length, b.length);
}

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
    const { category_id, program_id, specialisation_id } = req.query;

    // ----------------------------
    // 1️⃣ Build OR condition
    // ----------------------------
    const orConditions = [];

    if (category_id) {
      orConditions.push({
        category_id: Number(category_id)
      });
    }

    if (program_id) {
      orConditions.push({
        program_id: Number(program_id)
      });
    }

    if (specialisation_id) {
      orConditions.push({
        specialisation_program_id: Number(specialisation_id)
      });
    }

    if (orConditions.length === 0) {
      return errorResponse(
        res,
        "category_id or program_id or specialisation_id is required",
        400
      );
    }

    // ----------------------------
    // 2️⃣ Fetch ClickPick
    // ----------------------------
    const clickPickRecord = await prisma.ClickPick.findFirst({
      where: {
        deleted_at: null,
        OR: orConditions
      },
      include: {
        category: true,
        program: true,
        specialisationProgram: true
      },
      orderBy: {
        created_at: "desc"
      }
    });

    if (!clickPickRecord) {
      return errorResponse(res, "No ClickPick data found", 404);
    }

    // ----------------------------
    // 2.5️⃣ Specialisation Check Flag (NEW)
    // ----------------------------
    let spec = false;

    if (program_id) {
      const specCheck = await prisma.SpecialisationProgram.findFirst({
        where: {
          program_id: Number(program_id),
          deleted_at: null
        }
      });

      spec = specCheck ? true : false;
    }

    // ----------------------------
    // 3️⃣ University fetch logic
    // ----------------------------
    let universityIds = [];
    let universities = [];

    // Priority 1️⃣ Specialisation
    if (
      clickPickRecord.specialisationProgram?.university_id &&
      Array.isArray(clickPickRecord.specialisationProgram.university_id)
    ) {
      universityIds = clickPickRecord.specialisationProgram.university_id;
    }

    // Priority 2️⃣ Program
    else if (
      clickPickRecord.program?.university_id &&
      Array.isArray(clickPickRecord.program.university_id)
    ) {
      universityIds = clickPickRecord.program.university_id;
    }

    if (universityIds.length > 0) {
      universities = await prisma.University.findMany({
        where: {
          id: { in: universityIds.map(Number) },
          deleted_at: null
        }
      });

      // Maintain order
      universities.sort(
        (a, b) => universityIds.indexOf(a.id) - universityIds.indexOf(b.id)
      );
    }

    // ----------------------------
    // 4️⃣ Final response
    // ----------------------------
    return successResponse(res, "Data fetched successfully", 200, {
      spec,                 // ✅ true / false
      clickPick: clickPickRecord,
      universities
    });

  } catch (error) {
    console.error("GetClickpickData error:", error);
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

      // if (!programs.length) {
      //   return errorResponse(
      //     res,
      //     "No programs found for this category",
      //     404
      //   );
      // }



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

      // if (!specialisations.length) {
      //   return errorResponse(
      //     res,
      //     "No specializations found for this program",
      //     404
      //   );
      // }
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
    const { universities, course_name } = req.query;

    /* ================= VALIDATION ================= */
    if (!universities || !course_name) {
      return errorResponse(res, "Missing required query parameters", 400);
    }

    /* ================= HELPERS ================= */

    function normalizeSlug(str) {
      if (!str) return "";

      return cleanSlug(str)
        .replace(/dr-/g, "")          
        .replace(/d-y-/g, "dy-")      
        .replace(/dypatil/g, "dy-patil")
        .replace(/dy--patil/g, "dy-patil")
        .replace(/university/g, "")
        .replace(/college/g, "")
        .replace(/institute/g, "")
        .replace(/of/g, "")
        .replace(/the/g, "")
        .replace(/--+/g, "-")
        .trim();
    }

    function smartTokenSimilarity(a, b) {
      const na = normalizeSlug(a).split("-").filter(Boolean);
      const nb = normalizeSlug(b).split("-").filter(Boolean);

      let match = 0;
      na.forEach(t => {
        if (nb.includes(t)) match++;
      });

      return match / Math.max(na.length, nb.length); // 0 → 1
    }

    function levenshteinDistance(a, b) {
      if (!a) return b.length;
      if (!b) return a.length;

      const matrix = Array.from({ length: b.length + 1 }, () =>
        Array(a.length + 1).fill(0)
      );

      for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
      for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

      for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
          if (a[i - 1] === b[j - 1]) {
            matrix[j][i] = matrix[j - 1][i - 1];
          } else {
            matrix[j][i] = Math.min(
              matrix[j - 1][i] + 1,     // delete
              matrix[j][i - 1] + 1,     // insert
              matrix[j - 1][i - 1] + 1  // replace
            );
          }
        }
      }

      return matrix[b.length][a.length];
    }

    function similarityScore(a, b) {
      if (!a || !b) return 0;
      const d = levenshteinDistance(a, b);
      return 1 - d / Math.max(a.length, b.length); // 0–1
    }

    /* ================= INPUT ================= */
    const inputUniversitySlugs = cleanSlug(universities).split("-vs-");
    const courseSlugInputRaw = cleanSlug(course_name);
    const courseSlugInput = normalizeSlug(courseSlugInputRaw);

    /* ================= FETCH ALL UNIVERSITIES ================= */
    const allUniversities = await prisma.university.findMany({
      where: { deleted_at: null },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        cover_image: true,
        rank: true,
        pdf_download: true,
        approvals: true,
        partners: true,
      },
    });

    if (!allUniversities.length) {
      return errorResponse(res, "No universities found in DB", 404);
    }

    /* ================= UNIVERSITY MATCHING ================= */
    const matchedUniversities = [];

    inputUniversitySlugs.forEach(inputSlugRaw => {
      const inputSlug = normalizeSlug(inputSlugRaw);

      let bestMatch = null;
      let bestScore = 0;

      allUniversities.forEach(dbUni => {
        const dbSlug = normalizeSlug(dbUni.slug);

        const charScore = similarityScore(inputSlug, dbSlug);
        const tokenScore = smartTokenSimilarity(inputSlug, dbSlug);
        const finalScore = Math.max(charScore, tokenScore);

        if (finalScore > bestScore) {
          bestScore = finalScore;
          bestMatch = dbUni;
        }
      });

      if (bestMatch && bestScore >= 0.6) {   // 60% threshold
        matchedUniversities.push(bestMatch);
      }
    });

    if (!matchedUniversities.length) {
      return errorResponse(res, "No matching universities found", 404);
    }

    const universityIds = matchedUniversities.map(u => u.id);

    /* ================= FETCH COURSES ================= */
    const allCourses = await prisma.course.findMany({
      where: {
        university_id: { in: universityIds },
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

    if (!allCourses.length) {
      return successResponse(res, "No courses found for matched universities", 200, []);
    }

    /* ================= SMART COURSE MATCHING ================= */

    const matchedCourses = [];

    allCourses.forEach(course => {
      const dbSlug = normalizeSlug(cleanSlug(course.slug));
      const dbName = normalizeSlug(course.name);
      const inputSlug = courseSlugInput;

      const slugScore = similarityScore(dbSlug, inputSlug);
      const nameScore = similarityScore(dbName, inputSlug);

      const tokenScore = smartTokenSimilarity(dbSlug, inputSlug);

      const score = Math.max(slugScore, nameScore, tokenScore);
      const percent = Math.round(score * 100);

      if (percent >= 30) { // 🎯 minimum 30%
        matchedCourses.push({
          course,
          percent,
          match_type:
            percent >= 80 ? "strong" :
            percent >= 50 ? "medium" :
            "low"
        });
      }
    });

    /* ================= BEST COURSE PER UNIVERSITY ================= */

    const bestCourseMap = {};

    matchedCourses.forEach(obj => {
      const uniId = obj.course.university_id;

      if (!bestCourseMap[uniId] || bestCourseMap[uniId].percent < obj.percent) {
        bestCourseMap[uniId] = obj;
      }
    });

    const finalCourses = Object.values(bestCourseMap).map(e => e.course);

    if (!finalCourses.length) {
      return successResponse(res, "No matching courses found", 200, []);
    }

    /* ================= APPROVALS ================= */

    const approvalIdsSet = new Set();

    finalCourses.forEach(course => {
      course.university?.approvals?.approval_ids?.forEach(id => approvalIdsSet.add(id));
      course.approvals?.approval_ids?.forEach(id => approvalIdsSet.add(id));
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

    /* ================= FORMAT RESPONSE ================= */

    const formattedData = finalCourses.map(course => ({
      university_id: course.university?.id,

      university_data: {
        id: course.university?.id,
        name: course.university?.name,
        slug: course.university?.slug,
        icon: course.university?.icon,
        cover_image: course.university?.cover_image,
        rank: course.university?.rank,
        pdf_download: course.university?.pdf_download,
        approvals: {
          approval_list:
            course.university?.approvals?.approval_ids
              ?.map(id => approvalMap[id])
              .filter(Boolean) || [],
        },
        partners: course.university?.partners || [],
      },

      course: {
        course_data: {
          id: course.id,
          name: course.name,
          slug: course.slug,
          mode_of_education: course.mode_of_education,
          time_frame: course.time_frame,
        },

        match_info: {
          // extra debug info if needed
          // percent & type already filtered
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
              total_credits: calculateTotalCredits(course.curriculum.semesters),
            }
          : null,
      },
    }));

    /* ================= FINAL RESPONSE ================= */

    return successResponse(
      res,
      "Smart course compare data fetched successfully",
      200,
      formattedData
    );

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


/* ================= COURSE TYPE DETECTOR ================= */



/* ================= FUZZY MATCH ================= */


// Speaclizatipn  



exports.compareSpeData = catchAsync(async (req, res) => {
  try {
    const { universities, specialisation_name } = req.query;

    if (!universities || !specialisation_name) {
      return errorResponse(res, "Missing parameters", 400);
    }

    /* ================= INPUT CLEAN ================= */
    const universitySlugs = cleanSlug(universities).split("-vs-");
    const inputSpec = normalizeText(specialisation_name);

    /* ================= GET UNIVERSITY DATA ================= */
    const universitiesData = await prisma.university.findMany({
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
        approvals: true,   // contains approval_ids
      },
    });

    if (!universitiesData.length) {
      return successResponse(res, "No universities found", 200, []);
    }

    const universityIds = universitiesData.map(u => u.id);

    /* ================= GET SPECIALISATIONS ================= */
    const specialisations = await prisma.specialisation.findMany({
      where: {
        university_id: { in: universityIds },
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
    });

    /* ================= GET APPROVAL MASTER ================= */
    const approvalsData = await prisma.approvals.findMany({
      where: { deleted_at: null },
    });

    /* ================= CREATE APPROVAL MAP ================= */
    const approvalMap = {};
    approvalsData.forEach(a => {
      approvalMap[a.id] = a;
    });

    /* ================= MATCHING LOGIC ================= */
    const result = universitiesData.map(university => {

      const uniSpecs = specialisations.filter(
        sp => sp.university_id === university.id
      );

      let bestMatch = null;
      let bestScore = 0;

      for (const sp of uniSpecs) {
        const spName = normalizeText(sp.name || "");
        const spSlug = normalizeText(sp.slug || "");

        const nameScore = similarityScore(spName, inputSpec); // 0–1
        const slugScore = similarityScore(spSlug, inputSpec); // 0–1

        const score = Math.max(nameScore, slugScore);
        const percent = Math.round(score * 100);

        if (percent >= 30 && percent > bestScore) {
          bestScore = percent;
          bestMatch = {
            ...sp,
            match_percentage: percent,
            match_type:
              percent >= 80 ? "strong" :
                percent >= 50 ? "medium" :
                  "low"
          };
        }
      }

      /* ================= RESPONSE FORMAT ================= */
      return {
        university_id: university.id,

        university_data: {
          name: university.name,
          slug: university.slug,
          icon: university.icon,
          cover_image: university.cover_image,
          rank: university.rank,
          pdf_download: university.pdf_download,

          approvals: university.approvals
            ? {
              approval_ids: university.approvals.approval_ids || [],
              approval_list: Array.isArray(university.approvals.approval_ids)
                ? university.approvals.approval_ids
                  .map(id => approvalMap[id] || null)
                  .filter(Boolean)
                : [],
            }
            : null,
        },

        specialisation: bestMatch
          ? {
            id: bestMatch.id,
            name: bestMatch.name,
            slug: bestMatch.slug,
            description: bestMatch.description,
            mode_of_education: bestMatch.mode_of_education,
            time_frame: bestMatch.time_frame,

            match_percentage: bestMatch.match_percentage,
            match_type: bestMatch.match_type,

            approvals: university.approvals
              ? {
                approval_ids: university.approvals.approval_ids || [],
                approval_list: Array.isArray(university.approvals.approval_ids)
                  ? university.approvals.approval_ids
                    .map(id => approvalMap[id] || null)
                    .filter(Boolean)
                  : [],
              }
              : null,

            fees: bestMatch.fees
              ? {
                semester_wise_fees: bestMatch.fees.semester_wise_fees,
                tuition_fees: bestMatch.fees.tuition_fees,
              }
              : null,

            financialAid: bestMatch.financialAid
              ? extractFinancialAidFlags(bestMatch.financialAid.description)
              : null,

            partners: {
              placement_partners:
                bestMatch.partners?.placement_partner_id?.length > 0,
            },

            eligibilitycriteria: bestMatch.eligibilitycriteria
              ? {
                description: bestMatch.eligibilitycriteria.description,
                IndianCriteria: bestMatch.eligibilitycriteria.IndianCriteria,
                NRICriteria: bestMatch.eligibilitycriteria.NRICriteria,
                notes: bestMatch.eligibilitycriteria.notes,
              }
              : null,

            curriculum: bestMatch.curriculum
              ? {
                semesters: bestMatch.curriculum.semesters,
                total_credits: calculateTotalCredits(
                  bestMatch.curriculum.semesters
                ),
              }
              : null,
          }
          : null,
      };
    });

    /* ================= SUCCESS ================= */
    return successResponse(res, "Specialisation compare success", 200, result);

  } catch (error) {
    console.log("COMPARE ERROR:", error);
    return errorResponse(res, error.message, 500);
  }
});

/* =========================================================
   PROGRAM FAMILY DETECTOR
========================================================= */
function extractProgramFamily(str) {
  if (!str) return "other";
  const s = str.toLowerCase();

  // UG Programs
  if (s.includes("bba")) return "bba";
  if (s.includes("bca")) return "bca";
  if (s.includes("ba")) return "ba";
  if (s.includes("bcom")) return "bcom";
  if (s.includes("bsc")) return "bsc";
  if (s.includes("btech")) return "btech";

  // PG Programs
  if (s.includes("mba")) {
    if (s.includes("executive")) return "executive-mba";
    return "mba";
  }
  if (s.includes("mca")) return "mca";
  if (s.includes("mcom")) return "mcom";
  if (s.includes("msc")) return "msc";

  // Diploma / Certificate
  if (s.includes("diploma")) return "diploma";
  if (s.includes("certificate")) return "certificate";

  return "other";
}

/* =========================================================
   PROGRAM COMPATIBILITY CHECK
========================================================= */
function isCompatibleProgram(inputStr, courseSlug, courseName) {
  const inputFamily = extractProgramFamily(inputStr);
  const courseFamily = extractProgramFamily(
    (courseSlug || "") + " " + (courseName || "")
  );

  // Allow unknown input
  if (inputFamily === "other") return true;

  // Exact family match
  if (inputFamily === courseFamily) return true;

  // Loosened match: check if inputFamily exists anywhere in course name or slug
  const combined = ((courseSlug || "") + " " + (courseName || "")).toLowerCase();
  if (combined.includes(inputFamily)) return true;

  return false;
}


/* =========================================================
   CLEAN PROGRAM TEXT
========================================================= */
function cleanProgramText(str) {
  if (!str) return "";
  return normalizeText(str)
    .replace(/\b(program|degree|course|online|distance|learning)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/* =========================================================
   TOKEN SIMILARITY
========================================================= */
function tokenSimilarity(a, b) {
  const ta = a.split(" ").filter(Boolean);
  const tb = b.split(" ").filter(Boolean);

  let match = 0;
  ta.forEach(t => {
    if (tb.includes(t)) match++;
  });

  return match / Math.max(ta.length, tb.length);
}

/* =========================================================
   MAIN CONTROLLER
========================================================= */
exports.compareCourseData = catchAsync(async (req, res) => {
  try {
    const { universities, course_name } = req.query;

    if (!universities || !course_name) {
      return errorResponse(res, "Missing parameters", 400);
    }

    /* ================= INPUT CLEAN ================= */
    const universitySlugs = cleanSlug(universities).split("-vs-");
    const inputCourse = normalizeText(course_name);
    const inputClean = cleanProgramText(inputCourse); // ❗ defined here

    /* ================= GET UNIVERSITY DATA ================= */
    const universitiesData = await prisma.university.findMany({
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
        approvals: true,
      },
    });

    if (!universitiesData.length) {
      return successResponse(res, "No universities found", 200, []);
    }

    const universityIds = universitiesData.map(u => u.id);

    /* ================= GET COURSES ================= */
    const courses = await prisma.course.findMany({
      where: {
        university_id: { in: universityIds },
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
    });

    /* ================= GET APPROVAL MASTER ================= */
    const approvalsData = await prisma.approvals.findMany({
      where: { deleted_at: null },
    });

    const approvalMap = {};
    approvalsData.forEach(a => {
      approvalMap[a.id] = a;
    });

    /* ================= MATCHING LOGIC ================= */
    const result = universitiesData.map(university => {
      const uniCourses = courses.filter(c => c.university_id === university.id);

      let bestMatch = null;
      let bestScore = 0;

      uniCourses.forEach(c => {
        const cName = cleanProgramText(c.name || "");
        const cSlug = cleanProgramText(c.slug || "");

        if (!isCompatibleProgram(inputCourse, cSlug, cName)) return; // skip incompatible

        const nameScore = similarityScore(cName, inputClean);
        const slugScore = similarityScore(cSlug, inputClean);
        const tokenScore = tokenSimilarity(cName, inputClean);

        const score = Math.max(nameScore, slugScore, tokenScore);
        const percent = Math.round(score * 100);

        if (percent >= 45 && percent > bestScore) {
          bestScore = percent;
          bestMatch = {
            ...c,
            match_percentage: percent,
            match_type:
              percent >= 80 ? "fast" :
              percent >= 70 ? "medium" :
              "slow"
          };
        }
      });

      /* ================= RESPONSE FORMAT ================= */
      return {
        university_id: university.id,

        university_data: {
          name: university.name,
          slug: university.slug,
          icon: university.icon,
          cover_image: university.cover_image,
          rank: university.rank,
          pdf_download: university.pdf_download,

          approvals: university.approvals
            ? {
                approval_ids: university.approvals.approval_ids || [],
                approval_list: Array.isArray(university.approvals.approval_ids)
                  ? university.approvals.approval_ids
                      .map(id => approvalMap[id] || null)
                      .filter(Boolean)
                  : [],
              }
            : null,
        },

        course: bestMatch
          ? {
              id: bestMatch.id,
              name: bestMatch.name,
              slug: bestMatch.slug,
              description: bestMatch.description,
              mode_of_education: bestMatch.mode_of_education,
              time_frame: bestMatch.time_frame,

              match_percentage: bestMatch.match_percentage,
              match_type: bestMatch.match_type,

              approvals: bestMatch.approvals
                ? {
                    approval_ids: bestMatch.approvals.approval_ids || [],
                    approval_list: Array.isArray(bestMatch.approvals.approval_ids)
                      ? bestMatch.approvals.approval_ids
                          .map(id => approvalMap[id] || null)
                          .filter(Boolean)
                      : [],
                  }
                : null,

              fees: bestMatch.fees
                ? {
                    semester_wise_fees: bestMatch.fees.semester_wise_fees,
                    tuition_fees: bestMatch.fees.tuition_fees,
                  }
                : null,

              financialAid: bestMatch.financialAid
                ? extractFinancialAidFlags(bestMatch.financialAid.description)
                : null,

              partners: {
                placement_partners:
                  bestMatch.partners?.placement_partner_id?.length > 0,
              },

              eligibilitycriteria: bestMatch.eligibilitycriteria
                ? {
                    description: bestMatch.eligibilitycriteria.description,
                    IndianCriteria: bestMatch.eligibilitycriteria.IndianCriteria,
                    NRICriteria: bestMatch.eligibilitycriteria.NRICriteria,
                    notes: bestMatch.eligibilitycriteria.notes,
                  }
                : null,

              curriculum: bestMatch.curriculum
                ? {
                    semesters: bestMatch.curriculum.semesters,
                    total_credits: calculateTotalCredits(
                      bestMatch.curriculum.semesters
                    ),
                  }
                : null,
            }
          : null,
      };
    });

    /* ================= SUCCESS ================= */
    return successResponse(res, "Course compare success", 200, result);
  } catch (error) {
    console.log("COMPARE ERROR:", error);
    return errorResponse(res, error.message, 500);
  }
});

