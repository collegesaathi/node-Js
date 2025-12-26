const prisma = require("../config/prisma");
const catchAsync = require("../utils/catchAsync");
const { successResponse, errorResponse, validationErrorResponse } = require("../utils/ErrorHandling");
const deleteUploadedFiles = require("../utils/fileDeleter");

exports.ApprovalAdd = catchAsync(async (req, res) => {
    try {
        const { title } = req.body;

        let image = null;
        if (req.file && req.file.filename) {
            const baseUrl = `${req.protocol}://${req.get("host")}`;
            image = `${baseUrl}/uploads/approvals/${req.file.filename}`;
        }
        const approval = await prisma.Approvals.create({
            data: {
                title,
                image
            }
        });
        return successResponse(res, "Approval added successfully", 201, approval);

    } catch (error) {
        console.log("Create Approval Error:", error);
        return errorResponse(res, error.message, 500);
    }
});

exports.ApprovalEdit = catchAsync(async (req, res) => {
    try {
        const { id, title } = req.body;
        // 1️⃣ Approval exists?
        const approval = await prisma.Approvals.findUnique({
            where: { id: Number(id) }
        });

        if (!approval) {
            return res.status(404).json({ message: "Approval not found" });
        }

        let image = approval.image;

        // 2️⃣ If new image uploaded
        if (req.file && req.file.filename) {
            // Delete old image if exists
            if (approval.image) {
                try {
                    await deleteUploadedFiles([approval.image]);
                } catch (err) {
                    console.log("Failed to delete old image:", err.message);
                }
            }
            const baseUrl = `${req.protocol}://${req.get("host")}`;
            image = `${baseUrl}/uploads/approvals/${req.file.filename}`;
        }

        // 3️⃣ Update record in Prisma
        const updatedApproval = await prisma.Approvals.update({
            where: { id: Number(id) },
            data: {
                title,
                image
            }
        });

        return res.status(200).json({
            message: "Approval updated successfully",
            approval: updatedApproval
        });

    } catch (error) {
        console.log("Error updating approval:", error);
        return errorResponse(res, "Approval not found", 404);
    }
});

exports.PlacementAdd = catchAsync(async (req, res) => {
    try {
        const { title } = req.body;

        let image = null;
        if (req.file && req.file.filename) {
            // Generate correct URL
            const baseUrl = `${req.protocol}://${req.get("host")}`;
            image = `${baseUrl}/uploads/placements/${req.file.filename}`;

        } else {
            console.log("No file uploaded or filename missing");
        }

        // Create placement record
        const placement = await prisma.placements.create({
            data: {
                title: title || "Untitled Placement",
                image: image
            }
        });


        return successResponse(res, "Placement added successfully", 201, placement);

    } catch (error) {
        // Handle specific Prisma errors
        if (error.code === 'P2002') {
            return errorResponse(res, "Duplicate entry found", 400);
        }
        if (error.code === 'P2003') {
            return errorResponse(res, "Foreign key constraint failed", 400);
        }

        return errorResponse(res, "Failed to add placement: " + error.message, 500);
    }
});

exports.PlacementEdit = catchAsync(async (req, res) => {
    try {
        const { id, title } = req.body;
        // 1️⃣ Approval exists?
        const Placement = await prisma.placements.findUnique({
            where: { id: Number(id) }
        });

        if (!Placement) {
            return res.status(404).json({ message: "Placement not found" });
        }

        let image = Placement.image;

        // 2️⃣ If new image uploaded
        if (req.file && req.file.filename) {
            // Delete old image if exists
            if (Placement.image) {
                try {
                    await deleteUploadedFiles([Placement.image]);
                } catch (err) {
                    console.log("Failed to delete old image:", err.message);
                }
            }
            const baseUrl = `${req.protocol}://${req.get("host")}`;
            image = `${baseUrl}/uploads/placements/${req.file.filename}`;
        }

        // 3️⃣ Update record in Prisma
        const updatedPlacement = await prisma.placements.update({
            where: { id: Number(id) },
            data: {
                title,
                image
            }
        });
        return successResponse(res, "Placement updated successfully", 200, updatedPlacement);


    } catch (error) {
        console.log("Error updating approval:", error);
        return errorResponse(res, "Approval not found", 404);
    }
});


exports.ApprovalSoftDelete = catchAsync(async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return errorResponse(res, "Approval ID is required", 400);
        }
        const existingApproval = await prisma.Approvals.findUnique({
            where: {
                id: parseInt(id),
            }
        });

        if (!existingApproval) {
            return errorResponse(res, "Approval not found", 404);
        }

        let updatedRecord;

        if (existingApproval.deleted_at) {
            updatedRecord = await prisma.Approvals.update({
                where: { id: parseInt(id) },
                data: { deleted_at: null }
            });

            return successResponse(res, "Approval restored successfully", 200, updatedRecord);
        }

        updatedRecord = await prisma.Approvals.update({
            where: { id: parseInt(id) },
            data: { deleted_at: new Date() }
        });

        return successResponse(res, "Approval deleted successfully", 200, updatedRecord);

    } catch (error) {
        console.log("Soft Delete Error:", error);

        if (error.code === 'P2025') {
            return errorResponse(res, "Approval not found", 404);
        }

        return errorResponse(res, error.message, 500);
    }
});


exports.PlacementSoftDelete = catchAsync(async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return errorResponse(res, "Placement ID is required", 400);
        }

        const existingPlacements = await prisma.placements.findUnique({
            where: {
                id: parseInt(id),
            }
        });

        if (!existingPlacements) {
            return errorResponse(res, "Placement not found", 404);
        }

        let updatedRecord;

        if (existingPlacements.deleted_at) {
            updatedRecord = await prisma.placements.update({
                where: { id: parseInt(id) },
                data: {
                    deleted_at: null
                }
            });
            return successResponse(res, "Placement restored successfully", 200, updatedRecord);
        }
        else {
            // If not deleted -> soft delete now
            updatedRecord = await prisma.placements.update({
                where: { id: parseInt(id) },
                data: {
                    deleted_at: new Date()
                }
            });
            return successResponse(res, "Placement deleted successfully", 200, updatedRecord);
        }

    } catch (error) {
        console.log("Soft Delete Error:", error);

        if (error.code === 'P2025') {
            return errorResponse(res, "Placement not found", 404);
        }

        return errorResponse(res, error.message, 500);
    }
});


exports.ApprovalandPlacements = catchAsync(async (req, res) => {
    // --- Fetch Approvals ---
    let approvals = await prisma.approvals.findMany({
        orderBy: { created_at: "asc" },
    });

    if (!approvals) {
        return errorResponse(res, "Failed to fetch approvals", 500);
    }
    // --- Fetch Placements ---
    let placements = await prisma.placements.findMany({
        orderBy: { created_at: "asc" },
    });

    if (!placements) {
        return errorResponse(res, "Failed to fetch placements", 500);
    }
    return successResponse(res, "Admin university data fetched successfully", 200, {
        approvals,
        placements,
    });
});