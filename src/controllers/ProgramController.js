const prisma = require("../config/prisma");
const catchAsync = require("../utils/catchAsync");
const { successResponse, errorResponse, validationErrorResponse } = require("../utils/ErrorHandling");
const Logger = require("../utils/Logger");
const deleteUploadedFiles = require("../utils/fileDeleter");


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

exports.AddProgram = catchAsync(async (req, res) => {
  const uploadedFiles = {};
  req.files?.forEach(file => {
    uploadedFiles[file.fieldname] = file.path;
  });

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

exports.GetProgramById = catchAsync(async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return errorResponse(res, "Program slug is required", 400);
    }

    const ProgramData = await prisma.Program.findFirst({
      where: {
        slug: slug,
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

    return successResponse(
      res,
      "Program fetched successfully",
      200,
      { ProgramData }
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

exports.UpdateProgram = catchAsync(async (req, res) => {
  const uploadedFiles = {};
  req.files?.forEach((file) => {
    uploadedFiles[file.fieldname] = file.path;
  });

  try {
    const programId = Number(req.body.id);

    if (!programId) {
      return errorResponse(res, "Program ID is required", 400);
    }

    /* ------------------------------------------
       Fetch existing program with relations
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
      },
    });

    if (!existing) {
      return errorResponse(res, "Program not found", 404);
    }

    /* ------------------------------------------
       Parse JSON fields
    ------------------------------------------- */
    const careerJson       = parseArray(req.body.career);
    const highlightsJson   = parseArray(req.body.Highlights);
    const entranceJson     = parseArray(req.body.Entrance);
    const institutesJson   = parseArray(req.body.Institutes);
    const placementIdsJson = parseArray(req.body.placement_ids);
    const subPlacementJson = parseArray(req.body.subplacement);
    const curriculumJson   = parseArray(req.body.curriculum);
    const feesJson         = parseArray(req.body.fees);
    const investmentCareer = parseArray(req.body.investment_career);
    const experienceFees  = parseArray(req.body.experience_fees);

    /* ------------------------------------------
       Handle slug change (only if title changed)
    ------------------------------------------- */
    let newSlug = existing.slug;
    if (req.body.title && req.body.title !== existing.title) {
      newSlug = await generateUniqueSlug(prisma, req.body.title);
    }

    /* ------------------------------------------
       Update Program
    ------------------------------------------- */
    const program = await prisma.Program.update({
      where: { id: programId },
      data: {
        title: req.body.title || existing.title,
        slug: req.body.slug || newSlug,
        description: req.body.description || existing.description,
        bannerImage: uploadedFiles["bannerImage"]
          ? (deleteUploadedFiles([existing.bannerImage]),
            toPublicUrl(req, uploadedFiles["bannerImage"]))
          : existing.bannerImage,
        bannerImageAlt: req.body.bannerImageAlt || existing.bannerImageAlt,
        pdfdownlaod: uploadedFiles["pdfdownlaod"]
          ? toPublicUrl(req, uploadedFiles["pdfdownlaod"])
          : existing.pdfdownlaod,
        career_growth: req.body.career_growth || existing.career_growth,
        duration: req.body.duration || existing.duration,
        specialization: req.body.specialization || existing.specialization,
        audio: uploadedFiles["audio"]
          ? toPublicUrl(req, uploadedFiles["audio"])
          : existing.audio,
        subtitle: req.body.subtitle || existing.subtitle,
        shortDescription:
          req.body.shortDescription || existing.shortDescription,
        video: req.body.video || existing.video,
        universitytitle:
          req.body.universitytitle || existing.universitytitle,
        universitydesc:
          req.body.universitydesc || existing.universitydesc,
        universitybtmdesc:
          req.body.universitybtmdesc || existing.universitybtmdesc,
        university_id:
          parseArray(req.body.university_id) || existing.university_id,
        conclusion: req.body.conclusion || existing.conclusion,
        specialisationtitle:
          req.body.specialisationtitle || existing.specialisationtitle,
        specialisationdesc:
          req.body.specialisationdesc || existing.specialisationdesc,
      },
    });

    /* ------------------------------------------
       UPSERT child tables
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
        career: careerJson,
      },
      create: {
        program_id: programId,
        title: req.body.career_title || "",
        description: req.body.career_description || "",
        career: careerJson,
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
        Highlights: highlightsJson,
      },
      create: {
        program_id: programId,
        title: req.body.highlights_title || "",
        description: req.body.highlights_description || "",
        subtitle: req.body.highlights_subtitle || "",
        Highlights: highlightsJson,
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
        Entrance: entranceJson,
      },
      create: {
        program_id: programId,
        title: req.body.entrance_title || "",
        description: req.body.entrance_description || "",
        Entrance: entranceJson,
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
        Institutes: institutesJson,
      },
      create: {
        program_id: programId,
        title: req.body.institutes_title || "",
        description: req.body.institutes_description || "",
        Institutes: institutesJson,
      },
    });

    await prisma.ProgramPlacement.upsert({
      where: { program_id: programId },
      update: {
        title: req.body.placement_title,
        description: req.body.placement_description,
        placement_ids: placementIdsJson,
        subtitle: req.body.placement_subtitle,
        Subdec: req.body.Subdec,
        subplacement: subPlacementJson,
      },
      create: {
        program_id: programId,
        title: req.body.placement_title || "",
        description: req.body.placement_description || "",
        placement_ids: placementIdsJson,
        subtitle: req.body.placement_subtitle || "",
        Subdec: req.body.Subdec || "",
        subplacement: subPlacementJson,
      },
    });

    await prisma.ProgramCurriculum.upsert({
      where: { program_id: programId },
      update: {
        title: req.body.curriculum_title,
        description: req.body.curriculum_description,
        subtitle: req.body.curriculum_subtitle,
        placement_ids: curriculumJson,
      },
      create: {
        program_id: programId,
        title: req.body.curriculum_title || "",
        description: req.body.curriculum_description || "",
        subtitle: req.body.curriculum_subtitle || "",
        placement_ids: curriculumJson,
      },
    });

    await prisma.ProgramFee.upsert({
      where: { program_id: programId },
      update: {
        title: req.body.fees_title,
        description: req.body.fees_description,
        descbtm: req.body.fees_descbtm,
        fees: feesJson,
      },
      create: {
        program_id: programId,
        title: req.body.fees_title || "",
        description: req.body.fees_description || "",
        descbtm: req.body.fees_descbtm || "",
        fees: feesJson,
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

    return successResponse(
      res,
      "Program updated successfully",
      200,
      program
    );

  } catch (error) {
    console.error("❌ UpdateProgram error:", error);

    if (error.code === "P2002") {
      return errorResponse(
        res,
        `Duplicate field value: ${error.meta?.target?.join(", ")}`,
        400
      );
    }

    return errorResponse(
      res,
      error.message || "Something went wrong while updating program",
      500
    );
  }
});

