const prisma = require("../config/prisma");
const catchAsync = require("../utils/catchAsync");
const { successResponse, errorResponse, validationErrorResponse } = require("../utils/ErrorHandling");
const Logger = require("../utils/Logger");

exports.AddCourse = catchAsync(async (req, res) => {
    try {
        const Universitydata = await prisma.University.create({
            data: {
                name: finalData.name || "Untitled",
                cover_image: finalData.cover_image,
                position: Number(finalData.position || 0),
                description: finalData.descriptions, // Prisma field should be Json? or String[] depending on schema
                icon: finalData.icon,
                slug: finalData.slug,
            }
        });
        const addcourse = await prisma.Course.create({
            data: {
                name: req.body.name,
                description: req.body.description,
                slug: req.body.slug,
            }
        })
    } catch (error) {
        console.log("catchAsync", error)
    }
})