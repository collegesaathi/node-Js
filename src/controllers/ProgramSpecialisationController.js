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
const safeParseArray = (data) => {
  try {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return JSON.parse(data);
  } catch (error) {
    console.warn("Failed to parse array:", data);
    return [];
  }
};

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
  try {
    // 1. VALIDATE REQUIRED FIELDS
    const requiredFields = ['name', 'program_id'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return errorResponse(res, `Missing required fields: ${missingFields.join(', ')}`, 400);
    }

    // 2. PROCESS UPLOADED FILES
    const uploadedFiles = {};
    if (req.files) {
      req.files.forEach(file => {
        if (!uploadedFiles[file.fieldname]) {
          uploadedFiles[file.fieldname] = [];
        }
        uploadedFiles[file.fieldname].push(file.path);
      });
    }

    Loggers.http(req.body);
    Loggers.http(uploadedFiles);

    // 3. FIRST, PARSE ALL REQUIRED DATA ARRAYS
    // Parse purpuse first since it's needed early
    const purpuseData = req.body.purpuse ? safeParseArray(req.body.purpuse) : [];

    // Parse all other arrays in parallel
    const [
      faqs,
      institutesJson,
      placementIdsJson,
      subPlacementJson,
      fincalceAdds,
      summaryJson,
      universityIds,
      onlines,
      salary,
      yearlyData,
      DurationData,
      semesters,
      resourcesData,
      electivesData
    ] = await Promise.all([
      safeParseArray(req.body.faqs),
      safeParseArray(req.body.institutes || req.body.keyhight),
      safeParseArray(req.body.selectedPartners),
      safeParseArray(req.body.PlacementAdds),
      safeParseArray(req.body.curriculm),
      safeParseArray(req.body.fincalceAdds),
      safeParseArray(req.body.summary),
      safeParseArray(req.body.university_id),
      safeParseArray(req.body.onlines),
      safeParseArray(req.body.salary),
      safeParseArray(req.body.yearlyData),
      safeParseArray(req.body.DurationData),
      safeParseArray(req.body.semesters),
      safeParseArray(req.body.resources),
      safeParseArray(req.body.electives)
    ]);

    // 4. PARALLEL FILE MAPPING
    const [
      fincalceAddsimages,
      purpuseimages,
      PlacementAddsimages,
      summaryAudio,
      resourcesimages,
      electvieimages
    ] = await Promise.all([
      mapUploadedArray(req, uploadedFiles, "fincalceAddsimages"),
      mapUploadedArray(req, uploadedFiles, "purpuseimages"),
      mapUploadedArray(req, uploadedFiles, "PlacementAddsimages"),
      mapUploadedArray(req, uploadedFiles, "summaryaudio"),
      mapUploadedArray(req, uploadedFiles, "resourcesimages"),
      mapUploadedArray(req, uploadedFiles, "electvieimages")
    ]);

    // 5. PARALLEL IMAGE ATTACHMENT - FIXED ORDER AND VARIABLES
    const attachmentPromises = await Promise.all([
      // For ProgramChoose (purpuse data with purpuseimages)
      attachImagesToItems(purpuseData || [], purpuseimages || [], "image"),
      // For ProgramPlacement (subPlacementJson with PlacementAddsimages)
      attachImagesToItems(subPlacementJson || [], PlacementAddsimages || [], "image"),
      // For SpecialisationResource (resourcesData with resourcesimages)
      attachImagesToItems(resourcesData || [], resourcesimages || [], "image"),
      // For SpecialisationElectives (electivesData with electvieimages)
      attachImagesToItems(electivesData || [], electvieimages || [], "image"),
      // For ProgramSummary (summaryJson with summaryAudio)
      attachImagesToItems(summaryJson || [], summaryAudio || [], "audio"),
      // For SpecialisationProgramCareer (fincalceAdds with fincalceAddsimages)
      attachImagesToItems(fincalceAdds || [], fincalceAddsimages || [], "image")
    ]);

    // Destructure results with meaningful names
    const [finalChoose, finalSubPlacementJson, finalResources, finalElectives, finalSummary, finalCareer] = attachmentPromises;

    // 6. GENERATE SLUG
    const generatedSlug = await generateUniqueSlug(prisma, req.body.name);

    // 7. PREPARE MAIN PROGRAM DATA
    const programData = {
      title: req.body.name?.trim() || "",
      slug: req.body.slug?.trim() || generatedSlug,
      description: req.body.descriptions?.trim() || "",
      bannerImage: uploadedFiles["cover_image"]?.[0] ? toPublicUrl(req, uploadedFiles["cover_image"][0]) : "",
      icon: uploadedFiles["icon"]?.[0] ? toPublicUrl(req, uploadedFiles["icon"][0]) : "",
      bannerImageAlt: req.body.bannerImageAlt?.trim() || req.body.name?.trim() || "",
      pdfdownlaod: uploadedFiles["pdf_download"]?.[0] ? toPublicUrl(req, uploadedFiles["pdf_download"][0]) : null,
      audio: uploadedFiles["audio"]?.[0] ? toPublicUrl(req, uploadedFiles["audio"][0]) : null,
      career_growth: req.body.career_growth?.trim() || "",
      duration: req.body.duration?.trim() || "",
      specialization: req.body.specialization?.trim() || "",
      subtitle: req.body.subtitle?.trim() || "",
      shortDescription: req.body.shortDescription?.trim() || "",
      video: req.body.video?.trim() || "",
      universitytitle: req.body.universitytitle?.trim() || "",
      universitydesc: req.body.universitydesc?.trim() || "",
      universitybtmdesc: req.body.universitybtmdesc?.trim() || "",
      university_id: universityIds || [],
      conclusion: req.body.conclusion?.trim() || "",
      specialisationtitle: req.body.specialisationtitle?.trim() || "",
      specialisationdesc: req.body.specialisationdesc?.trim() || "",
      program_id: Number(req.body.program_id) || 1,
      notes_title: req.body.note_title?.trim() || "",
      notes_desc: req.body.notes_descriptions?.trim() || "",
      demand_desc: req.body.demand_desc?.trim() || "",
      demand_title: req.body.demand_title?.trim() || ""
    };

    // 8. TRANSACTION WITH ALL CREATIONS
    const result = await prisma.$transaction(async (tx) => {
      // Create main program
      const specialisationProgram = await tx.SpecialisationProgram.create({
        data: programData,
      });
      const programId = specialisationProgram.id;

      // 9. PREPARE ALL RELATED DATA CREATIONS
      const relatedDataCreations = [
        // ProgramAcademic
        tx.ProgramAcademic.create({
          data: {
            title: req.body.academictitle?.trim() || "",
            description: req.body.academicdesc?.trim() || "",
            Image: uploadedFiles["academic_cover_image"]?.[0] ? toPublicUrl(req, uploadedFiles["academic_cover_image"][0]) : "",
            image_alt: req.body.academic_image_alt?.trim() || "",
            entra_title: req.body.entracetitle?.trim() || "",
            entra_desc: req.body.entracedesc?.trim() || "",
            entra_image: uploadedFiles["entrace_cover_image"]?.[0] ? toPublicUrl(req, uploadedFiles["entrace_cover_image"][0]) : "",
            entra_image_alt: req.body.entra_image_alt?.trim() || req.body.entracetitle?.trim() || "",
            specialisation_program_id: programId,
            notes_title: req.body.degree_title?.trim() || "",
            notes_desc: req.body.degree_desc?.trim() || "",
          },
        }),

        // ProgramSummary
        tx.ProgramSummary.create({
          data: {
            title: req.body.summarytitle?.trim() || "",
            description: req.body.summarydesc?.trim() || "",
            button: req.body.summarybutton?.trim() || "",
            summary_audio: uploadedFiles["summary_audio"]?.[0] ? toPublicUrl(req, uploadedFiles["summary_audio"][0]) : "",
            specialisation_program_id: programId
          },
        }),

        // ProgramChoose - using purpuse data
        tx.ProgramChoose.create({
          data: {
            title: req.body.purpusename?.trim() || "",
            description: req.body.purpsedesc?.trim() || "",
            choose: finalChoose || [],
            specialisation_program_id: programId,
          },
        }),

        // ProgramEntrance
        tx.ProgramEntrance.create({
          data: {
            icon: uploadedFiles["entrance_icon"]?.[0] ? toPublicUrl(req, uploadedFiles["entrance_icon"][0]) : "",
            title: req.body.onlinetitle?.trim() || "",
            description: req.body.onlinedesc?.trim() || "",
            Entrance: onlines || [],
            specialisation_program_id: programId,
          },
        }),

        // ProgramDurationFees
        tx.ProgramDurationFees.create({
          data: {
            title: req.body.durationtitle?.trim() || "",
            description: req.body.durationdesc?.trim() || "",
            duration: DurationData || [],
            specialisation_program_id: programId,
          },
        }),

        // SpecialisationElectives
        tx.SpecialisationElectives.create({
          data: {
            title: req.body.electivetitle?.trim() || "",
            description: req.body.electivedesc?.trim() || "",
            electives: finalElectives || [],
            specialisation_program_id: programId,
          },
        }),

        // ProgramCurriculum
        tx.ProgramCurriculum.create({
          data: {
            title: req.body.semesters_title?.trim() || "",
            description: req.body.semesters_notes?.trim() || "",
            curriculum_id: semesters || [],
            specialisation_program_id: programId,
          },
        }),

        // SpecialisationAdmission
        tx.SpecialisationAdmission.create({
          data: {
            title: req.body.admission_title?.trim() || "",
            description: req.body.admission_desc?.trim() || "",
            subtitle: req.body.admission_sub_title?.trim() || "",
            subdesc: req.body.admission_sub_desc?.trim() || "",
            notes: req.body.adminssion_notes?.trim() || "",
            doc_title: req.body.doc_title?.trim() || "",
            doc_des: req.body.doc_des?.trim() || "",
            entrance_title: req.body.entrance_title?.trim() || "",
            entrance_des: req.body.entrance_des?.trim() || "",
            direct_title: req.body.direct_title?.trim() || "",
            direct_desc: req.body.direct_desc?.trim() || "",
            specialisation_program_id: programId,
          },
        }),

        // SpecialisationResource
        tx.SpecialisationResource.create({
          data: {
            notes: req.body.resource_notes?.trim() || "",
            description: req.body.resource_desc?.trim() || "",
            title: req.body.resource_title?.trim() || "",
            resources: finalResources || [],
            specialisation_program_id: programId,
          },
        }),

        // SpecialisationProgramCareer
        tx.SpecialisationProgramCareer.create({
          data: {
            title: req.body.opp_name?.trim() || "",
            description: req.body.opp_desc?.trim() || "",
            sub_title: req.body.financialname?.trim() || "",
            sub_description: req.body.financialdescription?.trim() || "",
            Career: finalCareer || [],
            sector_title: req.body.sector_name?.trim() || "",
            sector_description: req.body.sector_desc?.trim() || "",
            specialisation_program_id: programId,
          },
        }),

        // SpecialisationSalary
        tx.SpecialisationSalary.create({
          data: {
            title: req.body.salarytitle?.trim() || "",
            description: req.body.salarydesc?.trim() || "",
            notes: req.body.salarynote?.trim() || "",
            salary: salary || [],
            specialisation_program_id: programId,
          },
        }),

        // ProgramPlacement
        tx.ProgramPlacement.create({
          data: {
            title: req.body.placementname?.trim() || "",
            description: req.body.placementdescription?.trim() || "",
            placement_ids: placementIdsJson || [],
            subtitle: req.body.partnersname?.trim() || "",
            Subdec: req.body.partnersdesc?.trim() || "",
            subplacement: finalSubPlacementJson || [],
            specialisation_program_id: programId,
          },
        }),

        // ProgramGraph
        tx.ProgramGraph.create({
          data: {
            title: req.body.futuretitle?.trim() || "",
            description: req.body.futuredesc?.trim() || "",
            subdesc: req.body.futurebtmdesc?.trim() || "",
            yearly: yearlyData || [],
            specialisation_program_id: programId,
          },
        }),

        // ProgramInstitutes
        tx.ProgramInstitutes.create({
          data: {
            title: req.body.instututitle?.trim() || "",
            description: req.body.instutudesc?.trim() || "",
            Institutes: institutesJson || [],
            specialisation_program_id: programId,
          },
        }),

        // Faq
        tx.Faq.create({
          data: {
            specialisation_program_id: programId,
            faqs: faqs || [],
          },
        }),

        // Seo
        tx.Seo.upsert({
          where: { specialisation_program_id: programId },
          update: {
            meta_title: req.body.meta_title?.trim() || "",
            meta_description: req.body.meta_description?.trim() || "",
            meta_keywords: req.body.meta_keywords?.trim() || "",
            canonical_url: req.body.canonical_url?.trim() || "",
          },
          create: {
            specialisation_program_id: programId,
            meta_title: req.body.meta_title?.trim() || "",
            meta_description: req.body.meta_description?.trim() || "",
            meta_keywords: req.body.meta_keywords?.trim() || "",
            canonical_url: req.body.canonical_url?.trim() || "",
          },
        }),
      ];

      // Execute all creations in parallel
      await Promise.all(relatedDataCreations);

      return specialisationProgram;
    }, { timeout: 30000 });

    return successResponse(res, "Specialization Program added successfully", 201, result);

  } catch (error) {
    console.error("❌ AddSpecialisationProgram ERROR =====================");
    console.error("Error:", error);
    console.error("Request Body:", JSON.stringify(req.body, null, 2));
    console.error("Uploaded Files:", req.files);
    console.error("========================================");

    // Handle specific Prisma errors
    if (error.code === "P2002") {
      return errorResponse(res, `Duplicate entry: ${error.meta?.target?.join(", ")} already exists`, 400);
    }

    if (error.code === "P2003") {
      return errorResponse(res, "Foreign key constraint failed", 400);
    }

    if (error.code === "P2025") {
      return errorResponse(res, "Record not found", 404);
    }

    return errorResponse(res, "Internal server error", 500);
  }
});

exports.GetSpecialisationProgramList = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return errorResponse(res, "University id is required", 400);
    }

    const SpecialisationProgramList = await prisma.SpecialisationProgram.findMany({
      where: {
        program_id: Number(id),
      },
    });

    if (!SpecialisationProgramList || SpecialisationProgramList.length === 0) {
      return validationErrorResponse(res, "SpecialisationProgramList not found", 404);
    }

    return successResponse(res, "SpecialisationProgramList list fetched successfully", 200, SpecialisationProgramList);

  } catch (error) {
    if (error.code === "P2025") {
      return errorResponse(res, "SpecialisationProgramList not found", 404);
    }
    return errorResponse(res, error.message, 500);
  }
});



exports.GetSpecialisationProgramById = catchAsync(async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      return errorResponse(res, "Spe. Program slug is required", 400);
    }
    const ProgramData = await prisma.SpecialisationProgram.findFirst({
      where: {
        slug: slug,
        // deleted_at: null,
      },
      include: {
        summary: true,
        careers: true,
        placement: true,
        choose: true,
        academic: true,
        graph: true,
        entrance: true,
        faqs: true,
        seo: true,
        institutes: true,
        durationfees: true,
        salary: true,
        resource: true,
        specialisationAdmission: true,
        programCurriculum: true,
        electives: true,
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


exports.GetSpecialisationProgramByUniverty = catchAsync(async (req, res) => {
  try {
    const { specialisation_id } = req.query;
    if (!specialisation_id) {
      return errorResponse(res, "Spe. Program id is required", 400);
    }

    const ProgramData = await prisma.SpecialisationProgram.findFirst({
      where: { id: Number(specialisation_id) },
    });

    if (!ProgramData) {
      return errorResponse(res, "Program not found", 404);
    }

    const universityIds = ProgramData.university_id;

    // Only University list
    const universities = await prisma.University.findMany({
      where: {
        id: { in: universityIds },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        cover_image: true,
      },
    });

    return successResponse(res, "Universities fetched successfully", 200, universities);
  } catch (error) {
    console.error("❌ GetProgramById error", error);
    return errorResponse(
      res,
      error.message || "Something went wrong while fetching program",
      500
    );
  }
});



//  Program Specialisation Delete Controller Logic
exports.specialisationDelete = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return validationErrorResponse(res, "Specialisation Program ID is required", 400);
    }

    const SpecialisationprogramId = Number(id);

    const existingProgram = await prisma.SpecialisationProgram.findUnique({
      where: { id: SpecialisationprogramId },
    });

    if (!existingProgram) {
      return validationErrorResponse(res, "Specialisation Program not found", 404);
    }

    let updatedRecord;

    /* ------------------------------------------
       RESTORE IF ALREADY DELETED
    ------------------------------------------- */
    if (existingProgram.deleted_at) {
      updatedRecord = await prisma.SpecialisationProgram.update({
        where: { id: SpecialisationprogramId },
        data: { deleted_at: null },
      });

      return successResponse(res, "Specialisation Program restored successfully", 200, updatedRecord);
    }

    /* ------------------------------------------
       SOFT DELETE
    ------------------------------------------- */
    updatedRecord = await prisma.SpecialisationProgram.update({
      where: { id: SpecialisationprogramId },
      data: { deleted_at: new Date() },
    });

    return successResponse(
      res,
      "Specialisation Program deleted successfully",
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



exports.adminupdateSpecialisationProgram = catchAsync(async (req, res) => {
  try {
    /* -------------------------------------------------- */
    /* 1. VALIDATION */
    /* -------------------------------------------------- */
    const programId = Number(req.body.id);
    if (!programId) {
      return errorResponse(res, "Specialisation Program ID is required", 400);
    }
Loggers.error(req.body)
    const existingProgram = await prisma.SpecialisationProgram.findUnique({
      where: { id: programId },
    });

    if (!existingProgram) {
      return errorResponse(res, "Specialisation Program not found", 404);
    }

    /* -------------------------------------------------- */
    /* 2. FILE PROCESSING */
    /* -------------------------------------------------- */
    const uploadedFiles = {};
    req.files?.forEach(file => {
      if (!uploadedFiles[file.fieldname]) uploadedFiles[file.fieldname] = [];
      uploadedFiles[file.fieldname].push(file.path);
    });

    /* -------------------------------------------------- */
    /* 3. PARSE JSON DATA */
    /* -------------------------------------------------- */
    const [
      faqs,
      institutes,
      placementIds,
      subPlacement,
      career,
      summary,
      universityIds,
      onlines,
      salary,
      yearly,
      duration,
      semesters,
      resources,
      electives,
      purpuse
    ] = await Promise.all([
      safeParseArray(req.body.faqs),
      safeParseArray(req.body.institutes),
      safeParseArray(req.body.selectedPartners),
      safeParseArray(req.body.PlacementAdds),
      safeParseArray(req.body.fincalceAdds),
      safeParseArray(req.body.summary),
      safeParseArray(req.body.university_id),
      safeParseArray(req.body.onlines),
      safeParseArray(req.body.salary),
      safeParseArray(req.body.yearlyData),
      safeParseArray(req.body.DurationData),
      safeParseArray(req.body.semesters),
      safeParseArray(req.body.resources),
      safeParseArray(req.body.electives),
      safeParseArray(req.body.purpuse),
    ]);

    /* -------------------------------------------------- */
    /* 4. MAP UPLOADED FILE ARRAYS */
    /* -------------------------------------------------- */
    const [
      fincalceAddsimages,
      purpuseimages,
      PlacementAddsimages,
      summaryAudio,
      resourcesimages,
      electiveimages
    ] = await Promise.all([
      mapUploadedArray(req, uploadedFiles, "fincalceAddsimages"),
      mapUploadedArray(req, uploadedFiles, "purpuseimages"),
      mapUploadedArray(req, uploadedFiles, "PlacementAddsimages"),
      mapUploadedArray(req, uploadedFiles, "summaryaudio"),
      mapUploadedArray(req, uploadedFiles, "resourcesimages"),
      mapUploadedArray(req, uploadedFiles, "electvieimages"),
    ]);

    /* -------------------------------------------------- */
    /* 5. TRANSACTION */
    /* -------------------------------------------------- */
    await prisma.$transaction(async (tx) => {

      /* ---------- MAIN PROGRAM ---------- */
      await tx.SpecialisationProgram.update({
        where: { id: programId },
        data: {
          title: req.body.name,
          slug: req.body.slug,
          description: req.body.descriptions,
          bannerImage: uploadedFiles.cover_image?.[0]
            ? toPublicUrl(req, uploadedFiles.cover_image[0])
            : undefined,
               icon: uploadedFiles.icon?.[0]
            ? toPublicUrl(req, uploadedFiles.icon[0])
            : undefined,
          pdfdownlaod: uploadedFiles.pdf_download?.[0]
            ? toPublicUrl(req, uploadedFiles.pdf_download[0])
            : undefined,
          audio: uploadedFiles.audio?.[0]
            ? toPublicUrl(req, uploadedFiles.audio[0])
            : undefined,
          duration: req.body.duration,
          specialization: req.body.specialization,
          university_id: universityIds,
          conclusion: req.body.conclusion,
        },
      });

      /* ---------- PROGRAM ACADEMIC ---------- */
      await tx.ProgramAcademic.upsert({
        where: { specialisation_program_id: programId },
        update: {
          title: req.body.academictitle,
          description: req.body.academicdesc,
          Image: uploadedFiles.academic_cover_image?.[0]
            ? toPublicUrl(req, uploadedFiles.academic_cover_image[0])
            : undefined,
          image_alt: req.body.academic_image_alt,
        },
        create: {
          specialisation_program_id: programId,
          title: req.body.academictitle,
          description: req.body.academicdesc,
          Image: uploadedFiles.academic_cover_image?.[0]
            ? toPublicUrl(req, uploadedFiles.academic_cover_image[0])
            : "",
          image_alt: req.body.academic_image_alt,
        },
      });

      /* ---------- PROGRAM SUMMARY ---------- */
      const existingSummary = await tx.ProgramSummary.findFirst({
        where: { specialisation_program_id: programId },
      });

      const finalSummary = attachImagesToItems(
        summary,
        summaryAudio,
        "audio",
        existingSummary?.summary_audio
      );

      await tx.ProgramSummary.upsert({
        where: { specialisation_program_id: programId },
        update: {
          title: req.body.summarytitle,
          description: req.body.summarydesc,
          summary_audio: uploadedFiles["summary_audio"]?.[0] ? toPublicUrl(req, uploadedFiles["summary_audio"][0]) : "",
        },
        create: {
          specialisation_program_id: programId,
          title: req.body.summarytitle,
          description: req.body.summarydesc,
          summary_audio: uploadedFiles["summary_audio"]?.[0] ? toPublicUrl(req, uploadedFiles["summary_audio"][0]) : "",
        },
      });

      /* ---------- PROGRAM CHOOSE ---------- */
      const existingChoose = await tx.ProgramChoose.findFirst({
        where: { specialisation_program_id: programId },
      });

      const finalChoose = attachImagesToItems(
        purpuse,
        purpuseimages,
        "image",
        existingChoose?.choose
      );

      await tx.ProgramChoose.upsert({
        where: { specialisation_program_id: programId },
        update: {
          title: req.body.purpusename,
          description: req.body.purpsedesc,
          choose: finalChoose,
        },
        create: {
          specialisation_program_id: programId,
          title: req.body.purpusename,
          description: req.body.purpsedesc,
          choose: finalChoose,
        },
      });

  await tx.ProgramGraph.upsert({
        where: { specialisation_program_id: programId },
        update: {
       title: req.body.futuretitle?.trim() || "",
            description: req.body.futuredesc?.trim() || "",
            subdesc: req.body.futurebtmdesc?.trim() || "",
            yearly:      safeParseArray(req.body.yearlyData)|| [],
            specialisation_program_id: programId,
        },
        create: {
        title: req.body.futuretitle?.trim() || "",
            description: req.body.futuredesc?.trim() || "",
            subdesc: req.body.futurebtmdesc?.trim() || "",
            yearly: safeParseArray(req.body.yearlyData) || [],
            specialisation_program_id: programId,
        },
      });
      /* ---------- PLACEMENT ---------- */
      const existingPlacement = await tx.ProgramPlacement.findFirst({
        where: { specialisation_program_id: programId },
      });

      const finalSubPlacement = attachImagesToItems(
        subPlacement,
        PlacementAddsimages,
        "image",
        existingPlacement?.subplacement
      );

      await tx.ProgramPlacement.upsert({
        where: { specialisation_program_id: programId },
        update: {
          title: req.body.placementname,
          description: req.body.placementdescription,
          placement_ids: placementIds,
          subplacement: finalSubPlacement,
        },
        create: {
          specialisation_program_id: programId,
          title: req.body.placementname,
          description: req.body.placementdescription,
          placement_ids: placementIds,
          subplacement: finalSubPlacement,
        },
      });

      /* ---------- CAREER / FINANCIAL ---------- */
      const existingCareer = await tx.SpecialisationProgramCareer.findFirst({
        where: { specialisation_program_id: programId },
      });

      const finalCareer = attachImagesToItems(
        career,
        fincalceAddsimages,
        "image",
        existingCareer?.Career
      );

      await tx.SpecialisationProgramCareer.upsert({
        where: { specialisation_program_id: programId },
        update: {
         title: req.body.opp_name?.trim() || "",
            description: req.body.opp_desc?.trim() || "",
            sub_title: req.body.financialname?.trim() || "",
            sub_description: req.body.financialdescription?.trim() || "",
            Career: finalCareer || [],
            sector_title: req.body.sector_name?.trim() || "",
            sector_description: req.body.sector_desc?.trim() || "",
            specialisation_program_id: programId,
        },
        create: {
         title: req.body.opp_name?.trim() || "",
            description: req.body.opp_desc?.trim() || "",
            sub_title: req.body.financialname?.trim() || "",
            sub_description: req.body.financialdescription?.trim() || "",
            Career: finalCareer || [],
            sector_title: req.body.sector_name?.trim() || "",
            sector_description: req.body.sector_desc?.trim() || "",
            specialisation_program_id: programId,
        },
      });

      /* ---------- RESOURCES ---------- */
      const existingResources = await tx.SpecialisationResource.findFirst({
        where: { specialisation_program_id: programId },
      });

      const finalResources = attachImagesToItems(
        resources,
        resourcesimages,
        "image",
        existingResources?.resources
      );

      await tx.SpecialisationResource.upsert({
        where: {
          specialisation_program_id: programId, // ✅ OK for WHERE (unique)
        },
        update: {
          title: req.body.resource_title || existingResources?.title || "",
          description: req.body.resource_desc || existingResources?.description || "",
          notes: req.body.resource_notes || existingResources?.notes || "",
          resources: finalResources,
        },
        create: {
          title: req.body.resource_title || "",
          description: req.body.resource_desc || "",
          notes: req.body.resource_notes || "",
          resources: finalResources,

          // ✅ RELATION CONNECT (MOST IMPORTANT)
          specialisationProgram: {
            connect: { id: programId },
          },
        },
      });

      /* ---------- ELECTIVES ---------- */
      const existingElectives = await tx.SpecialisationElectives.findFirst({
        where: { specialisation_program_id: programId },
      });

      const finalElectives = attachImagesToItems(
        electives,
        electiveimages,
        "image",
        existingElectives?.electives
      );

      await tx.SpecialisationElectives.upsert({
        where: {
          specialisation_program_id: programId, // ✅ OK for WHERE (unique)
        },
        update: {
          title: req.body.electivetitle || existingElectives?.title || "",
          description: req.body.electivedesc || existingElectives?.description || "",
          notes: existingElectives?.notes || "",
          electives: finalElectives,
        },
        create: {
          title: req.body.electivetitle || "",
          description: req.body.electivedesc || "",
          notes: req.body.resource_notes || "",
          electives: finalElectives,

          // ✅ RELATION CONNECT (MOST IMPORTANT)
          specialisationProgram: {
            connect: { id: programId },
          },
        },
      });
      /* ---------- FAQ ---------- */
      await tx.Faq.upsert({
        where: { specialisation_program_id: programId },
        update: { faqs },
        create: {
          specialisation_program_id: programId,
          faqs,
        },
      });

       // ProgramEntrance

         await tx.ProgramEntrance.upsert({
        where: { specialisation_program_id: programId },
        update: {  icon: uploadedFiles["entrance_icon"]?.[0] ? toPublicUrl(req, uploadedFiles["entrance_icon"][0]) : "",
            title: req.body.onlinetitle?.trim() || "",
            description: req.body.onlinedesc?.trim() || "",
            Entrance: onlines || [],
            specialisation_program_id: programId, },
        create: {
          icon: uploadedFiles["entrance_icon"]?.[0] ? toPublicUrl(req, uploadedFiles["entrance_icon"][0]) : "",
            title: req.body.onlinetitle?.trim() || "",
            description: req.body.onlinedesc?.trim() || "",
            Entrance: onlines || [],
            specialisation_program_id: programId,
        },
      });
// ProgramDurationFees

      await tx.ProgramDurationFees.upsert({
        where: { specialisation_program_id: programId },
        update: {
           title: req.body.durationtitle?.trim() || "",
            description: req.body.durationdesc?.trim() || "",
            duration: safeParseArray(req.body.DurationData) || [],
            specialisation_program_id: programId,
        },
        create: {
            title: req.body.durationtitle?.trim() || "",
            description: req.body.durationdesc?.trim() || "",
            duration: safeParseArray(req.body.DurationData) || [],
            specialisation_program_id: programId,
        },
      });
      await tx.ProgramCurriculum.upsert({
        where: { specialisation_program_id: programId },
        update: {
            title: req.body.semesters_title?.trim() || "",
            description: req.body.semesters_notes?.trim() || "",
            curriculum_id: semesters || [],
            specialisation_program_id: programId,
        },
        create: {
             title: req.body.semesters_title?.trim() || "",
            description: req.body.semesters_notes?.trim() || "",
            curriculum_id: semesters || [],
            specialisation_program_id: programId,
        },
      });

         await tx.ProgramInstitutes.upsert({
        where: { specialisation_program_id: programId },
        update: {
      title: req.body.instututitle?.trim() || "",
            description: req.body.instutudesc?.trim() || "",
            Institutes:  safeParseArray(req.body.institutes ) || [],
            specialisation_program_id: programId,
        },
        create: {
            title: req.body.instututitle?.trim() || "",
            description: req.body.instutudesc?.trim() || "",
            Institutes: safeParseArray(req.body.institutes ) || [],
            specialisation_program_id: programId,
        },
      });


      
       await tx.SpecialisationSalary.upsert({
        where: { specialisation_program_id: programId },
        update: {
             title: req.body.salarytitle?.trim() || "",
            description: req.body.salarydesc?.trim() || "",
            notes: req.body.salarynote?.trim() || "",
            salary: salary || [],
            specialisation_program_id: programId,
        },
        create: {
                title: req.body.salarytitle?.trim() || "",
            description: req.body.salarydesc?.trim() || "",
            notes: req.body.salarynote?.trim() || "",
            salary: salary || [],
            specialisation_program_id: programId,
        },
      });
     



   
        await tx.SpecialisationAdmission.upsert({
        where: { specialisation_program_id: programId },
        update: {
     title: req.body.admission_title?.trim() || "",
            description: req.body.admission_desc?.trim() || "",
            subtitle: req.body.admission_sub_title?.trim() || "",
            subdesc: req.body.admission_sub_desc?.trim() || "",
            notes: req.body.adminssion_notes?.trim() || "",
            doc_title: req.body.doc_title?.trim() || "",
            doc_des: req.body.doc_des?.trim() || "",
            entrance_title: req.body.entrance_title?.trim() || "",
            entrance_des: req.body.entrance_des?.trim() || "",
            direct_title: req.body.direct_title?.trim() || "",
            direct_desc: req.body.direct_desc?.trim() || "",
            specialisation_program_id: programId,
        },
        create: {
            title: req.body.admission_title?.trim() || "",
            description: req.body.admission_desc?.trim() || "",
            subtitle: req.body.admission_sub_title?.trim() || "",
            subdesc: req.body.admission_sub_desc?.trim() || "",
            notes: req.body.adminssion_notes?.trim() || "",
            doc_title: req.body.doc_title?.trim() || "",
            doc_des: req.body.doc_des?.trim() || "",
            entrance_title: req.body.entrance_title?.trim() || "",
            entrance_des: req.body.entrance_des?.trim() || "",
            direct_title: req.body.direct_title?.trim() || "",
            direct_desc: req.body.direct_desc?.trim() || "",
            specialisation_program_id: programId,
        },
      });

      /* ---------- SEO ---------- */
      await tx.Seo.upsert({
        where: { specialisation_program_id: programId },
        update: {
          meta_title: req.body.meta_title,
          meta_description: req.body.meta_description,
          meta_keywords: req.body.meta_keywords,
          canonical_url: req.body.canonical_url,
        },
        create: {
          specialisation_program_id: programId,
          meta_title: req.body.meta_title,
          meta_description: req.body.meta_description,
          meta_keywords: req.body.meta_keywords,
          canonical_url: req.body.canonical_url,
        },
      });
    }, { timeout: 30000 });

    return successResponse(res, "Specialisation Program updated successfully", 200);

  } catch (error) {
    console.error("❌ UPDATE SPECIALISATION PROGRAM ERROR", error);
    return errorResponse(res, "Internal server error", 500);
  }
});

