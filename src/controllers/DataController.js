const prisma = require("../config/prisma");
const catchAsync = require("../utils/catchAsync");
const { successResponse, errorResponse, validationErrorResponse } = require("../utils/ErrorHandling");



exports.DeleteCourseBySlug = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;

    if (!slug) {
      return errorResponse(res, "Course slug is required", 400);
    }


  const record =   await prisma.Course.delete({
      where: {
        id: Number(id),
      },
    });

    return successResponse(
      res,
      "Course permanently deleted successfully",
      200 ,
      record
    );
  } catch (error) {
    console.error("DeleteCourseBySlug error:", error);
    return errorResponse(
      res,
      error.message || "Error deleting course",
      500,
      error
    );
  }
});

exports.DeleteUniversityBySlug = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return errorResponse(res, "University ID is required", 400);
    }

    const universityId = Number(id);

    // 1️⃣ Delete all one-to-many related tables
    await prisma.Course.deleteMany({ where: { universityId } });
    await prisma.Specialisation.deleteMany({ where: { universityId } });
    await prisma.Blog.deleteMany({ where: { universityId } });
    await prisma.leads.deleteMany({ where: { universityId } });
    await prisma.Review.deleteMany({ where: { universityId } });
    await prisma.Rankings.deleteMany({ where: { universityId } });
    await prisma.Partners.deleteMany({ where: { universityId } });
    await prisma.Services.deleteMany({ where: { universityId } });
    await prisma.Certificates.deleteMany({ where: { universityId } });
    await prisma.ExamPatterns.deleteMany({ where: { universityId } });
    await prisma.Facts.deleteMany({ where: { universityId } });
    await prisma.Faq.deleteMany({ where: { universityId } });
    await prisma.FinancialAid.deleteMany({ where: { universityId } });
    
    // 2️⃣ Delete one-to-one related tables
    await prisma.About.deleteMany({ where: { universityId } });
    await prisma.AdmissionProcess.deleteMany({ where: { universityId } });
    await prisma.Advantages.deleteMany({ where: { universityId } });
    await prisma.Approvals_Management.deleteMany({ where: { universityId } });
    await prisma.UniversityCampus.deleteMany({ where: { universityId } });
    await prisma.Seo.deleteMany({ where: { universityId } });

    // 3️⃣ Finally, delete the university itself
    const record = await prisma.University.delete({
      where: { id: universityId },
    });

    return successResponse(
      res,
      "University and all related data deleted successfully",
      200,
      record
    );
  } catch (error) {
    console.error("DeleteUniversityBySlug error:", error);
    return errorResponse(
      res,
      error.message || "Error deleting university",
      500,
      error
    );
  }
});



exports.GenraixcalSpecialisationProgramDeelte = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return errorResponse(res, "University slug is required", 400);
    }


    // 🔥 PERMANENT DELETE
   const record =  await prisma.SpecialisationProgram.delete({
      where: {
        id: Number(id),
      },
    });

    return successResponse(
      res,
      "University permanently deleted successfully",
      200 ,
      record
    );
  } catch (error) {
    console.error("DeleteUniversityBySlug error:", error);
    return errorResponse(
      res,
      error.message || "Error deleting university",
      500,
      error
    );
  }
});


exports.ProgramGenraic = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return errorResponse(res, "University slug is required", 400);
    }


    // 🔥 PERMANENT DELETE
   const record =  await prisma.Program.delete({
      where: {
        id: Number(id),
      },
    });

    return successResponse(
      res,
      "Program Genraic permanently deleted successfully",
      200 ,
      record
    );
  } catch (error) {
    console.error("DeleteUniversityBySlug error:", error);
    return errorResponse(
      res,
      error.message || "Error deleting university",
      500,
      error
    );
  }
});


exports.SpecialisationDelete = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return errorResponse(res, "University slug is required", 400);
    }


    // 🔥 PERMANENT DELETE
   const record =  await prisma.Specialisation.delete({
      where: {
        id: Number(id),
      },
    });

    return successResponse(
      res,
      "Specialisation permanently deleted successfully",
      200 ,
      record
    );
  } catch (error) {
    console.error("DeleteUniversityBySlug error:", error);
    return errorResponse(
      res,
      error.message || "Error deleting university",
      500,
      error
    );
  }
});
