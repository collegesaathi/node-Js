const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const prisma = require("../config/prisma");
const catchAsync = require("../utils/catchAsync");
const { successResponse, errorResponse } = require("../utils/ErrorHandling");
const deleteUploadedFiles = require("../utils/fileDeleter");
const Loggers = require("../utils/Logger");


exports.UploadImage = catchAsync(async (req, res) => {
  try {

    if (!req.files || req.files.length === 0) {
      return errorResponse(res, "No image uploaded", 400);
    }

    const file = req.files[0];

    const originalPath = file.path;
    const fileName = file.filename;

    const compressedDir = path.join(
      process.cwd(),
      "public/uploads/Imageuploads/compressed"
    );

    fs.mkdirSync(compressedDir, { recursive: true });

    const compressedPath = path.join(compressedDir, fileName);

    const image = sharp(originalPath);
    const metadata = await image.metadata();

    // 👇 Detect original format
    const format = metadata.format;

    let pipeline = image;

    switch (format) {
      case "jpeg":
      case "jpg":
        pipeline = pipeline.jpeg({ quality: 60 });
        break;

      case "png":
        pipeline = pipeline.png({ quality: 60, compressionLevel: 9 });
        break;

      case "webp":
        pipeline = pipeline.webp({ quality: 60 });
        break;

      case "avif":
        pipeline = pipeline.avif({ quality: 50 });
        break;

      case "tiff":
        pipeline = pipeline.tiff({ quality: 60 });
        break;

      default:
        // fallback (keeps original format)
        break;
    }

    await pipeline.toFile(compressedPath);

    return successResponse(res, "Image uploaded successfully", 200, {
      originalImage: `/uploads/Imageuploads/original/${fileName}`,
      compressedImage: `/uploads/Imageuploads/compressed/${fileName}`,
      format: format
    });

  } catch (error) {

    console.error(error);

    if (req.files?.length) {
      deleteUploadedFiles([req.files[0].path]);
    }

    return errorResponse(res, "Failed to upload image", 500);
  }
});