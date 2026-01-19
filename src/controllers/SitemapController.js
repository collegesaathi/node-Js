const prisma = require("../config/prisma");
const catchAsync = require("../utils/catchAsync");
const { successResponse, errorResponse, validationErrorResponse } = require("../utils/ErrorHandling");
const Loggers = require("../utils/Logger");


// Get Sitemap Controller Logic
exports.GetSitemap = catchAsync(async (req, res) => {
    try {
        // Your logic to generate or fetch the sitemap
        const [universities, programs] = await Promise.all([
            prisma.university.findMany({
                where: { deleted_at: null },
                select: {
                    slug: true,
                    courses: {
                        where: { deleted_at: null },
                        select: {
                            slug: true,
                            specialisation: {
                                where: { deleted_at: null },
                                select: { slug: true },
                            },
                        },
                    },
                },
            }),

            prisma.program.findMany({
                where: { deleted_at: null },
                select: {
                    slug: true,
                    specialisationPrograms: {
                        where: { deleted_at: null },
                        select: { slug: true },
                    },
                },
            }),
        ]);

        /* -------- GROUP UNIVERSITIES -------- */

        const universityTree = universities.map(university => ({
            slug: university.slug,
            url: `/university/${university.slug}`,
            courses: university.courses.map(course => ({
                slug: course.slug,
                url: `/university/${university.slug}/${course.slug}`,
                specialisations: course.specialisation.map(spec => ({
                    slug: spec.slug,
                    url: `/university/${university.slug}/${course.slug}/${spec.slug}`,
                })),
            })),
        }));

        /* -------- GROUP PROGRAMS -------- */

        const programTree = programs.map(program => ({
            slug: program.slug,
            url: `/program/${program.slug}`,
            specialisations: program.specialisationPrograms.map(spec => ({
                slug: spec.slug,
                url: `/program/${program.slug}/${spec.slug}`,
            })),
        }));

        res.json({
            universities: universityTree,
            programs: programTree,
        });
    } catch (error) {
        if (error.code === "P2025") {
        return errorResponse(res, "Not found", 404);
        }

        return errorResponse(res, error.message, 500);
    }
});