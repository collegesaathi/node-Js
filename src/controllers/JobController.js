const { errorResponse, successResponse, validationErrorResponse } = require("../utils/ErrorHandling");
const prisma = require("../config/prisma");
const catchAsync = require("../utils/catchAsync");


exports.JobAdd = catchAsync(async (req, res) => {
  try {
    const {
      job_title,
      description,
      skill,
      education,
      work_experience,
      work_location,
      job_type,
      is_active,
    } = req.body;

    const data = {
      job_title,
      description,
      skill,
      education,
      work_experience,
      work_location,
      job_type,
      is_active: is_active ?? true,
    };

    const record = await prisma.job.create({ data });

    return successResponse(res, "Job added successfully", 201, record);
  } catch (error) {
    console.error("Job Add Error:", error);
    return errorResponse(res, error.message, 500);
  }
});


exports.JobGetAll = catchAsync(async (req, res) => {
  try {
    const records = await prisma.job.findMany({
      where: { is_active: true },
      orderBy: { created_at: "desc" },
    });

    return successResponse(res, "Jobs fetched successfully", 200, records);
  } catch (error) {
    console.error("Job Get Error:", error);
    return errorResponse(res, error.message, 500);
  }
});


exports.JobGetById = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;

    const record = await prisma.job.findUnique({
      where: { id: Number(id) },
    });

    if (!record) {
      return errorResponse(res, "Job not found", 404);
    }

    return successResponse(res, "Job fetched successfully", 200, record);
  } catch (error) {
    console.error("Job Get By ID Error:", error);
    return errorResponse(res, error.message, 500);
  }
});


exports.JobUpdate = catchAsync(async (req, res) => {
  try {
    const { id } = req.body;

    const record = await prisma.job.update({
      where: { id: Number(id) },
      data: req.body,
    });

    return successResponse(res, "Job updated successfully", 200, record);
  } catch (error) {
    console.error("Job Update Error:", error);
    return errorResponse(res, error.message, 500);
  }
});



exports.JobDelete = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return validationErrorResponse(res, "job ID is required", 400);
    }
    const existingcourse = await prisma.job.findUnique({
      where: {
        id: parseInt(id),
      }
    });
    if (!existingcourse) {
      return validationErrorResponse(res, "job not found", 404);
    }
    let updatedRecord;
    if (existingcourse.deleted_at) {
      updatedRecord = await prisma.job.update({
        where: { id: parseInt(id) },
        data: { deleted_at: null }
      });

      return successResponse(res, "job restored successfully", 200, updatedRecord);
    }

    updatedRecord = await prisma.job.update({
      where: { id: parseInt(id) },
      data: { deleted_at: new Date() }
    });

    return successResponse(res, "job deleted successfully", 200, updatedRecord);
  } catch (error) {
    if (error.code === 'P2025') {
      return errorResponse(res, "job not found", 404);
    }
    return errorResponse(res, error.message, 500);
  }
});
