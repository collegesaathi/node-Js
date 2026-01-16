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
Loggers.http(req.body)
Loggers.http(uploadedFiles)

    // 3. PARALLEL PARSING OF ALL ARRAYS
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
      universityIds,
      resources,
      onlines,
      salary,
      yearlyData,
      DurationData,
      electives,
      semesters
    ] = await Promise.all([
      safeParseArray(req.body.faqs),
      safeParseArray(req.body.keyhight),
      safeParseArray(req.body.institutes),
      safeParseArray(req.body.selectedPartners),
      safeParseArray(req.body.PlacementAdds),
      safeParseArray(req.body.curriculm),
      safeParseArray(req.body.fincalceAdds),
      safeParseArray(req.body.summary),
      safeParseArray(req.body.choose),
      safeParseArray(req.body.purpuse),
      safeParseArray(req.body.university_id),
      safeParseArray(req.body.resources),
      safeParseArray(req.body.onlines),
      safeParseArray(req.body.salary),
      safeParseArray(req.body.yearlyData),
      safeParseArray(req.body.DurationData),
      safeParseArray(req.body.electives),
      safeParseArray(req.body.semesters)
    ]);

    // 4. PARALLEL FILE MAPPING
    const [
      factsImages,
      purpuseimages,
      PlacementAddsimages,
      summaryAudio
    ] = await Promise.all([
      mapUploadedArray(req, uploadedFiles, "fincalceAddsimages"),
      mapUploadedArray(req, uploadedFiles, "purpuseimages"),
      mapUploadedArray(req, uploadedFiles, "PlacementAddsimages"),
      mapUploadedArray(req, uploadedFiles, "summaryaudio")
    ]);

    // 5. PARALLEL IMAGE ATTACHMENT
    const [
      finalFincalceAdds,
      finalChoose,
      finalSubPlacementJson,
      finalSummary
    ] = await Promise.all([
      attachImagesToItems(fincalceAdds, factsImages, "image"),
      attachImagesToItems(purpuse, purpuseimages, "image"),
      attachImagesToItems(subPlacementJson, PlacementAddsimages, "image"),
      attachImagesToItems(summaryJson, summaryAudio, "audio")
    ]);

    // 6. GENERATE SLUG
    const generatedSlug = await generateUniqueSlug(prisma, req.body.name);

    // 7. PREPARE MAIN PROGRAM DATA
    const programData = {
      title: req.body.name?.trim() || "",
      slug: req.body.slug?.trim() || generatedSlug,
      description: req.body.descriptions?.trim() || "",
      bannerImage: toPublicUrl(req, uploadedFiles["cover_image"]) || "",
      bannerImageAlt: req.body.bannerImageAlt?.trim() || req.body.name?.trim() || "",
      pdfdownlaod: toPublicUrl(req, uploadedFiles["pdf_download"]?.[0]),
      audio: toPublicUrl(req, uploadedFiles["audio"]?.[0]),
      career_growth: req.body.career_growth?.trim() || "",
      duration: req.body.duration?.trim() || "",
      specialization: req.body.specialization?.trim() || "",
      subtitle: req.body.subtitle?.trim() || "",
      shortDescription: req.body.shortDescription?.trim() || "",
      video: req.body.video?.trim() || "",
      universitytitle: req.body.universitytitle?.trim() || "",
      universitydesc: req.body.universitydesc?.trim() || "",
      universitybtmdesc: req.body.universitybtmdesc?.trim() || "",
      university_id: universityIds,
      conclusion: req.body.conclusion?.trim() || "",
      specialisationtitle: req.body.specialisationtitle?.trim() || "",
      specialisationdesc: req.body.specialisationdesc?.trim() || "",
      category_id: Number(req.body.category_id) || 1,
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
      console.log("specialisationProgram" ,specialisationProgram)

      const programId = specialisationProgram.id;

      console.log("programId" ,programId)


      // 9. PREPARE ALL RELATED DATA CREATIONS
      const relatedDataCreations = [
        // ProgramAcademic
        tx.ProgramAcademic.create({
          data: {
            title: req.body.academictitle?.trim() || "",
            description: req.body.academicdesc?.trim() || "",
            Image: toPublicUrl(req, uploadedFiles["academic_cover_image"]) || "",
            image_alt: req.body.academic_image_alt?.trim() || "",
            entra_title: req.body.entracetitle?.trim() || "",
            entra_desc: req.body.entracedesc?.trim() || "",
            entra_image: toPublicUrl(req, uploadedFiles["entrace_cover_image"]) || "",
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
            summary_audio: toPublicUrl(req, uploadedFiles["summary_audio"]) || "",
            specialisation_program_id: programId
          },
        }),
        // ProgramChoose
        tx.ProgramChoose.create({
          data: {
            title: req.body.purpusename?.trim() || "",
            description: req.body.purpsedesc?.trim() || "",
            choose: finalChoose,
            specialisation_program_id: programId,
          },
        }),

        // ProgramEntrance
        tx.ProgramEntrance.create({
          data: {
            icon: toPublicUrl(req, uploadedFiles["entrance_icon"]) || "",
            title: req.body.onlinetitle?.trim() || "",
            description: req.body.onlinedesc?.trim() || "",
            Entrance: onlines,
            specialisation_program_id: programId,
          },
        }),

           // ProgramDurationFees
        tx.ProgramDurationFees.create({
          data: {
            title: req.body.durationtitle?.trim() || "",
            description: req.body.durationdesc?.trim() || "",
            duration: DurationData,
            specialisation_program_id: programId,
          },
        }),

            // SpecialisationElectives
        tx.SpecialisationElectives.create({
          data: {
            title: req.body.electivetitle?.trim() || "",
            description: req.body.electivedesc?.trim() || "",
            electives: electives,
            specialisation_program_id: programId,
          },
        }),

        
        // ProgramCurriculum
        tx.ProgramCurriculum.create({
          data: {
            title: req.body.semesters_title?.trim() || "",
            description: req.body.semesters_notes?.trim() || "",
            curriculum_id: semesters,
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
            notes: req.body.admission_notes?.trim() || "",
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
            resources: resources,
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
            Career: fincalceAdds,
            sector_title: req.body.sector_name?.trim() || "",
            sector_description: req.body.sector_desc?.trim() || "",
            specialisation_program_id: programId,
          },
        }),


          // (Salary)
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
            placement_ids: placementIdsJson,
            subtitle: req.body.partnersname?.trim() || "",
            Subdec: req.body.partnersdesc?.trim() || "",
            subplacement: finalSubPlacementJson,
            specialisation_program_id: programId,
          },
        }),
        // ProgramGraph
        tx.ProgramGraph.create({
          data: {
            title: req.body.futuretitle?.trim() || "",
            description: req.body.futuredesc?.trim() || "",
            subdesc: req.body.futurebtmdesc?.trim() || "",
            yearly: yearlyData,
            specialisation_program_id: programId,
          },
        }),
            // Professionals
        tx.ProgramInstitutes.create({
          data: {
            title: req.body.instututitle?.trim() || "",
            description: req.body.instutudesc?.trim() || "",
            Institutes: institutesJson,
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