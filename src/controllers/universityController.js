
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
  const existingSlugs = await prisma.university.findMany({
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
    orderBy: [
      { position: { sort: "asc", nulls: "last" } },
      { created_at: "desc" }
    ],
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
    const finalData = {
      meta_title: req.body.meta_title,
      meta_description: req.body.meta_description,
      canonical_url: req.body.canonical_url,
      meta_keywords: req.body.meta_keywords,
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
    const generatedSlug = await generateUniqueSlug(prisma, finalData.name);

    // Save with Prisma (example)
    const Universitydata = await prisma.University.create({
      data: {
        name: finalData.name || "Untitled",
        cover_image: finalData.cover_image,
        position: Number(finalData.position || 0),
        description: finalData.descriptions, // Prisma field should be Json? or String[] depending on schema
        icon: finalData.icon,
        slug: finalData.slug ? finalData.slug : generatedSlug,
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
          title: finalData.patternname,
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

      await prisma.Seo.create({
        data: {
          university_id: Number(Universitydata.id),
          meta_title: finalData.meta_title,
          meta_description: finalData.meta_description,
          meta_keywords: finalData.meta_keywords,
          canonical_url: finalData.canonical_url,
        }
      })
    }
    console.log("Done  all  point ")
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
  try {
    const { slug } = req.params;
    if (!slug) {
      return errorResponse(res, "University slug is required", 400);
    }

    // Fetch university and one-to-one relations (per your prisma model)
    const university = await prisma.University.findFirst({
      where: {
        slug: slug,
        deleted_at: null,
      },
      include: {
        // fields taken from the schema you provided (one-to-one or arrays)
        blogs: true,
        courseDetails: true,
        leads: true,
        about: true,
        admissionProcess: true,
        advantages: true,
        approvals: true,
        universityCampuses: true,
        certificates: true,
        examPatterns: true,
        facts: true,
        faq: true,
        financialAid: true,
        partners: true,
        rankings: true,
        services: true,
        seo: true,
      },
    });

    if (!university) {
      return errorResponse(res, "University not found", 404);
    }

    const toArray = (val) => {
      if (!val && val !== 0) return [];
      return Array.isArray(val) ? val : [val];
    };

    // ----------- Extract partner IDs (defensively) -----------
    let placementPartnerIds = [];

    const partnersRaw = university.partners;
    if (partnersRaw) {
      const partnersArr = toArray(partnersRaw);
      placementPartnerIds = partnersArr.flatMap((p) => {
        if (!p) return [];
        if (Array.isArray(p.placement_partner_id)) return p.placement_partner_id;
        if (p.placement_partner_id) return [p.placement_partner_id];
        if (Array.isArray(p.partner_id)) return p.partner_id;
        if (p.partner_id) return [p.partner_id];
        if (p.id) return [p.id];
        return [];
      });
      placementPartnerIds = Array.from(new Set(placementPartnerIds)).filter(
        (v) => v !== null && v !== undefined
      );
    }

    let placementPartners = [];
    if (placementPartnerIds.length > 0) {
      placementPartners = await prisma.placements.findMany({
        where: { id: { in: placementPartnerIds } },
      });
    }

    // ----------- Extract approval IDs (defensively) -----------
    let approvalIds = [];

    const approvalsRaw = university.approvals;
    if (approvalsRaw) {
      const approvalsArr = toArray(approvalsRaw);
      approvalIds = approvalsArr.flatMap((a) => {
        if (!a) return [];
        if (Array.isArray(a.approval_ids)) return a.approval_ids;
        if (a.approval_ids) return [a.approval_ids];
        if (Array.isArray(a.approval_id)) return a.approval_id;
        if (a.approval_id) return [a.approval_id];
        if (a.id) return [a.id];
        return [];
      });
      approvalIds = Array.from(new Set(approvalIds)).filter(
        (v) => v !== null && v !== undefined
      );
    }

    let approvalsData = [];
    if (approvalIds.length > 0) {
      approvalsData = await prisma.Approvals.findMany({
        where: { id: { in: approvalIds } },
      });
    }


    return successResponse(
      res,
      "University fetched successfully",
      200,
      { university, approvalsData, placementPartners }
    );
  } catch (error) {
    console.error("getUniversityById error:", error);
    return errorResponse(
      res,
      error.message || "Something went wrong while fetching university",
      500,
      error
    );
  }
});


exports.updateUniversity = catchAsync(async (req, res) => {
  try {
    const universityId = req.body.id;
    Logger.debug(req.body);

    // Check if university exists
    const existingUniversity = await prisma.university.findUnique({
      where: { id: Number(universityId) },
      include: {
        // fields taken from the schema you provided (one-to-one or arrays)
        blogs: true,
        courseDetails: true,
        leads: true,
        about: true,
        admissionProcess: true,
        advantages: true,
        approvals: true,
        universityCampuses: true,
        certificates: true,
        examPatterns: true,
        facts: true,
        faq: true,
        financialAid: true,
        partners: true,
        rankings: true,
        services: true,
        seo: true,
      },
    });

    if (!existingUniversity) {
      return res.status(404).json({
        status: false,
        message: "University not found",
      });
    }
    console.lg
    // collect uploaded files: store raw path under fieldname keys
    const uploadedFiles = {};
    req.files?.forEach(file => {
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
    let approvals = parseArray(req.body.approvals);
    let partners = parseArray(req.body.partners);

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

    // Helper function to delete old image if new one is provided
    const handleImageUpdate = (oldImage, newImage) => {
      if (newImage && oldImage && oldImage !== newImage) {
        // Extract relative path from URL if needed
        const oldPath = oldImage.startsWith('http')
          ? oldImage.split('/uploads/')[1]
          : oldImage;
        if (oldPath) {
          deleteUploadedFiles([oldPath]);
        }
      }
      return newImage || oldImage;
    };

    // Process main university images
    const certificatemage = uploadedFiles["certificatemage"]
      ? toPublicUrl(req, uploadedFiles["certificatemage"])
      : req.body.certificatemage;

    const icon = uploadedFiles["icon"]
      ? toPublicUrl(req, uploadedFiles["icon"])
      : req.body.icon;

    const cover_image = uploadedFiles["cover_image"]
      ? toPublicUrl(req, uploadedFiles["cover_image"])
      : req.body.cover_image;

    // Delete old images if new ones are uploaded
    if (certificatemage && existingUniversity.certificates?.image) {
      await deleteUploadedFiles([existingUniversity.certificates.image]);
    }
    if (icon && existingUniversity.icon) {
      await deleteUploadedFiles([existingUniversity.icon]);
    }
    if (cover_image && existingUniversity.cover_image) {
      await deleteUploadedFiles([existingUniversity.cover_image]);
    }

    const finalData = {
      meta_title: req.body.meta_title || existingUniversity.seo?.meta_title,
      meta_description: req.body.meta_description || existingUniversity.seo?.meta_description,
      canonical_url: req.body.canonical_url || existingUniversity.seo?.canonical_url,
      meta_keywords: req.body.meta_keywords || existingUniversity.seo?.meta_keywords,
      slug: req.body.slug || existingUniversity.slug,
      name: req.body.name || existingUniversity.name,
      position: req.body.position || existingUniversity.position,
      about_title: req.body.about_title || existingUniversity.about?.title,
      about_desc: req.body.about_desc || existingUniversity.about?.description,
      partnersdesc: req.body.partnersdesc || existingUniversity.partners?.description,
      advantagesname: req.body.advantagesname || existingUniversity.advantages?.title,
      advantagesdescription: req.body.advantagesdescription || existingUniversity.advantages?.description,
      descriptions: descriptions || existingUniversity.description,
      approvals_name: req.body.approvals_name || existingUniversity.approvals?.title,
      approvals_desc: req.body.approvals_desc || existingUniversity.approvals?.description,
      certificatename: req.body.certificatename || existingUniversity.certificates?.title,
      certificatedescription: req.body.certificatedescription || existingUniversity.certificates?.description,
      certificatemage: certificatemage || existingUniversity.certificates?.image,
      icon: icon || existingUniversity.icon,
      cover_image: cover_image || existingUniversity.cover_image,
      servicedesc: req.body.servicedesc || existingUniversity.services?.description,
      servicetitle: req.body.servicetitle || existingUniversity.services?.title,
      services: services || existingUniversity.services?.services,
      patterns: patterns || existingUniversity.examPatterns?.patterns,
      partnersname: req.body.partnersname || existingUniversity.partners?.title,
      patterndescription: req.body.patterndescription || existingUniversity.examPatterns?.description,
      patternname: req.body.patternname || existingUniversity.examPatterns?.title,
      bottompatterndesc: req.body.bottompatterndesc || existingUniversity.examPatterns?.bottompatterndesc,
      advantages: advantages || existingUniversity.advantages?.advantages,
      campusList: campusList || existingUniversity.campus?.campus,
      fees: fees || existingUniversity.financialAid?.aid,
      facts: facts || existingUniversity.facts?.facts,
      factsname: req.body.factsname || existingUniversity.facts?.title,
      onlines: onlines || existingUniversity.admissionProcess?.process,
      onlinetitle: req.body.onlinetitle || existingUniversity.admissionProcess?.title,
      onlinedesc: req.body.onlinedesc || existingUniversity.admissionProcess?.description,
      financialdescription: req.body.financialdescription || existingUniversity.financialAid?.description,
      faqs: faqs || existingUniversity.faq?.faqs,
      approvals: approvals || existingUniversity.approvals?.approval_ids,
      partners: partners || existingUniversity.partners?.placement_partner_id,
      rankings_name: req.body.rankings_name || existingUniversity.rankings?.title,
      rankings_description: req.body.rankings_description || existingUniversity.rankings?.description,
      financialname: req.body.financialname || existingUniversity.financialAid?.title,
    };

    // Update slug if name changed
    let generatedSlug = existingUniversity.slug;
    if (finalData.name !== existingUniversity.name) {
      generatedSlug = await generateUniqueSlug(prisma, finalData.name, universityId);
    }

    // Update University
    const updatedUniversity = await prisma.university.update({
      where: { id: Number(universityId) },
      data: {
        name: finalData.name,
        cover_image: finalData.cover_image,
        position: Number(finalData.position),
        description: finalData.descriptions,
        icon: finalData.icon,
        slug: finalData.slug || generatedSlug,
      }
    });

    // Update related tables (upsert approach)
    await prisma.universityAbout.upsert({
      where: { university_id: Number(universityId) },
      update: {
        title: finalData.about_title,
        description: finalData.about_desc
      },
      create: {
        university_id: Number(universityId),
        title: finalData.about_title,
        description: finalData.about_desc
      }
    });

    await prisma.universityFaq.upsert({
      where: { university_id: Number(universityId) },
      update: { faqs: finalData.faqs },
      create: {
        university_id: Number(universityId),
        faqs: finalData.faqs,
      }
    });

    await prisma.universityCampus.upsert({
      where: { university_id: Number(universityId) },
      update: { campus: finalData.campusList },
      create: {
        university_id: Number(universityId),
        campus: finalData.campusList,
      }
    });

    await prisma.universityServices.upsert({
      where: { university_id: Number(universityId) },
      update: {
        title: finalData.servicetitle,
        description: finalData.servicedesc,
        services: finalData.services
      },
      create: {
        university_id: Number(universityId),
        title: finalData.servicetitle,
        description: finalData.servicedesc,
        services: finalData.services
      }
    });

    await prisma.universityFacts.upsert({
      where: { university_id: Number(universityId) },
      update: {
        title: finalData.factsname,
        facts: finalData.facts
      },
      create: {
        university_id: Number(universityId),
        title: finalData.factsname,
        facts: finalData.facts
      }
    });

    await prisma.universityAdvantages.upsert({
      where: { university_id: Number(universityId) },
      update: {
        title: finalData.advantagesname,
        description: finalData.advantagesdescription,
        advantages: finalData.advantages
      },
      create: {
        university_id: Number(universityId),
        title: finalData.advantagesname,
        description: finalData.advantagesdescription,
        advantages: finalData.advantages
      }
    });

    await prisma.universityApprovals.upsert({
      where: { university_id: Number(universityId) },
      update: {
        title: finalData.approvals_name,
        description: finalData.approvals_desc,
        approval_ids: finalData.approvals
      },
      create: {
        university_id: Number(universityId),
        title: finalData.approvals_name,
        description: finalData.approvals_desc,
        approval_ids: finalData.approvals
      }
    });

    await prisma.universityAdmissionProcess.upsert({
      where: { university_id: Number(universityId) },
      update: {
        title: finalData.onlinetitle,
        description: finalData.onlinedesc,
        process: finalData.onlines
      },
      create: {
        university_id: Number(universityId),
        title: finalData.onlinetitle,
        description: finalData.onlinedesc,
        process: finalData.onlines
      }
    });

    await prisma.universityCertificates.upsert({
      where: { university_id: Number(universityId) },
      update: {
        title: finalData.certificatename,
        description: finalData.certificatedescription,
        image: finalData.certificatemage
      },
      create: {
        university_id: Number(universityId),
        title: finalData.certificatename,
        description: finalData.certificatedescription,
        image: finalData.certificatemage
      }
    });

    await prisma.universityFinancialAid.upsert({
      where: { university_id: Number(universityId) },
      update: {
        title: finalData.financialname,
        description: finalData.financialdescription,
        aid: finalData.fees
      },
      create: {
        university_id: Number(universityId),
        title: finalData.financialname,
        description: finalData.financialdescription,
        aid: finalData.fees
      }
    });

    await prisma.universityRankings.upsert({
      where: { university_id: Number(universityId) },
      update: {
        title: finalData.rankings_name,
        description: finalData.rankings_description,
      },
      create: {
        university_id: Number(universityId),
        title: finalData.rankings_name,
        description: finalData.rankings_description,
      }
    });

    await prisma.universityExamPatterns.upsert({
      where: { university_id: Number(universityId) },
      update: {
        title: finalData.patternname,
        description: finalData.patterndescription,
        bottompatterndesc: finalData.bottompatterndesc,
        patterns: finalData.patterns
      },
      create: {
        university_id: Number(universityId),
        title: finalData.patternname,
        description: finalData.patterndescription,
        bottompatterndesc: finalData.bottompatterndesc,
        patterns: finalData.patterns
      }
    });

    await prisma.universityPartners.upsert({
      where: { university_id: Number(universityId) },
      update: {
        title: finalData.partnersname,
        description: finalData.partnersdesc,
        placement_partner_id: finalData.partners
      },
      create: {
        university_id: Number(universityId),
        title: finalData.partnersname,
        description: finalData.partnersdesc,
        placement_partner_id: finalData.partners
      }
    });

    await prisma.seo.upsert({
      where: { university_id: Number(universityId) },
      update: {
        meta_title: finalData.meta_title,
        meta_description: finalData.meta_description,
        meta_keywords: finalData.meta_keywords,
        canonical_url: finalData.canonical_url,
      },
      create: {
        university_id: Number(universityId),
        meta_title: finalData.meta_title,
        meta_description: finalData.meta_description,
        meta_keywords: finalData.meta_keywords,
        canonical_url: finalData.canonical_url,
      }
    });

    // Cleanup: Delete uploaded files that were replaced in array items
    // You can implement similar logic for array items if needed

    return res.status(200).json({
      status: true,
      message: "University Updated Successfully!",
      data: updatedUniversity
    });

  } catch (error) {
    console.error("updateUniversity error:", error);

    if (error.code === "P2002") {
      return res.status(400).json({
        status: false,
        message: `Duplicate field value: ${error.meta.target.join(", ")}`,
        code: error.code
      });
    }

    return res.status(500).json({
      status: false,
      message: error.message || "Something went wrong",
    });
  }
});