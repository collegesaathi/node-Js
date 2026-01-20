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
    console.log("addRecords,", req.body);
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
    const id = Number(req.params.id);
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
    console.log("error" ,error)
    return errorResponse(res, error.message, 500);
  }
});

exports.GetClickpickData = catchAsync(async (req, res) => {
    try {
        const {
            category_id,
            program_id,
            specialisation_program_id
        } = req.query;

        // Build dynamic where condition
        const whereCondition = {
            deleted_at: null
        };

        if (category_id) {
            whereCondition.category_id = Number(category_id);
        }

        if (program_id) {
            whereCondition.program_id = Number(program_id);
        }

        if (specialisation_program_id) {
            whereCondition.specialisation_program_id = Number(specialisation_program_id);
        }

        // Optional: prevent empty query (recommended)
        if (
            !category_id &&
            !program_id &&
            !specialisation_program_id
        ) {
            return errorResponse(
                res,
                "At least one ID (category_id, program_id, or specialisation_program_id) is required",
                400
            );
        }

        const records = await prisma.ClickPick.findMany({
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

        return successResponse(
            res,
            "ClickPick records fetched successfully",
            200,
            records
        );

    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
});

