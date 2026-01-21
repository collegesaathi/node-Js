const { errorResponse, successResponse, validationErrorResponse } = require("../utils/ErrorHandling");
const prisma = require("../config/prisma");
const catchAsync = require("../utils/catchAsync");


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


