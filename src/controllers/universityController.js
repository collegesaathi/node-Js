
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
  const { search } = req.query;
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
  // 1️⃣ Position 1–10 wale
  const topUniversities = await prisma.university.findMany({
    where: {
      deleted_at: null,
      position: { gte: 1, lte: 10 },
    },
    orderBy: {
      position: 'asc'
    }
  });
  // 2️⃣ Baaki sab ( >10 or NULL )
  const otherUniversities = await prisma.university.findMany({
    where: {
      deleted_at: null,
      OR: [
        { position: 0 },        // jinki position set hi nahi hai
        { position: { gt: 10 } }   // jinki position 10 se zyada hai
      ]
    },
    orderBy: [
      { position: 'asc' },
      { created_at: 'desc' }
    ]
  });
  // 3️⃣ Merge
  const finalList = [...topUniversities, ...otherUniversities];

  // 4️⃣ Pagination manual
  const paginated = finalList.slice(skip, skip + limit);

  // 5️⃣ Count
  const totalUniversities = finalList.length;
  const totalPages = Math.ceil(totalUniversities / limit);

  return successResponse(res, "Universities fetched successfully", 201, {
    categories,
    universities: paginated,
    pagination: {
      page,
      limit,
      totalPages,
      totalUniversities,
    }
  });

});

exports.adminUniversitylisting = catchAsync(async (req, res) => {
  const BASE_URL = process.env.BASE_URL;

  let universities = await prisma.university.findMany({
    where: { deleted_at: null },
    // orderBy: [
    //   { position: "asc" },
    //   { created_at: "asc" }
    // ]
    orderBy: [
      { created_at: "asc" }
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
    orderBy: { title: "asc" }, // alphabetically
  });

  if (!approvals) {
    return errorResponse(res, "Failed to fetch approvals", 500);
  }

  approvals = approvals.map(item => ({
    ...item,
    image: item.image && !item.image.startsWith("http")
      ? `${BASE_URL}/approval_images/${item.image}`
      : item.image
  }));

  // --- Fetch Placements ---
  let placements = await prisma.placements.findMany({
    where: { deleted_at: null },
    orderBy: { title: "asc" }, // alphabetically
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
    const { search } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = 9;
  const skip = (page - 1) * limit;
  const universities = await prisma.university.findMany({
    skip,
    take: limit,
    orderBy: [ { created_at: "asc" }],
    where: search && search.length >= 3
          ? {
            name: {
              contains: search,
              mode: "insensitive",
            },
            deleted_at: null
          }
          : {},
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
      return validationErrorResponse(res, "Univesirty ID is required", 400);
    }
    const existingApproval = await prisma.university.findUnique({
      where: {
        id: parseInt(id),
      }
    });
    if (!existingApproval) {
      return validationErrorResponse(res, "University not found", 404);
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
    if (error.code === 'P2025') {
      return errorResponse(res, "University not found", 404);
    }
    return errorResponse(res, error.message, 500);
  }
});

exports.getUniversityById = catchAsync(async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      return errorResponse(res, "University slug is required", 400);
    }
    const university = await prisma.University.findFirst({
      where: {
        slug: slug,
        deleted_at: null,
      },
      include: {
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


function toPublicUrl(req, filePath) {
  if (!filePath) return null;
  const normalized = filePath.replace(/\\/g, "/");
  const index = normalized.indexOf("/uploads/");
  if (index === -1) return null;
  const cleanPath = normalized.substring(index);
  const protocol =
    req.headers["x-forwarded-proto"] === "https" ? "https" : "https";
  const BASE_URL = `${protocol}://${req.get("host")}`;
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



exports.addUniversity = catchAsync(async (req, res) => {
  try {
    // collect uploaded files: store raw path under fieldname keys
    const uploadedFiles = {};
    req.files?.forEach(file => {
      // file.fieldname might be "servicesimages[0]" or "icon" etc.
      uploadedFiles[file.fieldname] = file.path;
    });

    // parse arrays safely (accepts already-parsed arrays too)
    let services = parseArray(req.body.services);
    let patterns = parseArray(req.body.patterns);
    let advantages = parseArray(req.body.advantages);
    let campusList = parseArray(req.body.campusList);
    let campusInternationList = parseArray(req.body.internationalcampus);
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
    const campusInterImages = mapUploadedArray(req, uploadedFiles, "campusinterimages");
    const factsImages = mapUploadedArray(req, uploadedFiles, "factsimages");

    // attach images to corresponding items
    services = attachImagesToItems(services, servicesImages, "image");
    services = attachImagesToItems(services, servicesIcons, "icon");
    patterns = attachImagesToItems(patterns, patternsImages, "image");
    campusList = attachImagesToItems(campusList, campusImages, "image");
    facts = attachImagesToItems(facts, factsImages, "image");
    campusInternationList = attachImagesToItems(campusInterImages, campusInterImages, "image");
    const finalData = {
      meta_title: req.body.meta_title || "",
        rank: req.body.rank || "",
        video:req.body.video || "",
      meta_description: req.body.meta_description || "",
      canonical_url: req.body.canonical_url || "",
      meta_keywords: req.body.meta_keywords || "",
      slug: req.body.slug || "",
      fees_desc: req.body.fees_desc || "",
      name: req.body.name || "",
      position: req.body.position || 0,
      about_title: req.body.about_title || "",
      about_desc: req.body.about_desc || "",
      partnersdesc: req.body.partnersdesc || "",
      advantagesname: req.body.advantagesname || "",
      advantagesdescription: req.body.advantagesdescription || "",
      descriptions: descriptions || "",
      approvals_name: req.body.approvals_name || "",
      approvals_desc: req.body.approvals_desc || "",
      certificatename: req.body.certificatename || "",
      certificatedescription: req.body.certificatedescription || "",
      certificatemage: toPublicUrl(req, uploadedFiles["certificatemage"]) || req.body.certificatemage || null,
      icon: toPublicUrl(req, uploadedFiles["icon"]) || req.body.icon || null,
      cover_image: toPublicUrl(req, uploadedFiles["cover_image"]) || req.body.cover_image || null,
      servicedesc: req.body.servicedesc || "",
      servicetitle: req.body.servicetitle || "",
      services: services || "",
      patterns: patterns || "",
      partnersname: req.body.partnersname || "",
      partnersdesc: req.body.partnersdesc || "",
      patterndescription: req.body.patterndescription || "",
      patternname: req.body.patternname || "",
      bottompatterndesc: req.body.bottompatterndesc || "",
      advantages: advantages || "",
      campusList: campusList || "",
      fees: fees || "",
      facts: facts || "",
      factsname: req.body.factsname || "",
      onlines: onlines || "",
      onlinetitle: req.body.onlinetitle || "",
      onlinedesc: req.body.onlinedesc || "",
      financialdescription: req.body.financialdescription || "",
      faqs: faqs || "",
      approvals: parseArray(req.body.approvals) || "",
      partners: parseArray(req.body.partners) || "",
      rankings_name: req.body.rankings_name || "",
      rankings_description: req.body.rankings_description || "",
      financialname: req.body.financialname || "",
      cover_image_alt: req.body.cover_image_alt || "",
      icon_alt: req.body.icon_alt || "",
      image_alt: req.body.image_alt || "",
      campusInternationList: campusInternationList
      // add other fields as needed
    };

    const generatedSlug = await generateUniqueSlug(prisma, finalData.name);

    // Save with Prisma (example)
    const Universitydata = await prisma.University.create({
      data: {
        fees_desc : finalData?.fees_desc || "",
        name: finalData.name || "Untitled",
        cover_image: finalData.cover_image,
        position: Number(finalData.position || 0),
        description: finalData.descriptions, // Prisma field should be Json? or String[] depending on schema
        icon: finalData.icon,
        slug: finalData.slug ? finalData.slug : generatedSlug,
        cover_image_alt: finalData?.cover_image_alt,
        icon_alt: finalData?.icon_alt,
        rank : finalData.rank,
        video  :  finalData.video
      }
    });

    if (Universitydata.id) {
      await prisma.About.create({
        data: {
          university_id: Number(Universitydata.id),
          title: finalData.about_title,
          description: finalData.about_desc
        }
      })

      await prisma.Faq.create({
        data: {
          university_id: Number(Universitydata.id),
          faqs: finalData.faqs,
        }
      })

      await prisma.UniversityCampus.create({
        data: {
          university_id: Number(Universitydata.id),
          campus: finalData.campusList,
          campusInternationList: finalData.campusInternationList
        }
      })

      await prisma.Services.create({
        data: {
          university_id: Number(Universitydata.id),
          title: finalData.servicetitle,
          description: finalData.servicedesc,
          services: finalData.services || ""
        }
      })

      await prisma.Facts.create({
        data: {
          university_id: Number(Universitydata.id),
          title: finalData.factsname,
          facts: finalData.facts || ""
        }
      })

      await prisma.Advantages.create({
        data: {
          university_id: Number(Universitydata.id),
          title: finalData.advantagesname,
          description: finalData.advantagesdescription,
          advantages: finalData.advantages
        }
      })

      await prisma.Approvals_Management.create({
        data: {
          university_id: Number(Universitydata.id),
          title: finalData.approvals_name,
          description: finalData.approvals_desc,
          approval_ids: finalData.approvals
        }
      })

      await prisma.AdmissionProcess.create({
        data: {
          university_id: Number(Universitydata.id),
          title: finalData.onlinetitle,
          description: finalData.onlinedesc,
          process: finalData.onlines
        }
      })
      await prisma.Certificates.create({
        data: {
          university_id: Number(Universitydata.id),
          title: finalData.certificatename,
          description: finalData.certificatedescription,
          image: finalData.certificatemage,
          image_alt: finalData?.image_alt
        }
      })
      await prisma.FinancialAid.create({
        data: {
          title: finalData.financialname,
          description: finalData.financialdescription || null,
          aid: finalData.fees,
          university_id: Number(Universitydata.id),
        }
      })

      await prisma.Rankings.create({
        data: {
          university_id: Number(Universitydata.id),
          title: finalData.rankings_name,
          description: finalData.rankings_description,
        }
      })

      await prisma.ExamPatterns.create({
        data: {
          university_id: Number(Universitydata.id),
          title: finalData.patternname,
          description: finalData.patterndescription,
          bottompatterndesc: finalData.bottompatterndesc,
          patterns: finalData.patterns
        }
      })

      await prisma.Partners.create({
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
    return successResponse(res, "Universities Saved successfully", 201, {
      finalData,
    });
  } catch (error) {
    console.error("AddCourse error:", error);

    if (error.code === "P2002") {
      return errorResponse(
        res,
        `Duplicate field value: ${error.meta.target.join(", ")}`,
        400
      );
    }

    return errorResponse(
      res,
      "Something went wrong",
      500
    );
  }
});

exports.updateUniversity = catchAsync(async (req, res) => {
  try {
    const universityId = Number(req.body.id);
    if (!universityId) {
      return validationErrorResponse(res, "Univesirty ID is required", 400);
    }
    // Fetch existing university with all relations
    const existing = await prisma.University.findUnique({
      where: { id: universityId },
      include: {
        about: true,
        faq: true,
        universityCampuses: true,
        services: true,
        facts: true,
        advantages: true,
        approvals: true,
        admissionProcess: true,
        certificates: true,
        financialAid: true,
        rankings: true,
        examPatterns: true,
        partners: true,
        seo: true,
      }
    });

    if (!existing) {
      return res.status(404).json({ status: false, message: "University not found" });
    }

    // Collect uploaded files
    const uploadedFiles = {};
    req.files?.forEach((file) => {
      uploadedFiles[file.fieldname] = file.path;
    });

    Loggers.silly(req.body)

    // Parse arrays
    let services = parseArray(req.body.services);
    let patterns = parseArray(req.body.patterns);
    let advantages = parseArray(req.body.advantages);
    let campusList = parseArray(req.body.campusList);
    let internationalcampus = parseArray(req.body.internationalcampus);

    let fees = parseArray(req.body.fees);
    let facts = parseArray(req.body.facts);
    let onlines = parseArray(req.body.onlines);
    let faqs = parseArray(req.body.faqs);
    let descriptions = parseArray(req.body.descriptions);
    // Build images from uploads
    const patternsImages = mapUploadedArray(req, uploadedFiles, "patternsimages");
    const servicesImages = mapUploadedArray(req, uploadedFiles, "servicesimages");
    const servicesIcons = mapUploadedArray(req, uploadedFiles, "servicesicon");
    const campusImages = mapUploadedArray(req, uploadedFiles, "campusimages");
    const campusinterImages = mapUploadedArray(req, uploadedFiles, "campusinterimages");

    const factsImages = mapUploadedArray(req, uploadedFiles, "factsimages");
    // Attach images to arrays
    services = attachImagesToItems(services, servicesImages, "image", existing.services?.services || []);
    services = attachImagesToItems(services, servicesIcons, "icon", existing.services?.services || []);

    patterns = attachImagesToItems(patterns, patternsImages, "image", existing.examPatterns?.patterns || []);

    campusList = attachImagesToItems(campusList, campusImages, "image", existing.universityCampuses?.campus || []);

    facts = attachImagesToItems(facts, factsImages, "image", existing.facts?.facts);
    internationalcampus = attachImagesToItems(internationalcampus, campusinterImages, "image", existing.universityCampuses?.campusInternationList || []);
    // FINAL DATA MERGED WITH EXISTING
    const finalData = {
      meta_title: req.body.meta_title  || "",
      meta_description: req.body.meta_description  || "",
      canonical_url: req.body.canonical_url || "",
      meta_keywords: req.body.meta_keywords  || "",
      name: req.body.name || "",
      rank: req.body.rank  || "",
      slug: req.body.slug || "",
      position: req.body.position  || "",
      icon_alt: req.body.icon_alt  || "",
      about_title: req.body.about_title  || "",
      about_desc: req.body.about_desc || "",
      partnersdesc: req.body.partnersdesc || "",
      partnersname: req.body.partnersname  || "",
      advantagesname: req.body.advantagesname  || "",
      advantagesdescription: req.body.advantagesdescription  || "",
      descriptions: descriptions?.length ? descriptions : existing.description || "",
      approvals_name: req.body.approvals_name  || "",
      approvals_desc: req.body.approvals_desc  || "",
      certificatename: req.body.certificatename || "",
      certificatedescription: req.body.certificatedescription  || "",
      image_alt: req.body.image_alt  || "",
      certificatemage:
        uploadedFiles["certificatemage"]
          ? (deleteUploadedFiles([existing.certificatemage]),
            toPublicUrl(req, uploadedFiles["certificatemage"]))
          : existing?.certificatemage,

      icon:
        uploadedFiles["icon"]
          ? (deleteUploadedFiles([existing?.icon]),
            toPublicUrl(req, uploadedFiles["icon"]))
          : existing?.icon || null,

      cover_image:
        uploadedFiles["cover_image"]
          ? (deleteUploadedFiles([existing?.cover_image]),
            toPublicUrl(req, uploadedFiles["cover_image"]))
          : existing?.cover_image || null,

      servicedesc: req.body.servicedesc  || "",
      servicetitle: req.body.servicetitle || "",
      cover_image_alt: req.body.cover_image_alt || "",
      services: services?.length && services|| "",
      patterns: patterns?.length && patterns || "",

      patterndescription: req.body.patterndescription  || "",
      patternname: req.body.patternname  || "",
      bottompatterndesc: req.body.bottompatterndesc || "",
      advantages: advantages?.length && advantages  || "",
      campusList: campusList?.length && campusList || [],
      internationalcampus: internationalcampus?.length && internationalcampus || [],
      fees: fees || [],
      facts: facts?.length && facts  || "",
      factsname: req.body.factsname || "",
      onlines: onlines?.length && onlines || "",
      onlinetitle: req.body.onlinetitle || "",
      onlinedesc: req.body.onlinedesc || "",
      financialdescription:req.body.financialdescription  || "",
      financialname: req.body.financialname || "",
      faqs: faqs?.length && faqs  || "",
      approvals: parseArray(req.body.approvals)  || [],
      partners: parseArray(req.body.partners)  || [],
      rankings_name: req.body.rankings_name  || "",
      rankings_description: req.body.rankings_description  || "",
    };

    // HANDLE SLUG
    let newSlug = existing.slug;
    if (finalData.name !== existing.name) {
      newSlug = await generateUniqueSlug(prisma, finalData.name, universityId);
    }

    // UPDATE MAIN UNIVERSITY
    const updatedUniversity = await prisma.University.update({
      where: { id: universityId },
      data: {
        name: finalData.name,
        fees_desc  :req.body.fees_desc || "",
        cover_image: finalData.cover_image || "",
        position: Number(finalData.position),
        description: finalData.descriptions,
        icon: finalData.icon || "",
        slug: finalData.slug || newSlug,
        cover_image_alt: finalData.cover_image_alt || "",
        icon_alt: finalData.icon_alt || "",
       rank : finalData.rank || "",
       video :  req.body.video || ""
      }
    });

    // UPDATE RELATIONS (UPSERTS)
    await prisma.About.upsert({
      where: { university_id: universityId },
      update: { title: finalData.about_title, description: finalData.about_desc },
      create: { university_id: universityId, title: finalData.about_title, description: finalData.about_desc }
    });

    await prisma.Faq.upsert({
      where: { university_id: universityId },
      update: { faqs: finalData.faqs },
      create: { university_id: universityId, faqs: finalData.faqs }
    });

    const recoss = await prisma.UniversityCampus.upsert({
      where: { university_id: universityId },
      update: { campus: finalData.campusList, campusInternationList: finalData.internationalcampus },
      create: { university_id: universityId, campus: finalData.campusList, campusInternationList: finalData.internationalcampus }
    });

    await prisma.Services.upsert({
      where: { university_id: universityId },
      update: {
        title: finalData.servicetitle,
        description: finalData.servicedesc,
        services: finalData.services,
      },
      create: {
        university_id: universityId,
        title: finalData.servicetitle,
        description: finalData.servicedesc,
        services: finalData.services,
      }
    });

    await prisma.Facts.upsert({
      where: { university_id: universityId },
      update: { title: finalData.factsname, facts: finalData.facts },
      create: { university_id: universityId, title: finalData.factsname, facts: finalData.facts }
    });

    await prisma.Advantages.upsert({
      where: { university_id: universityId },
      update: {
        title: finalData.advantagesname,
        description: finalData.advantagesdescription,
        advantages: finalData.advantages,
      },
      create: {
        university_id: universityId,
        title: finalData.advantagesname,
        description: finalData.advantagesdescription,
        advantages: finalData.advantages,
      }
    });

    await prisma.Approvals_Management.upsert({
      where: { university_id: universityId },
      update: {
        title: finalData.approvals_name,
        description: finalData.approvals_desc,
        approval_ids: finalData.approvals,
      },
      create: {
        university_id: universityId,
        title: finalData.approvals_name,
        description: finalData.approvals_desc,
        approval_ids: finalData.approvals,
      }
    });

    await prisma.AdmissionProcess.upsert({
      where: { university_id: universityId },
      update: {
        title: finalData.onlinetitle,
        description: finalData.onlinedesc,
        process: finalData.onlines,
      },
      create: {
        university_id: universityId,
        title: finalData.onlinetitle,
        description: finalData.onlinedesc,
        process: finalData.onlines,
      }
    });

    await prisma.Certificates.upsert({
      where: { university_id: universityId },
      update: {
        title: finalData.certificatename,
        description: finalData.certificatedescription,
        image: finalData.certificatemage,
        image_alt: finalData.image_alt,
      },
      create: {
        university_id: universityId,
        title: finalData.certificatename,
        description: finalData.certificatedescription,
        image: finalData.certificatemage,
        image_alt: finalData.image_alt,

      }
    });

    await prisma.FinancialAid.upsert({
      where: { university_id: universityId },
      update: {
        title: finalData.financialname,
        description: finalData.financialdescription,
        aid: finalData.fees,
      },
      create: {
        university_id: universityId,
        title: finalData.financialname,
        description: finalData.financialdescription,
        aid: finalData.fees,
      }
    });

    await prisma.Rankings.upsert({
      where: { university_id: universityId },
      update: { title: finalData.rankings_name, description: finalData.rankings_description },
      create: { university_id: universityId, title: finalData.rankings_name, description: finalData.rankings_description }
    });

    const record = await prisma.ExamPatterns.upsert({
      where: { university_id: universityId },
      update: {
        title: finalData.patternname,
        description: finalData.patterndescription,
        bottompatterndesc: finalData.bottompatterndesc,
        patterns: finalData.patterns,
      },
      create: {
        university_id: universityId,
        title: finalData.patternname,
        description: finalData.patterndescription,
        bottompatterndesc: finalData.bottompatterndesc,
        patterns: finalData.patterns,
      }
    });

    await prisma.Partners.upsert({
      where: { university_id: universityId },
      update: {
        title: finalData.partnersname,
        description: finalData.partnersdesc,
        placement_partner_id: finalData.partners,
      },
      create: {
        university_id: universityId,
        title: finalData.partnersname,
        description: finalData.partnersdesc,
        placement_partner_id: finalData.partners,
      }
    });

    await prisma.Seo.upsert({
      where: { university_id: universityId },
      update: {
        meta_title: finalData.meta_title,
        meta_description: finalData.meta_description,
        meta_keywords: finalData.meta_keywords,
        canonical_url: finalData.canonical_url,
      },
      create: {
        university_id: universityId,
        meta_title: finalData.meta_title,
        meta_description: finalData.meta_description,
        meta_keywords: finalData.meta_keywords,
        canonical_url: finalData.canonical_url,
      }
    });
    return successResponse(
      res,
      "University Updated Successfully!",
      201,
      updatedUniversity
    );

  }
  catch (error) {
    console.error("AddCourse error:", error);

    if (error.code === "P2002") {
      return errorResponse(
        res,
        `Duplicate field value: ${error.meta.target.join(", ")}`,
        400
      );
    }

    return errorResponse(
      res,
      "Something went wrong",
      500
    );
  }
});


