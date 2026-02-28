const { errorResponse, successResponse, validationErrorResponse } = require("../utils/ErrorHandling");
const prisma = require("../config/prisma");
const catchAsync = require("../utils/catchAsync");
const { Prisma } = require("@prisma/client");


exports.GetFiltrationList = catchAsync(async (req, res) => {
    try {
        const {
            program_id,
            specilisation_program_id,
            Approval_ids
        } = req.query;

        let universityIds = [];

        /* -------------------------------------------
         Utility: normalize JSON array
        ---------------------------------------------*/
        const normalizeIds = (value) => {
            if (!value) return [];
            if (Array.isArray(value)) return value.map(Number);
            if (typeof value === "string") {
                try {
                    return JSON.parse(value).map(Number);
                } catch {
                    return [];
                }
            }
            return [];
        };

        const approvalIds = normalizeIds(Approval_ids);

        /* --------------------------------------------
         1️⃣ Get universities from Specialisation / Program
        ---------------------------------------------*/
        if (specilisation_program_id) {
            const specialization = await prisma.specialisationProgram.findFirst({
                where: {
                    id: Number(specilisation_program_id),
                    deleted_at: null
                },
                select: { university_id: true }
            });

            universityIds = normalizeIds(specialization?.university_id);
        }
        else if (program_id) {
            const program = await prisma.program.findFirst({
                where: {
                    id: Number(program_id),
                    deleted_at: null
                },
                select: { university_id: true }
            });

            universityIds = normalizeIds(program?.university_id);
        }

        /* --------------------------------------------
         2️⃣ Build University WHERE condition dynamically
        ---------------------------------------------*/
        const universityWhere = {
            deleted_at: null
        };

        // Case 2: Program/Specialisation universities exist
        if (universityIds.length) {
            universityWhere.id = { in: universityIds };
        }

        /* --------------------------------------------
         3️⃣ Apply Approval filter (ANY approval match)
        ---------------------------------------------*/
        if (approvalIds.length) {
            universityWhere.approvals = {
                is: {
                    OR: approvalIds.map(id => ({
                        approval_ids: {
                            array_contains: [id]
                        }
                    }))
                }
            };
        }

        /* --------------------------------------------
         4️⃣ Fetch universities (with approval_ids)
        ---------------------------------------------*/
        const universities = await prisma.university.findMany({
            where: universityWhere,
            select: {
                id: true,
                name: true,
                slug: true,
                icon: true,
                cover_image: true,
                rank: true,
                approvals: {
                    select: {
                        approval_ids: true
                    }
                }
            }
        });

        /* --------------------------------------------
         5️⃣ Resolve approval IDs → approval details
        ---------------------------------------------*/
        const allApprovalIds = [
            ...new Set(
                universities
                    .flatMap(u => u.approvals?.approval_ids || [])
                    .map(Number)
            )
        ];

        let approvalMap = {};

        if (allApprovalIds.length) {
            const approvals = await prisma.approvals.findMany({
                where: {
                    id: { in: allApprovalIds },
                    deleted_at: null
                },
                select: {
                    id: true,
                    title: true,
                    image: true
                }
            });

            approvalMap = Object.fromEntries(
                approvals.map(a => [a.id, a])
            );
        }

        /* --------------------------------------------
         6️⃣ Attach approval objects to universities
        ---------------------------------------------*/
        const formattedUniversities = universities.map(u => ({
            ...u,
            approvals: (u.approvals?.approval_ids || [])
                .map(id => approvalMap[id])
                .filter(Boolean)
        }));

        return successResponse(
            res,
            "Universities fetched successfully",
            200,
            formattedUniversities
        );

    } catch (error) {
        console.error(error);
        return errorResponse(res, "Something went wrong", 500, error.message);
    }
});


exports.GetFilterCategroybyuniversity = catchAsync(async (req, res) => {
  try {
    const { category_id } = req.query;

    // executive slugs
 

      // ✅ your existing logic unchanged
      const programs = await prisma.Program.findMany({
        where: {
          category_id: Number(category_id),
          deleted_at: null,
        },
        orderBy: { id: "asc" }
      });

      if (!programs.length) {
        return errorResponse(res, "No programs found for this category", 404);
      }

      const validPrograms = programs.filter(
        p => Array.isArray(p.university_id) && p.university_id.length > 0
      );

      if (!validPrograms.length) {
        return errorResponse(res, "No programs found with universities", 404);
      }

      const programIds = validPrograms.map(p => p.id);

      const universityIds = [
        ...new Set(validPrograms.flatMap(p => p.university_id))
      ];

      let universities = [];

      if (universityIds.length > 0) {
        universities = await prisma.University.findMany({
          where: {
            id: { in: universityIds },
            deleted_at: null
          }
        });
      }

      const specialisations = await prisma.specialisationProgram.findMany({
        where: {
          program_id: {
            in: programIds
          }
        },
        select: {
          program_id: true
        }
      });

      const specSet = new Set(specialisations.map(s => s.program_id));

      const finalData = validPrograms.map(p => {
        const uniIds = Array.isArray(p.university_id) ? p.university_id : [];

        const programUniversities = universities.filter(u =>
          uniIds.includes(u.id)
        );

        return {
          ...p,
          hasSpecialization: specSet.has(p.id),
          specialisationslength: specSet.size,
          universities: programUniversities
        };
      });

      return successResponse(
        res,
        "Programs fetched with specialization flag",
        200,
        finalData
      );

  } catch (error) {
    console.error("Error in GetFilterCategroybyuniversity:", error);
    return errorResponse(res, error.message, 500);
  }
});


exports.GetFilterprogrambyuniversity = catchAsync(async (req, res) => {
    try {
        const { program_id } = req.query;

        const programs = await prisma.Program.findFirst({
            where: {
                id: Number(program_id),
                deleted_at: null
            },
            select: {
                university_id: true,
            },
            orderBy: {
                id: 'asc'
            }
        });

        let universityIds = programs.university_id || [];
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

const SpecialisationPrograms = await prisma.SpecialisationProgram.findMany({
  where: {
    program_id: Number(program_id),
    deleted_at: null
  },
});

const finalData = SpecialisationPrograms
  .filter(sp => Array.isArray(sp.university_id) && sp.university_id.length > 0)
  .map(sp => ({
    ...sp,
    hasSpecialization: true
  }));

const responseData = {
  data: finalData,
  universityCount: finalData.length
};

        return successResponse(
            res,
            "Specializations fetched successfully with universities",
            200,
            {
                SpecialisationPrograms: responseData, universities
            }
        );
    } catch (error) {
        console.error("Error in GetClickPickListData:", error);
        return errorResponse(res, error.message, 500);
    }
});


exports.GetFilterSpelizationbyuniversity = catchAsync(async (req, res) => {
    try {
        const { specialisation_program_id } = req.query;

        const programs = await prisma.SpecialisationProgram.findFirst({
            where: {
                id: Number(specialisation_program_id),
                deleted_at: null
            },
            select: {
                university_id: true,
            },
            orderBy: {
                id: 'asc'
            }
        });

        let universityIds = programs.university_id || [];

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


        return successResponse(
            res,
            "Specializations fetched successfully with universities",
            200,
            universities
        );
    } catch (error) {
        console.error("Error in GetClickPickListData:", error);
        return errorResponse(res, error.message, 500);
    }
});

exports.ApprovalFilter = catchAsync(async (req, res) => {
    // --- Fetch Approvals ---
    let approvals = await prisma.approvals.findMany({
        orderBy: { created_at: "asc" },
    });

    return successResponse(res, "Admin university data fetched successfully", 200, approvals);
});

exports.GetFilterApprovalbyuniversity = catchAsync(async (req, res) => {
    try {
        let { selectedApproval } = req.query;

        if (!selectedApproval) {
            return successResponse(res, "No approval selected", 200, []);
        }

        const approvalIds = Array.isArray(selectedApproval)
            ? selectedApproval.map(Number)
            : [Number(selectedApproval)];

        /* ----------------------------------
           FETCH UNIVERSITIES BY APPROVAL
        ---------------------------------- */
        const universities = await prisma.university.findMany({
            where: {
                deleted_at: null,

                approvals: {
                    is: {
                        approval_ids: {
                            array_contains: approvalIds, // ✅ JSON ARRAY MATCH
                        },
                    },
                },
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
                name: "asc",
            },
        });

        return successResponse(
            res,
            "Universities fetched successfully by approval",
            200,
            universities
        );
    } catch (error) {
        console.error("GetFilterApprovalbyuniversity Error:", error);
        return errorResponse(res, error.message, 500);
    }
});



exports.GetFindCategroybyuniversity = catchAsync(async (req, res) => {
    try {
        const { category_id } = req.query;

const programs = await prisma.Program.findMany({
  where: {
    category_id: Number(category_id),
    deleted_at: null
  },
  orderBy: { id: "asc" }
});

if (!programs.length) {
  return errorResponse(res, "No programs found for this category", 404);
}

// program IDs
const programIds = programs.map(p => p.id);

// university IDs (flatten + unique)
const universityIds = [
  ...new Set(programs.flatMap(p => p.university_id))
];


// Fetch universities
let universities = [];
if (universityIds.length > 0) {
  universities = await prisma.University.findMany({
    where: {
      id: { in: universityIds },
      deleted_at: null
    }
  });
}


        // specialisation table se matching records lao
        const specialisations = await prisma.specialisationProgram.findMany({
            where: {
                program_id: {
                    in: programIds
                }
            },
            select: {
                program_id: true
            }
        });

        // set bana lo fast lookup ke liye
        const specSet = new Set(specialisations.map(s => s.program_id));
    

        // final response mapping
      const finalData = programs.map(p => {
  const uniIds = Array.isArray(p.university_id) ? p.university_id : [];

  const programUniversities = universities.filter(u =>
    uniIds.includes(u.id)
  );

  return {
    ...p,
    hasSpecialization: specSet.has(p.id),
    specialisationslength: specSet.size,   // ✅ fix below
    universities: programUniversities      // ✅ per-program universities
  };
});

        return successResponse(
            res,
            "Programs fetched with specialization flag",
            200,
            finalData
        );

    } catch (error) {
        console.error("Error in GetFilterCategroybyuniversity:", error);
        return errorResponse(res, error.message, 500);
    }
});
