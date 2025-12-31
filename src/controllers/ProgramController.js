const prisma = require("../config/prisma");
const catchAsync = require("../utils/catchAsync");
const { successResponse, errorResponse, validationErrorResponse } = require("../utils/ErrorHandling");
const Logger = require("../utils/Logger");
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
  const normalized = filePath.replace(/\\/g, "/");
  const index = normalized.indexOf("/uploads/");
  if (index === -1) return null;
  const cleanPath = normalized.substring(index);
  const BASE_URL = `${req.protocol}://${req.get("host")}`;
  return BASE_URL + cleanPath;
}

// Parse JSON safely (returns array or empty array)
function parseArray(jsonString) {
  if (!jsonString) return [];
  try {
    return typeof jsonString === "string" ? JSON.parse(jsonString) : jsonString;
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

// Program Add Controller Logic
exports.AddProgram = catchAsync(async (req, res) => {
  const uploadedFiles = {};
  req.files?.forEach(file => {
    uploadedFiles[file.fieldname] = file.path;
  });
  Loggers.silly(req.body)
  Loggers.silly(uploadedFiles)

return false ;
  try {
    const careerJson       = parseArray(req.body.career);
    const highlightsJson   = parseArray(req.body.Highlights);
    const entranceJson     = parseArray(req.body.Entrance);
    const institutesJson   = parseArray(req.body.Institutes);
    const placementIdsJson = parseArray(req.body.placement_ids);
    const subPlacementJson = parseArray(req.body.subplacement);
    const curriculumJson   = parseArray(req.body.curriculum);
    const feesJson         = parseArray(req.body.fees);

    if (!req.body.title) {
      return errorResponse(res, "Program title is required", 400);
    }

    const generatedSlug = await generateUniqueSlug(
      prisma,
      req.body.title
    );

    const result = await prisma.$transaction(async (tx) => {
      const program = await tx.Program.create({
        data: {
          title: req.body.title,
          slug: req.body.slug || generatedSlug,
          description: req.body.description || "",
          bannerImage: toPublicUrl(req, uploadedFiles["bannerImage"]) || "",
          bannerImageAlt: req.body.bannerImageAlt || "",
          pdfdownlaod: toPublicUrl(req, uploadedFiles["pdfdownlaod"]) || "",
          career_growth: req.body.career_growth || "",
          duration: req.body.duration || "",
          specialization: req.body.specialization || "",
          audio: toPublicUrl(req, uploadedFiles["audio"]) || "",
          subtitle: req.body.subtitle || "",
          shortDescription: req.body.shortDescription || "",
          video: req.body.video || "",
          universitytitle: req.body.universitytitle || "",
          universitydesc: req.body.universitydesc || "",
          universitybtmdesc: req.body.universitybtmdesc || "",
          university_id: parseArray(req.body.university_id),
          conclusion: req.body.conclusion || "",
          specialisationtitle: req.body.specialisationtitle || "",
          specialisationdesc: req.body.specialisationdesc || "",
          category_id: req.body.category_id || 1,
        },
      });

      const programId = program.id;

      await tx.ProgramAcademic.create({
        data: {
          title: req.body.academic_title || "",
          description: req.body.academic_description || "",
          Image: toPublicUrl(req, uploadedFiles["academic_image"]) || "",
          image_alt: req.body.academic_image_alt || "",
          entra_title: req.body.entra_title || "",
          entra_dsec: req.body.entra_dsec || "",
          entra_image: toPublicUrl(req, uploadedFiles["entra_image"]) || "",
          entra_image_alt: req.body.entra_image_alt || "",
          program_id: programId,
        },
      });

      await tx.ProgramCareer.create({
        data: {
          title: req.body.career_title || "",
          description: req.body.career_description || "",
          career: careerJson,
          program_id: programId,
        },
      });

      await tx.ProgramInvestment.create({
        data: {
          title: req.body.investment_title || "",
          description: req.body.investment_description || "",
          subtitle: req.body.investment_subtitle || "",
          career: parseArray(req.body.investment_career),
          program_id: programId,
        },
      });

      await tx.ProgramHighlights.create({
        data: {
          title: req.body.highlights_title || "",
          description: req.body.highlights_description || "",
          subtitle: req.body.highlights_subtitle || "",
          Highlights: highlightsJson,
          program_id: programId,
        },
      });

      await tx.ProgramEntrance.create({
        data: {
          icon: toPublicUrl(req, uploadedFiles["entrance_icon"]) || "",
          title: req.body.entrance_title || "",
          description: req.body.entrance_description || "",
          Entrance: entranceJson,
          program_id: programId,
        },
      });

      await tx.ProgramInstitutes.create({
        data: {
          icon: toPublicUrl(req, uploadedFiles["institutes_icon"]) || "",
          title: req.body.institutes_title || "",
          description: req.body.institutes_description || "",
          Institutes: institutesJson,
          program_id: programId,
        },
      });

      await tx.ProgramPlacement.create({
        data: {
          title: req.body.placement_title || "",
          description: req.body.placement_description || "",
          placement_ids: placementIdsJson,
          subtitle: req.body.placement_subtitle || "",
          Subdec: req.body.Subdec || "",
          subplacement: subPlacementJson,
          program_id: programId,
        },
      });

      await tx.ProgramCurriculum.create({
        data: {
          title: req.body.curriculum_title || "",
          description: req.body.curriculum_description || "",
          subtitle: req.body.curriculum_subtitle || "",
          placement_ids: curriculumJson,
          program_id: programId,
        },
      });

      await tx.ProgramFee.create({
        data: {
          title: req.body.fees_title || "",
          description: req.body.fees_description || "",
          descbtm: req.body.fees_descbtm || "",
          fees: feesJson,
          program_id: programId,
        },
      });

      await tx.ProgramExperience.create({
        data: {
          title: req.body.experience_title || "",
          description: req.body.experience_description || "",
          descbtm: req.body.experience_descbtm || "",
          fees: parseArray(req.body.experience_fees),
          program_id: programId,
        },
      });

      return program;
    });

    return successResponse(res, "Program added successfully", 201, result);

  } catch (error) {
    console.error("❌ AddProgram ERROR =====================");
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
        return errorResponse(
        res,
        `Duplicate field value: ${error.meta?.target?.join(", ")}`,
        400
        );
    }

    // Prisma validation errors
    if (error.code === "P2009" || error.code === "P2010") {
        return errorResponse(res, error.message, 400);
    }

    return errorResponse(
        res,
        error.message || "Internal Server Error",
        500
    );
  }
});

// Program Get By ID Controller Logic
exports.GetProgramById = catchAsync(async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return errorResponse(res, "Program slug is required", 400);
    }

    const ProgramData = await prisma.Program.findFirst({
      where: {
        slug: slug,
        // deleted_at: null,
      },
      include: {
        academic: true,
        careers: true,
        investment: true,
        highlights: true,
        entrance: true,
        institutes: true,
        placement: true,
        curriculum: true,
        fees: true,
        experience: true,
        faqs: true,
        seo: true,
      },
    });

    if (!ProgramData) {
      return errorResponse(res, "Program not found", 404);
    }
    const toArray = (val) => {
      if (!val && val !== 0) return [];
      return Array.isArray(val) ? val : [val];
    };
       // ----------- Extract partner IDs (defensively) -----------
    let placementPartnerIds = [];

    const placement = ProgramData.placement;

    // ✅ placement is a single object, not array
    if (placement?.placement_ids) {
      placementPartnerIds = Array.isArray(placement.placement_ids)
        ? placement.placement_ids
        : [placement.placement_ids];

      placementPartnerIds = [...new Set(placementPartnerIds)].filter(Boolean);
    }

    let placementPartners = [];
    if (placementPartnerIds.length > 0) {
      placementPartners = await prisma.placements.findMany({
        where: {
          id: { in: placementPartnerIds },
          deleted_at: null, // optional but recommended
        },
      });
    }
    return successResponse(
      res,
      "Program fetched successfully",
      200,
      { ProgramData, placementPartners }
    );

  } catch (error) {
    console.error("❌ GetProgramById error =====================");
    console.error(error);
    console.error("❌ ERROR MESSAGE:", error.message);
    console.error("❌ ERROR STACK:", error.stack);
    console.error("==========================================");

    return errorResponse(
      res,
      error.message || "Something went wrong while fetching program",
      500
    );
  }
});

// Program Update Controller Logic
exports.UpdateProgram = catchAsync(async (req, res) => {
  try {
    const programId = Number(req.body.id);

    const uploadedFiles = {};
    req.files?.forEach((file) => {
      uploadedFiles[file.fieldname] = file.path;
    });

    if (!programId) {
      return errorResponse(res, "Program ID is required", 400);
    }

    /* ------------------------------------------
       FETCH EXISTING PROGRAM WITH RELATIONS
    ------------------------------------------- */
    const existing = await prisma.Program.findUnique({
      where: { id: programId },
      include: {
        academic: true,
        careers: true,
        investment: true,
        highlights: true,
        entrance: true,
        institutes: true,
        placement: true,
        curriculum: true,
        fees: true,
        experience: true,
        seo: true,
        faqs: true,
      },
    });

    if (!existing) {
      return errorResponse(res, "Program not found", 404);
    }

    /* ------------------------------------------
       PARSE ARRAYS
    ------------------------------------------- */
    const career = parseArray(req.body.career);
    const highlights = parseArray(req.body.Highlights);
    const entrance = parseArray(req.body.Entrance);
    const institutes = parseArray(req.body.Institutes);
    const placement_ids = parseArray(req.body.placement_ids);
    const subplacement = parseArray(req.body.subplacement);
    const curriculum = parseArray(req.body.curriculum);
    const fees = parseArray(req.body.fees);
    const investmentCareer = parseArray(req.body.investment_career);
    const experienceFees = parseArray(req.body.experience_fees);
    const faqs = parseArray(req.body.faqs);

    /* ------------------------------------------
       FINAL DATA (MERGED WITH EXISTING)
    ------------------------------------------- */
    const finalData = {
      title: req.body.title || existing.title,
      description: req.body.description || existing.description,
      career_growth: req.body.career_growth || existing.career_growth,
      duration: req.body.duration || existing.duration,
      specialization: req.body.specialization || existing.specialization,
      subtitle: req.body.subtitle || existing.subtitle,
      shortDescription: req.body.shortDescription || existing.shortDescription,
      video: req.body.video || existing.video,
      universitytitle: req.body.universitytitle || existing.universitytitle,
      universitydesc: req.body.universitydesc || existing.universitydesc,
      universitybtmdesc: req.body.universitybtmdesc || existing.universitybtmdesc,
      university_id: parseArray(req.body.university_id) || existing.university_id,
      conclusion: req.body.conclusion || existing.conclusion,
      specialisationtitle: req.body.specialisationtitle || existing.specialisationtitle,
      specialisationdesc: req.body.specialisationdesc || existing.specialisationdesc,
      // ✅ ADD THIS
      category_id: req.body.category_id ? Number(req.body.category_id) : existing.category_id,
      bannerImage:
        uploadedFiles["bannerImage"]
          ? (deleteUploadedFiles([existing.bannerImage]),
            toPublicUrl(req, uploadedFiles["bannerImage"]))
          : existing.bannerImage,

      bannerImageAlt: req.body.bannerImageAlt || existing.bannerImageAlt,

      pdfdownlaod:
        uploadedFiles["pdfdownlaod"]
          ? toPublicUrl(req, uploadedFiles["pdfdownlaod"])
          : existing.pdfdownlaod,

      audio:
        uploadedFiles["audio"]
          ? toPublicUrl(req, uploadedFiles["audio"])
          : existing.audio,
    };

    /* ------------------------------------------
       HANDLE SLUG CHANGE
    ------------------------------------------- */
    let newSlug = existing.slug;
    if (finalData.title !== existing.title) {
      newSlug = await generateUniqueSlug(prisma, finalData.title, programId);
    }

    /* ------------------------------------------
       UPDATE PROGRAM
    ------------------------------------------- */
    const updatedProgram = await prisma.Program.update({
      where: { id: programId },
      data: {
        ...finalData,
        slug: req.body.slug || newSlug,
      },
    });

    /* ------------------------------------------
       UPSERT CHILD TABLES (LIKE UpdateCourse)
    ------------------------------------------- */

    await prisma.ProgramAcademic.upsert({
      where: { program_id: programId },
      update: {
        title: req.body.academic_title,
        description: req.body.academic_description,
        Image: uploadedFiles["academic_image"]
          ? toPublicUrl(req, uploadedFiles["academic_image"])
          : existing.academic?.Image,
        image_alt: req.body.academic_image_alt,
        entra_title: req.body.entra_title,
        entra_dsec: req.body.entra_dsec,
        entra_image: uploadedFiles["entra_image"]
          ? toPublicUrl(req, uploadedFiles["entra_image"])
          : existing.academic?.entra_image,
        entra_image_alt: req.body.entra_image_alt,
      },
      create: {
        program_id: programId,
        title: req.body.academic_title || "",
        description: req.body.academic_description || "",
      },
    });

    await prisma.ProgramCareer.upsert({
      where: { program_id: programId },
      update: {
        title: req.body.career_title,
        description: req.body.career_description,
        career: career,
      },
      create: {
        program_id: programId,
        title: req.body.career_title || "",
        description: req.body.career_description || "",
        career: career,
      },
    });

    await prisma.ProgramInvestment.upsert({
      where: { program_id: programId },
      update: {
        title: req.body.investment_title,
        description: req.body.investment_description,
        subtitle: req.body.investment_subtitle,
        career: investmentCareer,
      },
      create: {
        program_id: programId,
        title: req.body.investment_title || "",
        description: req.body.investment_description || "",
        subtitle: req.body.investment_subtitle || "",
        career: investmentCareer,
      },
    });

    await prisma.ProgramHighlights.upsert({
      where: { program_id: programId },
      update: {
        title: req.body.highlights_title,
        description: req.body.highlights_description,
        subtitle: req.body.highlights_subtitle,
        Highlights: highlights,
      },
      create: {
        program_id: programId,
        title: req.body.highlights_title || "",
        description: req.body.highlights_description || "",
        subtitle: req.body.highlights_subtitle || "",
        Highlights: highlights,
      },
    });

    await prisma.ProgramEntrance.upsert({
      where: { program_id: programId },
      update: {
        icon: uploadedFiles["entrance_icon"]
          ? toPublicUrl(req, uploadedFiles["entrance_icon"])
          : existing.entrance?.icon,
        title: req.body.entrance_title,
        description: req.body.entrance_description,
        Entrance: entrance,
      },
      create: {
        program_id: programId,
        title: req.body.entrance_title || "",
        description: req.body.entrance_description || "",
        Entrance: entrance,
      },
    });

    await prisma.ProgramInstitutes.upsert({
      where: { program_id: programId },
      update: {
        icon: uploadedFiles["institutes_icon"]
          ? toPublicUrl(req, uploadedFiles["institutes_icon"])
          : existing.institutes?.icon,
        title: req.body.institutes_title,
        description: req.body.institutes_description,
        Institutes: institutes,
      },
      create: {
        program_id: programId,
        title: req.body.institutes_title || "",
        description: req.body.institutes_description || "",
        Institutes: institutes,
      },
    });

    await prisma.ProgramPlacement.upsert({
      where: { program_id: programId },
      update: {
        title: req.body.placement_title,
        description: req.body.placement_description,
        placement_ids,
        subtitle: req.body.placement_subtitle,
        Subdec: req.body.Subdec,
        subplacement,
      },
      create: {
        program_id: programId,
        title: req.body.placement_title || "",
        description: req.body.placement_description || "",
        placement_ids,
        subtitle: req.body.placement_subtitle || "",
        Subdec: req.body.Subdec || "",
        subplacement,
      },
    });

    await prisma.ProgramCurriculum.upsert({
      where: { program_id: programId },
      update: {
        title: req.body.curriculum_title,
        description: req.body.curriculum_description,
        subtitle: req.body.curriculum_subtitle,
        placement_ids: curriculum,
      },
      create: {
        program_id: programId,
        title: req.body.curriculum_title || "",
        description: req.body.curriculum_description || "",
        subtitle: req.body.curriculum_subtitle || "",
        placement_ids: curriculum,
      },
    });

    await prisma.ProgramFee.upsert({
      where: { program_id: programId },
      update: {
        title: req.body.fees_title,
        description: req.body.fees_description,
        descbtm: req.body.fees_descbtm,
        fees,
      },
      create: {
        program_id: programId,
        title: req.body.fees_title || "",
        description: req.body.fees_description || "",
        descbtm: req.body.fees_descbtm || "",
        fees,
      },
    });

    await prisma.ProgramExperience.upsert({
      where: { program_id: programId },
      update: {
        title: req.body.experience_title,
        description: req.body.experience_description,
        descbtm: req.body.experience_descbtm,
        fees: experienceFees,
      },
      create: {
        program_id: programId,
        title: req.body.experience_title || "",
        description: req.body.experience_description || "",
        descbtm: req.body.experience_descbtm || "",
        fees: experienceFees,
      },
    });

    await prisma.Faq.upsert({
      where: { program_id: programId },
      update: { faqs },
      create: { program_id: programId, faqs },
    });

    return successResponse(res, "Program updated successfully", 200, updatedProgram);

  } catch (error) {
    console.error("❌ UpdateProgram error:", error);

    if (error.code === "P2002") {
      return errorResponse(
        res,
        `Duplicate field value: ${error.meta?.target?.join(", ")}`,
        400
      );
    }

    return errorResponse(res, "Something went wrong while updating program", 500);
  }
});

//  Program Delete Controller Logic
exports.ProgramDelete = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return validationErrorResponse(res, "Program ID is required", 400);
    }

    const programId = Number(id);

    const existingProgram = await prisma.Program.findUnique({
      where: { id: programId },
    });

    if (!existingProgram) {
      return validationErrorResponse(res, "Program not found", 404);
    }

    let updatedRecord;

    /* ------------------------------------------
       RESTORE IF ALREADY DELETED
    ------------------------------------------- */
    if (existingProgram.deleted_at) {
      updatedRecord = await prisma.Program.update({
        where: { id: programId },
        data: { deleted_at: null },
      });

      return successResponse(
        res,
        "Program restored successfully",
        200,
        updatedRecord
      );
    }

    /* ------------------------------------------
       SOFT DELETE
    ------------------------------------------- */
    updatedRecord = await prisma.Program.update({
      where: { id: programId },
      data: { deleted_at: new Date() },
    });

    return successResponse(
      res,
      "Program deleted successfully",
      200,
      updatedRecord
    );

  } catch (error) {

    if (error.code === "P2025") {
      return errorResponse(res, "Program not found", 404);
    }

    return errorResponse(res, error.message, 500);
  }
});

// All Programs Controller Logic
exports.AllPrograms = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 9;
  const skip = (page - 1) * limit;


  const programs = await prisma.Program.findMany({
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
  });

  const totalPrograms = await prisma.Program.count();

  const totalPages = Math.ceil(totalPrograms / limit);

  return successResponse(res, "Program fetched successfully", 200, {
    programs,
    pagination: {
      page,
      limit,
      totalPages,
      totalPrograms,
    },
  });
});
