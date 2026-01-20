const { errorResponse, successResponse, validationErrorResponse } = require("../utils/ErrorHandling");
const prisma = require("../config/prisma");
const catchAsync = require("../utils/catchAsync");


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
      category_id: category_id ? Number(category_id) : null,
      program_id: program_id ? Number(program_id) : null,
      specialisation_program_id: specialisation_program_id
        ? Number(specialisation_program_id)
        : null,

      title: title || null,
      description: description || "",

      graph_title: graph_title || null,
      graph_value: graph_value ? safeParseArray(graph_value) : null,

      rounded_graph_title: rounded_graph_title || null,
      rounded_graph_desc: rounded_graph_desc || "",

      bottom_title: bottom_title || null,
      bottom_description: bottom_description || "",

      specialization_merged_title: specialization_merged_title || null,
      specialization_merged_desc: specialization_merged_desc || null,
      specialization_merged_content: specialization_merged_content || null,

      salary_graph_title: salary_graph_title || null,
      salary_graph_value: salary_graph_value || null,

      specialisation_graph_title: specialisation_graph_title || null,
      specialisation_graph_value: specialisation_graph_value || null,
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

    /**
     * Build update payload
     * ONLY include fields that are sent
     */
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
      category_id: category_id ? Number(category_id) : null,
      program_id: program_id ? Number(program_id) : null,
      specialisation_program_id: specialisation_program_id
        ? Number(specialisation_program_id)
        : null,

      title: title || null,
      description: description || "",

      graph_title: graph_title || null,
      graph_value: graph_value ? safeParseArray(graph_value) : null,

      rounded_graph_title: rounded_graph_title || null,
      rounded_graph_desc: rounded_graph_desc || "",

      bottom_title: bottom_title || null,
      bottom_description: bottom_description || "",

      specialization_merged_title: specialization_merged_title || null,
      specialization_merged_desc: specialization_merged_desc || null,
      specialization_merged_content: specialization_merged_content || null,

      salary_graph_title: salary_graph_title || null,
      salary_graph_value: salary_graph_value || null,

      specialisation_graph_title: specialisation_graph_title || null,
      specialisation_graph_value: specialisation_graph_value || null,
    };


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
        // Get university IDs from specialisationProgram
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
                    ...clickPickRecord.specialisationProgram,
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

    /**
     * 2️⃣ CATEGORY_ID PROVIDED → FETCH PROGRAMS WITH UNIVERSITIES
     */
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

      // Fetch universities for each program using their university_id arrays
      const formattedPrograms = await Promise.all(
        programs.map(async (program) => {
          let universities = [];
          if (program.university_id && program.university_id.length > 0) {
            universities = await prisma.University.findMany({
              where: {
                id: {
                  in: program.university_id.map(id => Number(id))
                },
                deleted_at: null,
              },
              select: {
                id: true,
                name: true,
                icon: true,
              },
              orderBy: {
                name: 'asc'
              }
            });

            // Sort universities to match the order in university_id array
            universities.sort((a, b) => {
              const indexA = program.university_id.indexOf(a.id);
              const indexB = program.university_id.indexOf(b.id);
              return indexA - indexB;
            });
          }

          return {
            id: program.id,
            title: program.title,
            bannerImage: program.bannerImage,
            slug: program.slug,
            university_id: program.university_id || [],
            universities: universities,
            totalUniversities: universities.length,
            // Include other fields you might need
            icon: program.icon || null, // If you have icon field
            n_icon_path: program.n_icon_path || null // If you have n_icon_path
          };
        })
      );


      return successResponse(
        res,
        "Programs fetched successfully with universities",
        200,
        formattedPrograms
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

      // Fetch universities for the program
      let programUniversities = [];
      if (program.university_id && program.university_id.length > 0) {
        programUniversities = await prisma.University.findMany({
          where: {
            id: {
              in: program.university_id.map(id => Number(id))
            },
            deleted_at: null,
              },
          select: {
            id: true,
            name: true,
            icon: true,
          }
        });

        // Sort by university_id array order
        programUniversities.sort((a, b) => {
          const indexA = program.university_id.indexOf(a.id);
          const indexB = program.university_id.indexOf(b.id);
          return indexA - indexB;
        });
      }

      // Fetch universities for each specialization
      const formattedSpecialisations = await Promise.all(
        specialisations.map(async (spec) => {
          let specUniversities = [];
          
          if (spec.university_id && spec.university_id.length > 0) {
            specUniversities = await prisma.University.findMany({
              where: {
                id: {
                  in: spec.university_id.map(id => Number(id))
                },
                deleted_at: null,
              },
              select: {
                id: true,
                name: true,
                icon: true,
              }
            });

            // Sort by university_id array order
            specUniversities.sort((a, b) => {
              const indexA = spec.university_id.indexOf(a.id);
              const indexB = spec.university_id.indexOf(b.id);
              return indexA - indexB;
            });
          }

          return {
            id: spec.id,
            title: spec.title,
            description: spec.description,
            bannerImage: spec.bannerImage,
            slug: spec.slug,
            university_id: spec.university_id || [],
            universities: specUniversities,
            totalUniversities: specUniversities.length
          };
        })
      );

      // Format response
      const responseData = {
        program: {
          id: program.id,
          title: program.title,
          universities: programUniversities,
          totalUniversities: programUniversities.length
        },
        specialisations: formattedSpecialisations
      };

      return successResponse(
        res,
        "Specializations fetched successfully with universities",
        200,
        responseData
      );
    }
  } catch (error) {
    console.error("Error in GetClickPickListData:", error);
    return errorResponse(res, error.message, 500);
  }
});