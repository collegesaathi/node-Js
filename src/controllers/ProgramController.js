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


exports.AddProgram = catchAsync(async (req, res) => {
  const uploadedFiles = {};

  req.files?.forEach(file => {
    if (!uploadedFiles[file.fieldname]) {
      uploadedFiles[file.fieldname] = [];
    }
    uploadedFiles[file.fieldname].push(file.path);
  });

  // Early return for debugging - remove in production
  try {
    // 1. PARALLEL DATA PARSING - ADDED purpuse TO THE LIST
    const [
      faqs,
      highlightsJson,
      institutesJson,
      placementIdsJson,
      subPlacementJson,
      curriculumJson,
      fincalceAdds,
      summaryJson,
      choose,
      purpuse  // ADDED THIS LINE
    ] = await Promise.all([
      parseArray(req.body.faqs),
      parseArray(req.body.keyhight),
      parseArray(req.body.institutes),
      parseArray(req.body.selectedPartners),
      parseArray(req.body.PlacementAdds),
      parseArray(req.body.curriculm),
      parseArray(req.body.fincalceAdds),
      parseArray(req.body.summary),
      parseArray(req.body.choose),
      parseArray(req.body.purpuse)  // ADDED THIS LINE
    ]);

    // 2. PARALLEL FILE MAPPING - FIXED ORDER AND ADDED purpuseimages
    const [
      fincalceAddsimages,
      chooseimages,
      purpuseimages,  // ADDED THIS FOR PURPOSE IMAGES
      PlacementAddsimages,
      summaryAudio
    ] = await Promise.all([
      mapUploadedArray(req, uploadedFiles, "fincalceAddsimages"),
      mapUploadedArray(req, uploadedFiles, "chooseimages"),
      mapUploadedArray(req, uploadedFiles, "purpuseimages"),  // ADDED THIS
      mapUploadedArray(req, uploadedFiles, "PlacementAddsimages"),
      mapUploadedArray(req, uploadedFiles, "summaryaudio")
    ]);

    // 3. PARALLEL IMAGE ATTACHMENT - ADDED finalPurpuse
    const [
      finalFincalceAdds,
      finalPurpuse,  // ADDED THIS
      finalSubPlacementJson,
      finalSummary
    ] = await Promise.all([
      attachImagesToItems(fincalceAdds, fincalceAddsimages, "image"),
      attachImagesToItems(choose, chooseimages, "image"),
      attachImagesToItems(purpuse, purpuseimages, "image"),  // ADDED THIS
      attachImagesToItems(subPlacementJson, PlacementAddsimages, "image"),
      attachImagesToItems(summaryJson, summaryAudio, "audio")
    ]);

    if (!req.body.name) {
      return errorResponse(res, "Program title is required", 400);
    }

    const generatedSlug = await generateUniqueSlug(prisma, req.body.name);

    // 4. OPTIMIZED TRANSACTION WITH BATCH OPERATIONS
    const result = await prisma.$transaction(async (tx) => {
      // Create main program
      const program = await tx.Program.create({
        data: {
          title: req.body.name || "",
          slug: req.body.slug ? req.body.slug : generatedSlug,
          description: req.body.descriptions || "",
          bannerImage: toPublicUrl(req, uploadedFiles["cover_image"]?.[0]) || "",
          icon: toPublicUrl(req, uploadedFiles["icon"]?.[0]) || "",
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
          category_id: Number(req.body.category_id) || "",
        },
      });

      const programId = program.id;

      // 5. BATCH CREATE ALL RELATED DATA
      const relatedDataPromises = [];

      // ProgramAcademic
      relatedDataPromises.push(
        tx.ProgramAcademic.create({
          data: {
            title: req.body.academictitle || "",
            description: req.body.academicdesc || "",
            Image: toPublicUrl(req, uploadedFiles["academic_cover_image"]?.[0]) || "",
            entra_image: toPublicUrl(req, uploadedFiles["entrace_cover_image"]?.[0]) || "",
            image_alt: req.body.academic_image_alt || "",
            entra_title: req.body.entracetitle || "",
            entra_desc: req.body.entracedesc || "",
            entra_image_alt: req.body.entra_image_alt || req.body.entracetitle || "",
            program_id: programId,
          },
        })
      );

      // ProgramSummary
      relatedDataPromises.push(
        tx.ProgramSummary.create({
          data: {
            title: req.body.summarytitle || "",
            description: req.body.summarydesc || "",
            button: req.body.summarybutton || "",
            summary_audio: toPublicUrl(req, uploadedFiles["summary_audio"]?.[0]) || "",
            program_id: programId
          },
        })
      );

      // ProgramCareer
      relatedDataPromises.push(
        tx.ProgramCareer.create({
          data: {
            title: req.body.careername || "",
            description: req.body.careerdesc || "",
            Career: parseArray(req.body.Careers),
            program_id: programId,
          },
        })
      );

      // ProgramExperience
      relatedDataPromises.push(
        tx.ProgramExperience.create({
          data: {
            title: req.body.experincename || "",
            description: req.body.experincedesc || "",
            notes: req.body.experincenotes || "",
            experiences: parseArray(req.body.Experinces),
            program_id: programId,
          },
        })
      );

      // Faq
      relatedDataPromises.push(
        tx.Faq.create({
          data: {
            program_id: programId,
            faqs: faqs || [],
          },
        })
      );

      // Seo
      relatedDataPromises.push(
        tx.Seo.upsert({
          where: { program_id: programId },
          update: {
            meta_title: req.body.meta_title || "",
            meta_description: req.body.meta_description || "",
            meta_keywords: req.body.meta_keywords || "",
            canonical_url: req.body.canonical_url || "",
          },
          create: {
            program_id: programId,
            meta_title: req.body.meta_title || "",
            meta_description: req.body.meta_description || "",
            meta_keywords: req.body.meta_keywords || "",
            canonical_url: req.body.canonical_url || "",
          },
        })
      );

      // ProgramHighlights
      relatedDataPromises.push(
        tx.ProgramHighlights.create({
          data: {
            title: req.body.highlights_title || "",
            description: req.body.highlights_description || "",
            subtitle: req.body.highlights_subtitle || "",
            Highlights: highlightsJson,
            program_id: programId,
          },
        })
      );

      // ProgramChoose - CHANGED TO USE finalPurpuse
      relatedDataPromises.push(
        tx.ProgramChoose.create({
          data: {
            title: req.body.purpusename || "",
            description: req.body.purpsedesc || "",
            choose: finalPurpuse,  // CHANGED FROM finalChoose TO finalPurpuse
            program_id: programId,
          },
        })
      );

      // ProgramGraph
      relatedDataPromises.push(
        tx.ProgramGraph.create({
          data: {
            title: req.body.futuretitle || "",
            description: req.body.futuredesc || "",
            subdesc: req.body.futurebtmdesc || "",
            yearly: parseArray(req.body.yearlyData),
            program_id: programId,
          },
        })
      );

      // ProgramEntrance
      relatedDataPromises.push(
        tx.ProgramEntrance.create({
          data: {
            icon: toPublicUrl(req, uploadedFiles["entrance_icon"]?.[0]) || "",
            title: req.body.onlinetitle || "",
            description: req.body.onlinedesc || "",
            Entrance: parseArray(req.body.onlines),
            program_id: programId,
          },
        })
      );

      // ProgramPlacement
      relatedDataPromises.push(
        tx.ProgramPlacement.create({
          data: {
            title: req.body.placementname || "",
            description: req.body.placementdescription || "",
            placement_ids: placementIdsJson,
            subtitle: req.body.partnersname || "",
            Subdec: req.body.partnersdesc || "",
            subplacement: finalSubPlacementJson,
            program_id: programId,
          },
        })
      );

      // ProgramInstitutes
      relatedDataPromises.push(
        tx.ProgramInstitutes.create({
          data: {
            title: req.body.instututitle || "",
            description: req.body.instutudesc || "",
            Institutes: institutesJson,
            program_id: programId,
          },
        })
      );

      // ProgramFinancialScholarship
      relatedDataPromises.push(
        tx.ProgramFinancialScholarship.create({
          data: {
            title: req.body.financialname || "",
            description: req.body.financialdescription || "",
            financial: finalFincalceAdds,
            program_id: programId,
          },
        })
      );

      // ProgramDurationFees
      relatedDataPromises.push(
        tx.ProgramDurationFees.create({
          data: {
            title: req.body.durationname || "",
            description: req.body.durationdesc || "",
            duration: parseArray(req.body.DurationData),
            program_id: programId,
          },
        })
      );

      // ProgramCurriculum
      relatedDataPromises.push(
        tx.ProgramCurriculum.create({
          data: {
            title: req.body.curriculum_title || "",
            description: req.body.curriculum_description || "",
            subtitle: req.body.curriculum_subtitle || "",
            curriculum_id: curriculumJson,
            program_id: programId,
          },
        })
      );

      // ProgramVs (if exists)
      if (req.body.addvs) {
        relatedDataPromises.push(
          tx.ProgramVs.create({
            data: {
              title: req.body.addvstitle || "",
              description: req.body.addvsdesc || "",
              summary: parseArray(req.body.addvs),
              program_id: programId,
            },
          })
        );
      }

      // 6. EXECUTE ALL PROMISES IN PARALLEL
      await Promise.all(relatedDataPromises);

      return program;
    }, { timeout: 30000 }); // Reduced timeout

    return successResponse(res, "Program added successfully", 201, result);

  } catch (error) {
    console.error("❌ AddProgram ERROR =====================");
    console.error(error);
    console.error("❌ ERROR MESSAGE:", error.message);
    console.error("❌ ERROR STACK:", error.stack);

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
        summary: true,
        programvs: true,
        careers: true,
        placement: true,
        choose: true,
        academic: true,
        graph: true,
        highlights: true,
        entrance: true,
        faqs: true,
        seo: true,
        institutes: true,
        curriculum: true,
        experience: true,
        financial: true,
        durationfees: true,
      },
    });

    return successResponse(
      res,
      "Program fetched successfully",
      200,
      ProgramData
    );
  } catch (error) {
    console.error("❌ GetProgramById error", error);
    return errorResponse(
      res,
      error.message || "Something went wrong while fetching program",
      500
    );
  }
});



exports.UpdateProgram = catchAsync(async (req, res) => {
  try {
    const programId = Number(req.body.id);
    if (!programId) {
      return errorResponse(res, "Program ID is required", 400);
    }

    const uploadedFiles = {};
    req.files?.forEach(file => {
      if (!uploadedFiles[file.fieldname]) {
        uploadedFiles[file.fieldname] = [];
      }
      uploadedFiles[file.fieldname].push(file.path);
    });

    /* ================= FETCH EXISTING ================= */
    const existing = await prisma.Program.findUnique({
      where: { id: programId },
      include: {
        academic: true,
        summary: true,
        careers: true,
        experience: true,
        faqs: true,
        seo: true,
        highlights: true,
        choose: true,
        graph: true,
        entrance: true,
        placement: true,
        institutes: true,
        financial: true,
        durationfees: true,
        curriculum: true,
        programvs: true,
      }
    });

    if (!existing) {
      return errorResponse(res, "Program not found", 404);
    }

    /* ================= PARSE DATA ================= */
    const [
      faqs,
      highlightsJson,
      institutesJson,
      placementIdsJson,
      subPlacementJson,
      curriculumJson,
      fincalceAdds,
      summaryJson,
      choose,
      purpuse,
      yearlyData,
      entranceData,
      durationData,
      vsData
    ] = await Promise.all([
      parseArray(req.body.faqs),
      parseArray(req.body.keyhight),
      parseArray(req.body.institutes),
      parseArray(req.body.selectedPartners),
      parseArray(req.body.PlacementAdds),
      parseArray(req.body.curriculm),
      parseArray(req.body.fincalceAdds),
      parseArray(req.body.summary),
      parseArray(req.body.choose),
      parseArray(req.body.purpuse),
      parseArray(req.body.yearlyData),
      parseArray(req.body.onlines),
      parseArray(req.body.DurationData),
      parseArray(req.body.addvs),
    ]);

    /* ================= IMAGE MAPPING ================= */
    const [
      fincalceAddsimages,
      chooseimages,
      purpuseimages,
      PlacementAddsimages,
      summaryAudio
    ] = await Promise.all([
      mapUploadedArray(req, uploadedFiles, "fincalceAddsimages"),
      mapUploadedArray(req, uploadedFiles, "chooseimages"),
      mapUploadedArray(req, uploadedFiles, "purpuseimages"),
      mapUploadedArray(req, uploadedFiles, "PlacementAddsimages"),
      mapUploadedArray(req, uploadedFiles, "summaryaudio"),
    ]);

    /* ================= FINAL DATA ================= */
    const finalFinancial = attachImagesToItems(
      fincalceAdds,
      fincalceAddsimages,
      "image",
      existing?.financial?.financial
    );

    const finalPurpuse = attachImagesToItems(
      purpuse,
      purpuseimages,
      "image",
      existing?.choose?.choose
    );

    const finalSubPlacement = attachImagesToItems(
      subPlacementJson,
      PlacementAddsimages,
      "image",
      existing?.placement?.subplacement
    );

    const finalSummary = attachImagesToItems(
      summaryJson,
      summaryAudio,
      "audio",
      existing?.summary?.summary_audio
    );

      
    /* ================= MAIN PROGRAM ================= */
    const program = await prisma.Program.update({
      where: { id: programId },
      data: {
        title: req.body.name || existing.title,
        slug: req.body.slug || existing.slug,
        description: req.body.descriptions || "",
        bannerImage: uploadedFiles.cover_image?.[0]
          ? toPublicUrl(req, uploadedFiles.cover_image[0])
          : existing.bannerImage,
            icon: uploadedFiles.icon?.[0]
          ? toPublicUrl(req, uploadedFiles.icon[0])
          : existing.icon,
        bannerImageAlt: req.body.bannerImageAlt || existing.bannerImageAlt,
        pdfdownlaod: uploadedFiles.pdf_download?.[0]
          ? toPublicUrl(req, uploadedFiles.pdf_download[0])
          : existing.pdfdownlaod,
        audio: uploadedFiles.audio?.[0]
          ? toPublicUrl(req, uploadedFiles.audio[0])
          : existing.audio,
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
        category_id: Number(req.body.category_id) || existing.category_id,
      }
    });

    /* ================= ALL TABLE UPSERTS ================= */

    await prisma.ProgramAcademic.upsert({
      where: { program_id: programId },
      update: {
        title: req.body.academictitle,
        description: req.body.academicdesc,
        Image: uploadedFiles.academic_cover_image?.[0]
          ? toPublicUrl(req, uploadedFiles.academic_cover_image[0])
          : existing?.academic?.Image,
        entra_image: uploadedFiles.entrace_cover_image?.[0]
          ? toPublicUrl(req, uploadedFiles.entrace_cover_image[0])
          : existing?.academic?.entra_image,
            entra_title: req.body.entracetitle || "",
            entra_desc: req.body.entracedesc || "",
            entra_image_alt: req.body.entra_image_alt || req.body.entracetitle || "",
      },
      create: {
        program_id: programId,
        title: req.body.academictitle,
        description: req.body.academicdesc,
        Image: toPublicUrl(req, uploadedFiles.academic_cover_image?.[0]),
        entra_image: toPublicUrl(req, uploadedFiles.entrace_cover_image?.[0]),
          entra_title: req.body.entracetitle || "",
            entra_desc: req.body.entracedesc || "",
            entra_image_alt: req.body.entra_image_alt || req.body.entracetitle || "",
      }
    });

    await prisma.ProgramSummary.upsert({
      where: { program_id: programId },
      update: {
        title: req.body.summarytitle || "",
            description: req.body.summarydesc || "",
            button: req.body.summarybutton || "",
              summary_audio: uploadedFiles.summary_audio?.[0]
          ? toPublicUrl(req, uploadedFiles.summary_audio[0])
          : existing.summary_audio,
      },
      create: {
        program_id: programId,
       title: req.body.summarytitle || "",
            description: req.body.summarydesc || "",
            button: req.body.summarybutton || "",
      summary_audio: uploadedFiles.summary_audio?.[0]
          ? toPublicUrl(req, uploadedFiles.summary_audio[0])
          : existing.summary_audio,
      }
    });

    await prisma.ProgramCareer.upsert({
      where: { program_id: programId },
      update: {
        title: req.body.careername,
        description: req.body.careerdesc,
        Career: parseArray(req.body.Careers),
      },
      create: {
        program_id: programId,
        title: req.body.careername,
        description: req.body.careerdesc,
        Career: parseArray(req.body.Careers),
      }
    });

    await prisma.ProgramExperience.upsert({
      where: { program_id: programId },
      update: {
        title: req.body.experincename,
        description: req.body.experincedesc,
        experiences: parseArray(req.body.Experinces),
      },
      create: {
        program_id: programId,
        title: req.body.experincename,
        description: req.body.experincedesc,
        experiences: parseArray(req.body.Experinces),
      }
    });

    await prisma.Faq.upsert({
      where: { program_id: programId },
      update: { faqs },
      create: { program_id: programId, faqs }
    });

    await prisma.Seo.upsert({
      where: { program_id: programId },
      update: {
        meta_title: req.body.meta_title,
        meta_description: req.body.meta_description,
        meta_keywords: req.body.meta_keywords,
        canonical_url: req.body.canonical_url,
      },
      create: {
        program_id: programId,
        meta_title: req.body.meta_title,
        meta_description: req.body.meta_description,
        meta_keywords: req.body.meta_keywords,
        canonical_url: req.body.canonical_url,
      }
    });

  await prisma.ProgramHighlights.upsert({
  where: {
    program_id: programId,   // ✅ allowed because @unique
  },
  update: {
    title: req.body.highlights_title || "",
    description: req.body.highlights_description || null,
    subtitle: req.body.highlights_subtitle || null,
    Highlights: highlightsJson || [],
  },
  create: {
    title: req.body.highlights_title || "",   // ✅ REQUIRED
    description: req.body.highlights_description || null,
    subtitle: req.body.highlights_subtitle || null,
    Highlights: highlightsJson || [],
    program: {
      connect: { id: programId }   // ✅ THIS IS THE FIX
    }
  }
});


    await prisma.ProgramChoose.upsert({
      where: { program_id: programId },
      update: {
        title: req.body.purpusename,
        description: req.body.purpsedesc,
        choose: finalPurpuse
      },
      create: {
        program_id: programId,
        title: req.body.purpusename,
        description: req.body.purpsedesc,
        choose: finalPurpuse
      }
    });

    await prisma.ProgramGraph.upsert({
      where: { program_id: programId },
      update: {
        title: req.body.futuretitle,
        description: req.body.futuredesc,
        subdesc: req.body.futurebtmdesc,
        yearly: yearlyData,
      },
      create: {
        program_id: programId,
        title: req.body.futuretitle,
        description: req.body.futuredesc,
        subdesc: req.body.futurebtmdesc,
        yearly: yearlyData,
      }
    });

    await prisma.ProgramEntrance.upsert({
      where: { program_id: programId },
      update: {
        icon: uploadedFiles.entrance_icon?.[0]
          ? toPublicUrl(req, uploadedFiles.entrance_icon[0])
          : existing?.entrance?.icon,
        title: req.body.onlinetitle,
        description: req.body.onlinedesc,
        Entrance: entranceData,
      },
      create: {
        program_id: programId,
        icon: toPublicUrl(req, uploadedFiles.entrance_icon?.[0]),
        title: req.body.onlinetitle,
        description: req.body.onlinedesc,
        Entrance: entranceData,
      }
    });

    await prisma.ProgramPlacement.upsert({
      where: { program_id: programId },
      update: {
        title: req.body.placementname,
        description: req.body.placementdescription,
        placement_ids: placementIdsJson,
        subplacement: finalSubPlacement,
      },
      create: {
        program_id: programId,
        title: req.body.placementname,
        description: req.body.placementdescription,
        placement_ids: placementIdsJson,
        subplacement: finalSubPlacement,
      }
    });

    await prisma.ProgramInstitutes.upsert({
      where: { program_id: programId },
      update: {
        title: req.body.instututitle,
        description: req.body.instutudesc,
        Institutes: institutesJson,
      },
      create: {
        program_id: programId,
        title: req.body.instututitle,
        description: req.body.instutudesc,
        Institutes: institutesJson,
      }
    });

    await prisma.ProgramFinancialScholarship.upsert({
      where: { program_id: programId },
      update: {
        title: req.body.financialname,
        description: req.body.financialdescription,
        financial: finalFinancial,
      },
      create: {
        program_id: programId,
        title: req.body.financialname,
        description: req.body.financialdescription,
        financial: finalFinancial,
      }
    });

    await prisma.ProgramDurationFees.upsert({
      where: { program_id: programId },
      update: {
        title: req.body.durationname,
        description: req.body.durationdesc,
        duration: durationData,
      },
      create: {
        program_id: programId,
        title: req.body.durationname,
        description: req.body.durationdesc,
        duration: durationData,
      }
    });

    await prisma.ProgramCurriculum.upsert({
      where: { program_id: programId },
      update: {
        title: req.body.curriculum_title,
        description: req.body.curriculum_description,
        curriculum_id: curriculumJson,
      },
      create: {
        program_id: programId,
        title: req.body.curriculum_title,
        description: req.body.curriculum_description,
        curriculum_id: curriculumJson,
      }
    });

    if (vsData?.length) {
      await prisma.ProgramVs.upsert({
        where: { program_id: programId },
        update: {
          title: req.body.addvstitle,
          description: req.body.addvsdesc,
          summary: vsData,
        },
        create: {
          program_id: programId,
          title: req.body.addvstitle,
          description: req.body.addvsdesc,
          summary: vsData,
        }
      });
    }

    return successResponse(res, "Program updated successfully", 200, program);

  } catch (error) {
    console.error("❌ UpdateProgram ERROR:", error);
    return errorResponse(res, error.message || "Internal Server Error", 500);
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
  const limit = 100;
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
