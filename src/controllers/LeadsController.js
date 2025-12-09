const { errorResponse, successResponse, validationErrorResponse } = require("../utils/ErrorHandling");
const prisma = require("../config/prisma");
const catchAsync = require("../utils/catchAsync");


exports.LeadsAdd = catchAsync(async (req, res) => {
    try {
        const { name, email, phone_number, course_id, state, city, content, university_id } = req.body;

        const data = {
            name,
            email,
            phone_number,
            state,
            city,
            content
        };

        // Add relations only if IDs are provided
        if (university_id) {
            data.university = { connect: { id: Number(university_id) } };
        }

        if (course_id) {
            data.course = { connect: { id: Number(course_id) } };
        }

        const record = await prisma.Leads.create({ data });

        return successResponse(res, "Leads added successfully", 201, record);

    } catch (error) {
        console.log("Create Leads Error:", error);
        return errorResponse(res, error.message, 500);
    }
});


exports.LeadsGet = catchAsync(async (req, res) => {
  try {
    let leads = await prisma.Leads.findMany({
      orderBy: { created_at: "asc" },
      include: {
        university: {
          select: { id: true, name: true, slug: true }
        },
        course: {
          select: { id: true, name: true, slug: true }
        }
      }
    });

    return successResponse(res, "Leads fetched successfully", 200, leads);

  } catch (error) {
    console.log("Leads Get Error:", error);
    return errorResponse(res, error.message, 500);
  }
});


exports.allLeadsUniversities = catchAsync(async (req, res) => {
  // Pagination
  const universities = await prisma.university.findMany({
  });

  if (!universities) {
    return errorResponse(res, "Failed to fetch universities", 500);
  }
  return successResponse(res, "Universities fetched successfully", 201, {
    universities,
  });
});