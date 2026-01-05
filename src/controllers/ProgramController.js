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
  return `${req.protocol}://${req.get("host")}${cleanPath}`;
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




// Program Add Controller Logic
exports.AddProgram = catchAsync(async (req, res) => {
  // const uploadedFiles = {};
  // req.files?.forEach(file => {
  //   uploadedFiles[file.fieldname] = file.path;
  // });

  const uploadedFiles = {};

  req.files?.forEach(file => {
    if (!uploadedFiles[file.fieldname]) {
      uploadedFiles[file.fieldname] = [];
    }
    uploadedFiles[file.fieldname].push(file.path);
  });

  Loggers.silly(req.body)
  Loggers.silly(uploadedFiles)
  return  false;

  try {
    let faqs = parseArray(req.body.faqs);
    const highlightsJson = parseArray(req.body.keyhight);
    const institutesJson = parseArray(req.body.institutes);
    let placementIdsJson = parseArray(req.body.selectedPartners);
    let subPlacementJson = parseArray(req.body.PlacementAdds);
    const curriculumJson = parseArray(req.body.curriculm);
    let fincalceAdds = parseArray(req.body.fincalceAdds)
    let choose = parseArray(req.body.choose);
    let purpuse = parseArray(req.body.purpuse)
    const factsImages = mapUploadedArray(req, uploadedFiles, "fincalceAddsimages");
    const chooseimages = mapUploadedArray(req, uploadedFiles, "chooseimages");
    const purpuseimages = mapUploadedArray(req, uploadedFiles, "purpuseimages");
    const PlacementAddsimages = mapUploadedArray(req, uploadedFiles, "PlacementAddsimages");
    fincalceAdds = attachImagesToItems(fincalceAdds, factsImages, "image");
    choose = attachImagesToItems(choose, chooseimages, "image");
    purpuse = attachImagesToItems(purpuse, purpuseimages, "image");
    subPlacementJson = attachImagesToItems(subPlacementJson, PlacementAddsimages, "image");
    if (!req.body.name) {
      return errorResponse(res, "Program title is required", 400);
    }

    const generatedSlug = await generateUniqueSlug(
      prisma,
      req.body.name
    );
    const result = await prisma.$transaction(async (tx) => {
      const program = await tx.Program.create({
        data: {
          title: req.body.name || "",
          slug: req.body.slug || generatedSlug || "",
          description: req.body.descriptions || "",
          bannerImage: toPublicUrl(req, uploadedFiles["cover_image"]) || "",
          bannerImageAlt: req.body.bannerImageAlt || req.body.name || "",
          pdfdownlaod: toPublicUrl(req, uploadedFiles["pdf_download"]?.[0]),
          audio: toPublicUrl(req, uploadedFiles["audio"]?.[0]),
          career_growth: req.body.career_growth || "",
          duration: req.body.duration || "",
          specialization: req.body.specialization || "",
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
          title: req.body.academictitle || "",
          description: req.body.academicdesc || "",
          Image: toPublicUrl(req, uploadedFiles["academic_cover_image"]) || "",
          image_alt: req.body.academic_image_alt || "",
          entra_title: req.body.entracetitle || "",
          entra_desc: req.body.entracedesc || "",
          entra_image: toPublicUrl(req, uploadedFiles["entrace_cover_image"]) || "",
          entra_image_alt: req.body.entra_image_alt || req.body.entracetitle || "",
          program_id: programId,
        },
      });

      await tx.ProgramCareer.create({
        data: {
          title: req.body.careername || "",
          description: req.body.careerdesc || "",
          career: parseArray(req.body.Careers),
          program_id: programId,
        },
      });

      await tx.ProgramExperience.create({
        data: {
          title: req.body.experincename || "",
          description: req.body.experincedesc || "",
          notes: req.body.experincenotes || "",
          experiences: parseArray(req.body.Experinces),
          program_id: programId,
        },
      });

      await tx.Faq.create({
        data: {
          program_id: programId,
          faqs: faqs || [],
        }
      })
      await tx.Seo.create({
        data: {
          program_id: programId,
          meta_title: req.body.meta_title || "",
          meta_description: req.body.meta_description || "",
          meta_keywords: req.body.meta_keywords || "",
          canonical_url: req.body.canonical_url || "",
        }
      })
      await tx.ProgramHighlights.create({
        data: {
          title: req.body.highlights_title || "",
          description: req.body.highlights_description || "",
          subtitle: req.body.highlights_subtitle || "",
          Highlights: highlightsJson,
          program_id: programId,
        },
      });

      const programChoose = await tx.ProgramChoose.create({
        data: {
          title: req.body.purpusename || "",
          description: req.body.purpsedesc || "",
          choose: choose,     
          purpuse: purpuse,   
          program_id: programId,
        },
      });
      
      await tx.ProgramGraph.create({
        data: {
          title: req.body.futuretitle || "",
          description: req.body.futuredesc || "",
          subdesc: req.body.futurebtmdesc || "",
          monthly: parseArray(req.body.monthlyData),
          program_id: programId,
        },
      });

      await tx.ProgramEntrance.create({
        data: {
          icon: toPublicUrl(req, uploadedFiles["entrance_icon"]) || "",
          title: req.body.onlinetitle || "",
          description: req.body.onlinedesc || "",
          Entrance: parseArray(req.body.onlines),
          program_id: programId,
        },
      });

      await tx.ProgramPlacement.create({
        data: {
          title: req.body.placementname || "",
          description: req.body.placementdescription || "",
          placement_ids: placementIdsJson,
          subtitle: req.body.partnersname || "",
          Subdec: req.body.partnersdesc || "",
          subplacement: subPlacementJson,
          program_id: programId,
        },
      });

      await tx.ProgramInstitutes.create({
        data: {
          title: req.body.instututitle || "",
          description: req.body.instutudesc || "",
          Institutes: institutesJson,
          program_id: programId,
        },
      });

      await tx.ProgramFinancialScholarship.create({
        data: {
          title: req.body.financialname || "",
          description: req.body.financialdescription || "",
          financial: fincalceAdds,
          program_id: programId,
        },
      });

      await tx.ProgramDurationFees.create({
        data: {
          title: req.body.durationname || "",
          description: req.body.durationdesc || "",
          duration: parseArray(req.body.DurationData),
          program_id: programId,
        },
      });

      await tx.ProgramCurriculum.create({
        data: {
          title: req.body.curriculum_title || "",
          description: req.body.curriculum_description || "",
          subtitle: req.body.curriculum_subtitle || "",
          curriculum_id: curriculumJson,
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
        faqs: true,
        seo: true,
        careers: true,
        placement: true,
        choose: true,
        academic: true,
        graph: true,
        highlights: true,
        entrance: true,
        institutes: true,
        curriculum: true,
        experience: true,
        financial: true,
        durationfees: true
      }
    });

    // Loggers.warn(ProgramData)

    return successResponse(
      res,
      "Program fetched successfully",
      200,
      ProgramData
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

// ✅ UPSERT BASED UPDATE PROGRAM CONTROLLER
exports.UpdateProgram = catchAsync(async (req, res) => {
  try {
    const programId = Number(req.body.id);
    if (!programId) return errorResponse(res, "Program ID is required", 400);
    // Loggers.silly(req.body)
    const uploadedFiles = {};
    req.files?.forEach((file) => {
      uploadedFiles[file.fieldname] = file.path;
    });

    // Loggers.silly(uploadedFiles)

    /* ---------------- FETCH ---------------- */
    const existing = await prisma.Program.findUnique({
      where: { id: programId }
    });
    if (!existing) return errorResponse(res, "Program not found", 404);

    /* ---------------- PARSE ARRAYS ---------------- */
    const parse = d => {
      try { return d ? JSON.parse(d) : []; } catch { return []; }
    };

    const highlights = parse(req.body.keyhight);
    const institutes = parse(req.body.institutes);
    const faqs = parse(req.body.faqs);
    const placement_ids = parse(req.body.selectedPartners);
    let subPlacementJson = parseArray(req.body.PlacementAdds);
    const monthly = parse(req.body.monthlyData);
    let choose = parse(req.body.choose);
    let purpuse = parse(req.body.purpuse);
    const careers = parse(req.body.Careers);
    const experienceFees = parse(req.body.Experinces);
    let finacels = parse(req.body.fincalceAdds);
    const onlineEntrance = parse(req.body.onlines);
    const durationData = parse(req.body.DurationData);
    let curriculumData = parse(req.body.curriculm);

    const chooseimages = mapUploadedArray(req, uploadedFiles, "chooseimages");
    const purpuseimages = mapUploadedArray(req, uploadedFiles, "purpuseimages");
    purpuse = attachImagesToItems(purpuse, purpuseimages, "image", existing.choose?.purpuse);

    choose = attachImagesToItems(choose, chooseimages, "image", existing.choose?.choose);
    const curriculumsimages = mapUploadedArray(req, uploadedFiles, "curriculumsimages");
    const fincalceAddsimages = mapUploadedArray(req, uploadedFiles, "fincalceAddsimages");

    finacels = attachImagesToItems(finacels, fincalceAddsimages, "image", existing.financial?.financial);

    curriculumData = attachImagesToItems(curriculumData, curriculumsimages, "image", existing.curriculum?.curriculum_id);

    const PlacementAddsimages = mapUploadedArray(req, uploadedFiles, "PlacementAddsimages");
    // Attach images to arrays
    subPlacementJson = attachImagesToItems(subPlacementJson, PlacementAddsimages, "image", existing.placement?.subplacement);

    /* ---------------- FINAL DATA ---------------- */
    const finalData = {
      title: req.body.title || existing.title,
      description: req.body.description || existing.description,
      subtitle: req.body.subtitle || existing.subtitle,
      shortDescription: req.body.shortDescription || existing.shortDescription,
      category_id: req.body.category_id ? Number(req.body.category_id) : existing.category_id,
      // bannerImage: uploaded.bannerImage || existing.bannerImage,
      bannerImageAlt: req.body.bannerImageAlt || existing.bannerImageAlt,
      // pdfdownlaod: uploaded.pdf_download || existing.pdfdownlaod,
      // audio: uploaded.audio || existing.audio,
      bannerImage:
        uploadedFiles["bannerImage"]
          ? (deleteUploadedFiles([existing.cover_image]),
            toPublicUrl(req, uploadedFiles["bannerImage"]))
          : existing?.cover_image,
      pdfdownlaod:
        uploadedFiles["pdf_download"]
          ? (deleteUploadedFiles([existing.pdfdownlaod]),
            toPublicUrl(req, uploadedFiles["pdf_download"]))
          : existing?.pdfdownlaod,
      audio:
        uploadedFiles["audio"]
          ? (deleteUploadedFiles([existing.audio]),
            toPublicUrl(req, uploadedFiles["audio"]))
          : existing?.audio,
      universitybtmdesc: req.body.universitybtmdesc || existing.universitybtmdesc || "",
      university_id: parseArray(req.body.university_id) || existing.university_id || [],
    };

    /* ---------------- SLUG ---------------- */
    let slug = existing.slug;
    if (finalData.title !== existing.title) {
      slug = await generateUniqueSlug(prisma, finalData.title, programId);
    }

    /* ---------------- TRANSACTION ---------------- */
    await prisma.$transaction(async (tx) => {

      /* UPDATE MAIN PROGRAM */
      await tx.Program.update({
        where: { id: programId },
        data: { ...finalData, slug: req.body.slug || slug },
      });

      /* ------------- UPSERT CHILD TABLES ------------- */

      await tx.Faq.upsert({
        where: { program_id: programId },
        create: { program_id: programId, faqs },
        update: { faqs }
      });

      await tx.Seo.upsert({
        where: { program_id: programId },
        create: {
          program_id: programId,
          meta_title: req.body.meta_title || "",
          meta_description: req.body.meta_description || "",
          meta_keywords: req.body.meta_keywords || "",
          canonical_url: req.body.canonical_url || "",
        },
        update: {
          meta_title: req.body.meta_title || "",
          meta_description: req.body.meta_description || "",
          meta_keywords: req.body.meta_keywords || "",
          canonical_url: req.body.canonical_url || "",
        }
      });

      const rexo = await tx.ProgramFinancialScholarship.upsert({
        where: { program_id: programId },
        create: {
          program_id: programId,
          title: req.body.financialname || "",
          description: req.body.financialdescription || "",
          financial: finacels
        },
        update: {
          title: req.body.financialname || "",
          description: req.body.financialdescription || "",
          financial: finacels
        }
      });

      await tx.ProgramCareer.upsert({
        where: { program_id: programId },
        create: {
          program_id: programId,
          title: req.body.careername || "",
          description: req.body.careerdesc || "",
          career: careers
        },
        update: {
          title: req.body.careername || "",
          description: req.body.careerdesc || "",
          career: careers
        }
      });

      await tx.ProgramExperience.upsert({
        where: { program_id: programId },
        create: {
          program_id: programId,
          title: req.body.experincename || "",
          description: req.body.experincedesc || "",
          notes: req.body.experincenotes || '',
          experiences: experienceFees
        },
        update: {
          title: req.body.experincename || "",
          description: req.body.experincedesc || "",
          notes: req.body.experincenotes || '',
          experiences: experienceFees
        }
      });

      await tx.ProgramHighlights.upsert({
        where: { program_id: programId },
        create: {
          program_id: programId,
          title: req.body.highlights_title || "",
          description: req.body.highlights_description || "",
          subtitle: req.body.highlights_subtitle || "",
          Highlights: highlights
        },
        update: {
          title: req.body.highlights_title || "",
          description: req.body.highlights_description || "",
          subtitle: req.body.highlights_subtitle || "",
          Highlights: highlights
        }
      });

      await tx.ProgramChoose.upsert({
        where: { program_id: programId },
        create: {
          program_id: programId,
          title: req.body.purpusename || "",
          description: req.body.purpsedesc || "",
          choose,
          purpuse
        },
        update: {
          title: req.body.purpusename || "",
          description: req.body.purpsedesc || "",
          choose,
          purpuse
        }
      });

      await tx.ProgramGraph.upsert({
        where: { program_id: programId },
        create: {
          program_id: programId,
          title: req.body.futuretitle || "",
          description: req.body.futuredesc || "",
          subdesc: req.body.futurebtmdesc || "",
          monthly
        },
        update: {
          title: req.body.futuretitle || "",
          description: req.body.futuredesc || "",
          subdesc: req.body.futurebtmdesc || "",
          monthly
        }
      });

      await tx.ProgramEntrance.upsert({
        where: { program_id: programId },
        create: {
          program_id: programId,
          // icon: uploaded.entrance_icon || "",
          title: req.body.onlinetitle || "",
          description: req.body.onlinedesc || "",
          Entrance: onlineEntrance
        },
        update: {
          // icon: uploaded.entrance_icon || "",
          title: req.body.onlinetitle || "",
          description: req.body.onlinedesc || "",
          Entrance: onlineEntrance
        }
      });

      await tx.ProgramPlacement.upsert({
        where: { program_id: programId },
        create: {
          program_id: programId,
          title: req.body.placementname || "",
          description: req.body.placementdescription || "",
          placement_ids: placement_ids,
          subtitle: req.body.partnersname || "",
          Subdec: req.body.partnersdesc || "",
          subplacement: subPlacementJson,
        },
        update: {
          program_id: programId,
          title: req.body.placementname || "",
          description: req.body.placementdescription || "",
          placement_ids: placement_ids,
          subtitle: req.body.partnersname || "",
          Subdec: req.body.partnersdesc || "",
          subplacement: subPlacementJson,
        }
      });

      await tx.ProgramInstitutes.upsert({
        where: { program_id: programId },
        create: {
          program_id: programId,
          title: req.body.instututitle || "",
          description: req.body.instutudesc || "",
          Institutes: institutes
        },
        update: {
          title: req.body.instututitle || "",
          description: req.body.instutudesc || "",
          Institutes: institutes
        }
      });

      await tx.ProgramDurationFees.upsert({
        where: { program_id: programId },
        create: {
          program_id: programId,
          title: req.body.durationname || "",
          description: req.body.durationdesc || "",
          duration: durationData
        },
        update: {
          title: req.body.durationname || "",
          description: req.body.durationdesc || "",
          duration: durationData
        }
      });

      await tx.ProgramCurriculum.upsert({
        where: { program_id: programId },
        create: {
          program_id: programId,
          title: req.body.curriculum_title || "",
          description: req.body.curriculum_description || "",
          subtitle: req.body.curriculum_subtitle || "",
          curriculum_id: curriculumData
        },
        update: {
          title: req.body.curriculum_title || "",
          description: req.body.curriculum_description || "",
          subtitle: req.body.curriculum_subtitle || "",
          curriculum_id: curriculumData
        }
      });

      await tx.ProgramAcademic.upsert({
        where: { program_id: programId },
        create: {
          title: req.body.academictitle || "",
          description: req.body.academicdesc || "",
          Image: toPublicUrl(req, uploadedFiles["academic_cover_image"]) || "",
          image_alt: req.body.academic_image_alt || "",
          entra_title: req.body.entracetitle || "",
          entra_desc: req.body.entracedesc || "",
          entra_image: toPublicUrl(req, uploadedFiles["entrace_cover_image"]) || "",
          entra_image_alt: req.body.entra_image_alt || req.body.entracetitle || "",
          program_id: programId,
        },
        update: {
          title: req.body.academictitle || "",
          description: req.body.academicdesc || "",
          Image: toPublicUrl(req, uploadedFiles["academic_cover_image"]) || "",
          image_alt: req.body.academic_image_alt || "",
          entra_title: req.body.entracetitle || "",
          entra_desc: req.body.entracedesc || "",
          entra_image: toPublicUrl(req, uploadedFiles["entrace_cover_image"]) || "",
          entra_image_alt: req.body.entra_image_alt || req.body.entracetitle || "",
          program_id: programId,
        }
      });

    });

    return successResponse(res, "Program updated successfully", 200);

  } catch (error) {
    console.log("❌ UPSERT Update Error:", error);

    if (error.code === "P2002") {
      return errorResponse(res, `Duplicate value: ${error.meta?.target}`, 400);
    }

    return errorResponse(res, "Something went wrong while updating", 500);
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
