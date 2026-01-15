const prisma = require("../config/prisma");
const catchAsync = require("../utils/catchAsync");
const { successResponse, errorResponse, validationErrorResponse } = require("../utils/ErrorHandling");
const deleteUploadedFiles = require("../utils/fileDeleter");
const Loggers = require("../utils/Logger");


const makeSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
};

const generateUniqueSlug = async (prisma, title) => {
  let baseSlug = makeSlug(title);
  let slug = baseSlug;
  let counter = 1;

  // Already existing slugs load
  const existingSlugs = await prisma.Program.findMany({
    where: {
      slug: {
        startsWith: baseSlug,
      },
    },
    select: { slug: true },
  });

  // Unique slug find karna
  while (existingSlugs.some((item) => item.slug === slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

// Convert Windows Path to Public URL
function toPublicUrl(req, filePath) {
  if (!filePath) return null;

  // ✅ Agar array hai, first file le lo
  if (Array.isArray(filePath)) {
    filePath = filePath[0];
  }

  if (typeof filePath !== "string") return null;

  const normalized = filePath.replace(/\\/g, "/");
  const index = normalized.indexOf("/uploads/");
  if (index === -1) return null;

  const cleanPath = normalized.substring(index);

  const protocol =
    req.headers["x-forwarded-proto"] === "https" ? "https" : "https";
  return `${protocol}://${req.get("host")}${cleanPath}`;
}


// Parse JSON safely (returns array or empty array)
function parseArray(jsonString) {
  if (!jsonString) return [];
  try {
    return typeof jsonString === "string" ? JSON.parse(jsonString) : jsonString || [];
  } catch (err) {
    return [];
  }
}

// Extract file arrays like uploadedFiles["servicesimages[0]"] -> arr[0] = filePath
function mapUploadedArray(req, uploadedFiles, baseKey) {
  const result = [];

  Object.keys(uploadedFiles).forEach((fieldname) => {
    if (fieldname.startsWith(baseKey)) {
      const match = fieldname.match(/\[(\d+)\]/);
      if (match) {
        const index = Number(match[1]);
        result[index] = toPublicUrl(req, uploadedFiles[fieldname]);
      }
    }
  });

  return result;
}

function attachImagesToItems(newItems, uploadedImages, key, existingItems = []) {
  return newItems?.map((item, index) => {
    const newImage = uploadedImages[index];
    const oldImage = existingItems[index]?.[key];

    // अगर नई image upload हुई है तो पुरानी delete कर दो
    if (newImage && oldImage) {
      deleteUploadedFiles(oldImage);
    }

    return {
      ...item,
      [key]: newImage || oldImage || null,
    };
  });
}


exports.adminaddSpecialisationProgram = catchAsync(async (req, res) => {
    const uploadedFiles = {};

    req.files?.forEach(file => {
        if (!uploadedFiles[file.fieldname]) {
            uploadedFiles[file.fieldname] = [];
        }
        uploadedFiles[file.fieldname].push(file.path);
    });
        Loggers.http(req.body)
        Loggers.http(uploadedFiles)
        return false;

    try {

    } catch (error) {
    console.error("❌ AddSpecialisationProgram ERROR =====================");
    console.error(error);
    console.error("❌ ERROR MESSAGE:", error.message);
    console.error("❌ ERROR STACK:", error.stack);
    console.error("❌ PRISMA META:", error?.meta);
    console.error("❌ ERROR CODE:", error?.code);
    console.error("❌ REQUEST BODY:", req.body);
    console.error("❌ UPLOADED FILES:", uploadedFiles);
    console.error("========================================");

    // Prisma unique constraint
    if (error.code === "P2002") {
      return errorResponse( res, `Duplicate field value: ${error.meta?.target?.join(", ")}`, 400 );
    }

    // Prisma validation errors
    if (error.code === "P2009" || error.code === "P2010") {
      return errorResponse(res, error.message, 400);
    }

    return errorResponse( res, error.message || "Internal Server Error", 500 );
  }
});