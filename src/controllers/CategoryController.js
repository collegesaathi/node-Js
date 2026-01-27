const { errorResponse, successResponse, validationErrorResponse } = require("../utils/ErrorHandling");
const prisma = require("../config/prisma");
const catchAsync = require("../utils/catchAsync");
const deleteUploadedFiles = require("../utils/fileDeleter");

function toPublicUrl(req, filePath) {
    if (!filePath) return null;
    const normalized = filePath.replace(/\\/g, "/");
    const index = normalized.indexOf("/uploads/");
    if (index === -1) return null;
    const cleanPath = normalized.substring(index);
    const protocol = req.headers["x-forwarded-proto"] === "https" ? "https" : "https";
    const BASE_URL = `${protocol}://${req.get("host")}`;
    return BASE_URL + cleanPath;
}


exports.List = catchAsync(async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            where: { deleted_at: null },
            orderBy: { id: 'desc' }
        });
        return successResponse(req, res, "Categories fetched successfully", categories);
    } catch (error) {
        return errorResponse(res, error.message, 500);

    }
});

exports.ListId = catchAsync(async (req, res) => {
    try {
        const categories = await prisma.category.findFirst({

            where: {
                deleted_at: null,
                id: Number(req.params.id)
            },
            orderBy: { id: 'desc' }
        });
        return successResponse(res, "Login successful", 200, categories);
    } catch (error) {
        return errorResponse(res, error.message, 500);

    }
});

exports.addCategory = catchAsync(async (req, res) => {
    try {

        const uploadedFiles = {};
        req.files?.forEach(file => {
            uploadedFiles[file.fieldname] = file.path;
        });
        const { name, short_title } = req.body;
        const icon = toPublicUrl(req, uploadedFiles["icon"]) || req.body.icon || null;

        // 1️⃣ Basic validation
        if (!name) {
            return errorResponse(res, "Category name is required", 400);
        }

        // 2️⃣ Check if category already exists (not deleted)
        const existingCategory = await prisma.category.findFirst({
            where: {
                name: {
                    equals: name,
                    mode: "insensitive",
                },
                deleted_at: null,
            },
        });

        if (existingCategory) {
            return errorResponse(res, "Category already exists", 409);
        }

        // 3️⃣ Create category
        const category = await prisma.category.create({
            data: {
                name,
                short_title,
                icon: icon,
            },
        });

        // 4️⃣ Success response
        return successResponse(
            res,
            "Category added successfully",
            201,
            category
        );

    } catch (error) {
        if (uploadedFiles["icon"]) {
            fs.unlink(uploadedFiles["icon"], () => { });
        }
        console.error("Add Category Error:", error);
        return errorResponse(res, error.message, 500);
    }
});

exports.editCategory = catchAsync(async (req, res) => {
    try {
        const { id } = req.params;
        const category = await prisma.category.findUnique({
            where: { id: parseInt(id) },
        });
        if (!category) {
            return errorResponse(req, res, "Category not found", 404);
        }
        return successResponse(req, res, "Category fetched successfully", category);
    }
    catch (error) {
        return errorResponse(req, res, "Failed to fetch category", error);
    }
});

exports.updateCategory = catchAsync(async (req, res) => {
    let uploadedFiles = {};

    try {
        const { id } = req.body;
        const { name, short_title, slug } = req.body;

        const existing = await prisma.category.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existing) {
            return errorResponse(res, "Category not found", 404);
        }

        req.files?.forEach(file => {
            uploadedFiles[file.fieldname] = file.path;
        });

        const dataToUpdate = {};

        if (name !== undefined) dataToUpdate.name = name;
        if (short_title !== undefined) dataToUpdate.short_title = short_title;
        if (slug !== undefined) dataToUpdate.slug = slug;


        let newIcon = existing.icon;

        if (uploadedFiles.icon) {
            newIcon = toPublicUrl(req, uploadedFiles.icon);
            dataToUpdate.icon = newIcon;
        }

        const category = await prisma.category.update({
            where: { id: parseInt(id) },
            data: dataToUpdate,
        });

        if (uploadedFiles.icon && existing.icon) {
            deleteUploadedFiles([existing.icon]);
        }

        return successResponse(
            res,
            "Category updated successfully",
            200,
            category
        );

    } catch (error) {
        console.error("Update Category Error:", error);

        // Cleanup uploaded file if update fails
        if (uploadedFiles.icon) {
            require("fs").unlink(uploadedFiles.icon, () => { });
        }

        return errorResponse(res, "Failed to update category", 500, error);
    }
});

exports.deleteCategory = catchAsync(async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return validationErrorResponse(res, "Category ID is required", 400);
        }
        const existingcategory = await prisma.category.findUnique({
            where: {
                id: parseInt(id),
            }
        });
        if (!existingcategory) {
            return validationErrorResponse(res, "Category not found", 404);
        }
        let updatedRecord;
        if (existingcategory.deleted_at) {
            updatedRecord = await prisma.category.update({
                where: { id: parseInt(id) },
                data: { deleted_at: null }
            });

            return successResponse(res, "Category restored successfully", 200, updatedRecord);
        }

        updatedRecord = await prisma.category.update({
            where: { id: parseInt(id) },
            data: { deleted_at: new Date() }
        });

        return successResponse(res, "Category deleted successfully", 200, updatedRecord);
    } catch (error) {
        if (error.code === 'P2025') {
            return errorResponse(res, "Category not found", 404);
        }
        return errorResponse(res, error.message, 500);
    }
});



exports.listcategroy = catchAsync(async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return validationErrorResponse(res, "Category ID is required", 400);
        }
        const existingcategory = await prisma.category.findFirst({
            where: {
                slug: id,
            }
        });
        const record = existingcategory.id;

        const program = await prisma.program.findMany({
            where: {
                category_id: Number(record)
            }
        })

        return successResponse(
            res,
            "Category Program List successfully",
            200,
            program
        );

    } catch (error) {
        if (error.code === 'P2025') {
            return errorResponse(res, "Category not found", 404);
        }
        return errorResponse(res, error.message, 500);
    }
})