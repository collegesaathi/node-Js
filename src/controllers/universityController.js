
const prisma = require("../config/prisma");
const catchAsync = require("../utils/catchAsync");
const { successResponse, errorResponse, validationErrorResponse } = require("../utils/ErrorHandling");
const Logger = require("../utils/Logger");


exports.allUniversities = catchAsync(async (req, res) => {
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = 9;

  const skip = (page - 1) * limit;

  // --- Fetch categories with courses ---
  const categories = await prisma.category.findMany({
    orderBy: { id: "asc" },
    include: {
      courses: { orderBy: { created_at: "asc" } }
    }
  });

  // If categories failed (rare but possible)
  if (!categories) {
    return errorResponse(res, "Failed to fetch categories", 500);
  }

  // --- Fetch universities ---
  const universities = await prisma.university.findMany({
    where: { deleted_at: null },
    orderBy: [
      { position: { sort: "asc", nulls: "last" } },
      { created_at: "desc" }
    ],
    skip,
    take: limit,
  });

  if (!universities) {
    return errorResponse(res, "Failed to fetch universities", 500);
  }

  // --- Count total ---
  const totalUniversities = await prisma.university.count({
    where: { deleted_at: null }
  });

  const totalPages = Math.ceil(totalUniversities / limit);

  return successResponse(res, "Universities fetched successfully", 201, {
    categories,
    universities,
    pagination: {
      page,
      limit,
      totalPages,
      totalUniversities,
    }
  });

});

// Admin University Listing
exports.adminUniversitylisting = catchAsync(async (req, res) => {
  const BASE_URL = process.env.BASE_URL;

  let universities = await prisma.university.findMany({
    where: { deleted_at: null },
    orderBy: [
      { position: "asc" },
      { created_at: "desc" }
    ]
  });

  universities = universities.map(item => ({
    ...item,
    icon: item.icon ? `${BASE_URL}/universities/icon/${item.icon}` : null,
    cover_image: item.cover_image ? `${BASE_URL}/universities/main/${item.cover_image}` : null
  }));

  return successResponse(res, "Admin all universities data fetched successfully", 200, {
    universities
  });
});

// Admin University 
exports.adminapprovalsplacements = catchAsync(async (req, res) => {
  const BASE_URL = process.env.BASE_URL;

  // --- Fetch Approvals ---
  let approvals = await prisma.approvals.findMany({
    where: { deleted_at: null },
    orderBy: { created_at: "asc" },
  });

  if (!approvals) {
    return errorResponse(res, "Failed to fetch approvals", 500);
  }

  // Convert image paths to full URLs
  approvals = approvals.map(item => ({
    ...item,
    image: item.image && !item.image.startsWith("http")
      ? `${BASE_URL}/approval_images/${item.image}`
      : item.image
  }));

  // --- Fetch Placements ---
  let placements = await prisma.placements.findMany({
    where: { deleted_at: null },
    orderBy: { created_at: "asc" },
  });

  if (!placements) {
    return errorResponse(res, "Failed to fetch placements", 500);
  }

  placements = placements.map(item => ({
    ...item,
    image: item.image && !item.image.startsWith("http")
      ? `${BASE_URL}/placement_partners/${item.image}`
      : item.image
  }));

  return successResponse(res, "Admin university data fetched successfully", 200, {
    approvals,
    placements,
  });
});



exports.allAdminUniversities = catchAsync(async (req, res) => {
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = 9;
  const skip = (page - 1) * limit;
  const universities = await prisma.university.findMany({
    skip,
    take: limit,
  });

  if (!universities) {
    return errorResponse(res, "Failed to fetch universities", 500);
  }

  // --- Count total ---
  const totalUniversities = await prisma.university.count({});

  const totalPages = Math.ceil(totalUniversities / limit);

  return successResponse(res, "Universities fetched successfully", 201, {
    universities,
    pagination: {
      page,
      limit,
      totalPages,
      totalUniversities,
    }
  });
});


exports.universitiesDelete = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return errorResponse(res, "Univesirty ID is required", 400);
    }
    const existingApproval = await prisma.university.findUnique({
      where: {
        id: parseInt(id),
      }
    });
    if (!existingApproval) {
      return errorResponse(res, "University not found", 404);
    }
    let updatedRecord;
    if (existingApproval.deleted_at) {
      updatedRecord = await prisma.university.update({
        where: { id: parseInt(id) },
        data: { deleted_at: null }
      });

      return successResponse(res, "University restored successfully", 200, updatedRecord);
    }

    updatedRecord = await prisma.university.update({
      where: { id: parseInt(id) },
      data: { deleted_at: new Date() }
    });

    return successResponse(res, "University deleted successfully", 200, updatedRecord);
  } catch (error) {
    console.log("Soft Delete Error:", error);
    if (error.code === 'P2025') {
      return errorResponse(res, "University not found", 404);
    }
    return errorResponse(res, error.message, 500);
  }
});

// helpers at top of file

async function generateUniqueSlug(baseSlug) {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.University.findUnique({
      where: { slug }
    });

    if (!existing) return slug;

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

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
function mapUploadedArray(req, uploadedFiles, fieldPrefix) {
  const arr = [];
  Object.keys(uploadedFiles).forEach(key => {
    if (key.startsWith(fieldPrefix + "[")) {
      const match = key.match(/\[(\d+)\]/);
      if (!match) return;
      const index = Number(match[1]);
      // uploadedFiles stores raw path (file.path)
      arr[index] = toPublicUrl(req, uploadedFiles[key]);
    }
  });
  return arr;
}

// Attach images into items array: items[idx][keyName] = images[idx]
function attachImagesToItems(items = [], images = [], keyName) {
  if (!Array.isArray(items)) return items;
  items.forEach((item, idx) => {
    if (images[idx]) {
      // ensure item is object
      if (typeof item === "object" && item !== null) {
        item[keyName] = images[idx];
      } else {
        // if item is primitive (string), replace with object
        items[idx] = { value: item, [keyName]: images[idx] };
      }
    }
  });
  return items;
}

// ----------------------
// Controller
// ----------------------
exports.addUniversity = catchAsync(async (req, res) => {
  try {
    Logger.info(req.body);

    // collect uploaded files: store raw path under fieldname keys
    const uploadedFiles = {};
    req.files?.forEach(file => {
      // file.fieldname might be "servicesimages[0]" or "icon" etc.
      uploadedFiles[file.fieldname] = file.path;
    });
    Logger.info(uploadedFiles);

    // parse arrays safely (accepts already-parsed arrays too)
    let services = parseArray(req.body.services);
    let patterns = parseArray(req.body.patterns);
    let advantages = parseArray(req.body.advantages);
    let campusList = parseArray(req.body.campusList);
    let fees = parseArray(req.body.fees);
    let facts = parseArray(req.body.facts);
    let onlines = parseArray(req.body.onlines);
    let faqs = parseArray(req.body.faqs);
    let descriptions = parseArray(req.body.descriptions);

    // build images arrays from uploadedFiles; pass req so toPublicUrl can use host
    const patternsImages = mapUploadedArray(req, uploadedFiles, "patternsimages");
    const servicesImages = mapUploadedArray(req, uploadedFiles, "servicesimages");
    const servicesIcons = mapUploadedArray(req, uploadedFiles, "servicesicon");
    const campusImages = mapUploadedArray(req, uploadedFiles, "campusimages");
    const factsImages = mapUploadedArray(req, uploadedFiles, "factsimages");

    // attach images to corresponding items
    services = attachImagesToItems(services, servicesImages, "image");
    services = attachImagesToItems(services, servicesIcons, "icon");
    patterns = attachImagesToItems(patterns, patternsImages, "image");
    campusList = attachImagesToItems(campusList, campusImages, "image");
    facts = attachImagesToItems(facts, factsImages, "image");

    // build final data (ensure icon/cover are converted to public URLs too)
    const finalData = {
      slug: req.body.slug || "",
      name: req.body.name || "",
      position: req.body.position || 0,
      about_title: req.body.about_title || "",
      about_desc: req.body.about_desc || "",
      partnersdesc: req.body.partnersdesc || "",
      advantagesname: req.body.advantagesname || "",
      advantagesdescription: req.body.advantagesdescription || "",
      descriptions: descriptions,
      approvals_name: req.body.approvals_name,
      approvals_desc: req.body.approvals_desc,
      certificatename: req.body.certificatename,
      certificatedescription: req.body.certificatedescription,
      certificatemage: toPublicUrl(req, uploadedFiles["certificatemage"]) || req.body.icon || null,
      icon: toPublicUrl(req, uploadedFiles["icon"]) || req.body.icon || null,
      cover_image: toPublicUrl(req, uploadedFiles["cover_image"]) || req.body.cover_image || null,
      servicedesc: req.body.servicedesc,
      servicetitle: req.body.servicetitle,
      services,
      patterns,
      partnersname: req.body.partnersname,
      partnersdesc: req.body.partnersdesc,
      patterndescription: req.body.patterndescription,
      title: req.body.patternname,
      bottompatterndesc: req.body.bottompatterndesc,
      advantages,
      campusList,
      fees,
      facts,
      factsname: req.body.factsname,
      onlines,
      onlinetitle: req.body.onlinetitle,
      onlinedesc: req.body.onlinedesc,
      financialdescription: req.body.financialdescription,
      faqs,
      approvals: parseArray(req.body.approvals),
      partners: parseArray(req.body.partners),
      rankings_name: req.body.rankings_name || "",
      rankings_description: req.body.rankings_description || "",
      financialname: req.body.financialname,
      // add other fields as needed
    };

    Logger.silly(finalData);

    // Save with Prisma (example)
    const Universitydata = await prisma.University.create({
      data: {
        name: finalData.name || "Untitled",
        cover_image: finalData.cover_image,
        position: Number(finalData.position || 0),
        description: finalData.descriptions, // Prisma field should be Json? or String[] depending on schema
        icon: finalData.icon,
        slug: finalData.slug,
      }
    });
    console.log("Universitydata", Universitydata)
    if (Universitydata.id) {
      await prisma.UniversityAbout.create({
        data: {
          university_id: Number(Universitydata.id),
          title: finalData.about_title,
          description: finalData.about_desc
        }
      })

      await prisma.UniversityFaq.create({
        data: {
          university_id: Number(Universitydata.id),
          faqs: finalData.faqs,
        }
      })

      await prisma.UniversityCampus.create({
        data: {
          university_id: Number(Universitydata.id),
          campus: finalData.campusList,
        }
      })


      await prisma.UniversityServices.create({
        data: {
          university_id: Number(Universitydata.id),
          title: finalData.servicetitle,
          description: finalData.servicedesc,
          services: finalData.services || ""
        }
      })
      await prisma.UniversityFacts.create({
        data: {
          university_id: Number(Universitydata.id),
          title: finalData.factsname,
          facts: finalData.facts || ""
        }
      })


      await prisma.UniversityAdvantages.create({
        data: {
          university_id: Number(Universitydata.id),
          title: finalData.advantagesname,
          description: finalData.advantagesdescription,
          advantages: finalData.advantages
        }
      })

      await prisma.UniversityApprovals.create({
        data: {
          university_id: Number(Universitydata.id),
          title: finalData.approvals_name,
          description: finalData.approvals_desc,
          approval_ids: finalData.approvals
        }
      })


      await prisma.UniversityAdmissionProcess.create({
        data: {
          university_id: Number(Universitydata.id),
          title: finalData.onlinetitle,
          description: finalData.onlinedesc,
          process: finalData.onlines
        }
      })
      await prisma.UniversityCertificates.create({
        data: {
          university_id: Number(Universitydata.id),
          title: finalData.certificatename,
          description: finalData.certificatedescription,
          image: finalData.certificatemage
        }
      })
      await prisma.UniversityFinancialAid.create({
        data: {
          title: finalData.financialname,
          description: finalData.financialdescription || null,
          aid: finalData.fees,
          university_id: Number(Universitydata.id),
        }
      })

      await prisma.UniversityRankings.create({
        data: {
          university_id: Number(Universitydata.id),
          title: finalData.rankings_name,
          description: finalData.rankings_description,
        }
      })

      await prisma.UniversityExamPatterns.create({
        data: {
          university_id: Number(Universitydata.id),
          title: finalData.patterndescription,
          description: finalData.patterndescription,
          bottompatterndesc: finalData.bottompatterndesc,
          patterns: finalData.patterns
        }
      })

      await prisma.UniversityPartners.create({
        data: {
          university_id: Number(Universitydata.id),
          title: finalData.partnersname,
          description: finalData.partnersdesc,
          placement_partner_id: finalData.partners
        }
      })

    }

    return res.status(200).json({
      status: true,
      message: "University Saved Successfully!",
      data: finalData
    });

  } catch (error) {
  console.error("addUniversity error:", error);

  // check for Prisma unique constraint error
  if (error.code === "P2002") {
    return res.status(400).json({
      status: false,
      message: `Duplicate field value: ${error.meta.target.join(", ")}`,
      code: error.code
    });
  }

  // fallback for any other errors
  return res.status(500).json({
    status: false,
    message: error.message || "Something went wrong",
  });
}
});


exports.getUniversityById = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return errorResponse(res, "University ID is required", 400);
  }

  const universityId = parseInt(id);

  const university = await prisma.university.findUnique({
    where: { id: universityId, deleted_at: null },
    include: {
      details: true,
      about: true,
      approvals: true,
      rankings: true,
      advantages: true,
      facts: true,
      certificates: true,
      examPatterns: true,
      financialAid: true,
      universityCampuses: true,
      partners: true,
      services: true,
      admissionProcess: true,
      faq: true,
      seo: true,
      blogs: true,
      campus: true,
      courseDetails: true,
      leads: true,
    }
  });

  if (!university) {
    return errorResponse(res, "University not found", 404);
  }

  return successResponse(res, "University fetched successfully", 200, {
    university
  });
});
