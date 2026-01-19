const { errorResponse, successResponse, validationErrorResponse } = require("../utils/ErrorHandling");
const prisma = require("../config/prisma");
const catchAsync = require("../utils/catchAsync");
const e = require("express");


exports.addRecords = catchAsync(async (req, res) => {
    try {
        const body = req.body;

        /**
         * Safe JSON parser
         * Accepts object OR JSON string
         */
        const parseJSON = (value) => {
            if (value === undefined) return undefined; 
            if (value === null) return undefined;
            if (typeof value === "object") return value;

            try {
                return JSON.parse(value);
            } catch {
                throw new Error("Invalid JSON format in request body");
            }
        };

        /**
        * Build data dynamically
        * Only include fields that actually exist
        */
        const data = {
            category_id: body.category_id ? Number(body.category_id) : null,
            program_id: body.program_id ? Number(body.program_id) : null,
            specialisation_program_id: body.specialisation_program_id ? Number(body.specialisation_program_id) : null,

            title: body.title ?? null,
            description: parseJSON(body.description),

            graph_title: body.graph_title ?? null,
            graph_value: parseJSON(body.graph_value),

            rounded_graph_title: body.rounded_graph_title ?? null,
            rounded_graph_desc: parseJSON(body.rounded_graph_desc),

            bottom_title: body.bottom_title ?? null,
            bottom_description: parseJSON(body.bottom_description),

            specilisation_merged_desc: parseJSON(body.specilisation_merged_desc),

            salary_graph_title: body.salary_graph_title ?? null,
            salary_graph_value: parseJSON(body.salary_graph_value)
        };

        /**
        * Optional cleanup:
        * Remove undefined keys so Prisma stays clean
        */
        Object.keys(data).forEach(
            (key) => data[key] === undefined && delete data[key]
        );

        const record = await prisma.ClickPick.create({ data });

        return successResponse( res, "ClickPick record created successfully", 200, record,);
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
});

exports.GetClickpickById = catchAsync(async (req, res) => {
    try {
        const { id } = req.params;

        const record = await prisma.ClickPick.findUnique({
            where: { id: Number(id) },
        });
        return successResponse(
            res,
            "ClickPick record fetched successfully",
            200,
            record,
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

    const body = req.body;

    /**
     * Safe JSON parser
     * - undefined → ignore field
     * - object → accept
     * - string → JSON.parse
     */
    const parseJSON = (value) => {
      if (value === undefined) return undefined;
      if (value === null) return undefined;
      if (typeof value === "object") return value;

      try {
        return JSON.parse(value);
      } catch {
        throw new Error("Invalid JSON format in request body");
      }
    };

    /**
     * Check if record exists
     */
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
    const data = {
      category_id:
        body.category_id !== undefined ? Number(body.category_id) : undefined,

      program_id:
        body.program_id !== undefined ? Number(body.program_id) : undefined,

      specialisation_program_id:
        body.specialisation_program_id !== undefined
          ? Number(body.specialisation_program_id)
          : undefined,

      title: body.title !== undefined ? body.title : undefined,
      description: parseJSON(body.description),

      graph_title:
        body.graph_title !== undefined ? body.graph_title : undefined,
      graph_value: parseJSON(body.graph_value),

      rounded_graph_title:
        body.rounded_graph_title !== undefined
          ? body.rounded_graph_title
          : undefined,
      rounded_graph_desc: parseJSON(body.rounded_graph_desc),

      bottom_title:
        body.bottom_title !== undefined ? body.bottom_title : undefined,
      bottom_description: parseJSON(body.bottom_description),

      specilisation_merged_desc: parseJSON(body.specilisation_merged_desc),

      salary_graph_title:
        body.salary_graph_title !== undefined
          ? body.salary_graph_title
          : undefined,
      salary_graph_value: parseJSON(body.salary_graph_value)
    };

    /**
     * OPTIONAL:
     * Prevent clearing relations accidentally
     * (comment this in only if you want strict behavior)
     */
    // delete data.category_id;
    // delete data.program_id;
    // delete data.specialisation_program_id;

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

