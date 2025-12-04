
const prisma = require("../config/prisma");
const catchAsync = require("../utils/catchAsync");
const { successResponse, errorResponse, validationErrorResponse } = require("../utils/ErrorHandling");
const Logger = require("../utils/Logger");

const parseJSON = (data) => {
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
};

// inject uploaded file paths inside JSON fields
const applyImagesToJSON = (jsonData, uploadedFiles, prefix) => {
  const arr = parseJSON(jsonData);

  if (!Array.isArray(arr)) return arr;

  return arr.map((item, index) => {
    for (let key in item) {
      const field = `${prefix}[${index}][${key}]`;
      if (uploadedFiles[field]) {
        item[key] = uploadedFiles[field];  // replace with uploaded file path
      }
    }
    return item;
  });
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
    orderBy: { created_at: "desc" },
  });

  if (!approvals) {
    return errorResponse(res, "Failed to fetch approvals", 500);
  }

  // Convert image paths to full URLs
  approvals = approvals.map(item => ({
    ...item,
    image: item.image ? `${BASE_URL}/approval_images/${item.image}` : null
  }));

  // --- Fetch Placements ---
  let placements = await prisma.placements.findMany({
    where: { deleted_at: null },
    orderBy: { created_at: "desc" },
  });

  if (!placements) {
    return errorResponse(res, "Failed to fetch placements", 500);
  }

  placements = placements.map(item => ({
    ...item,
    image: item.image ? `${BASE_URL}/placement_partners/${item.image}` : null
  }));

  return successResponse(res, "Admin university data fetched successfully", 200, {
    approvals,
    placements,
  });
});

// exports.addUniversity = async (req, res) => {
//   try {
//     console.log("req.body =>", req.body);
//     Logger.info(req.body)
//     let uploadedFiles = {};
//     req.files?.forEach((file) => {
//       uploadedFiles[file.fieldname] = file.path; // store as fieldname → path
//     });
//     Logger.info(uploadedFiles)
//     console.log("Uploaded Files =>", uploadedFiles);
//     const services = applyImagesToJSON(req.body.services, uploadedFiles, "services");
//     const advantages = applyImagesToJSON(req.body.advantages, uploadedFiles, "advantages");
//     const patterns = applyImagesToJSON(req.body.patterns, uploadedFiles, "patterns");
//     const campusList = applyImagesToJSON(req.body.campusList, uploadedFiles, "campusList");
//     const fees = applyImagesToJSON(req.body.fees, uploadedFiles, "fees");
//     const facts = applyImagesToJSON(req.body.facts, uploadedFiles, "facts");
//     const onlines = applyImagesToJSON(req.body.onlines, uploadedFiles, "onlines");
//     // Final JSON object
//     const finalData = {
//       ...req.body,
//       services,
//       advantages,
//       patterns,
//       campusList,
//       fees,
//       facts,
//       onlines,
//       icon: uploadedFiles["icon"] || null,
//       cover_image: uploadedFiles["cover_image"] || null
//     };

//     Logger.silly(finalData)

//     return res.status(200).json({
//       status: true,
//       message: "University Saved Successfully!",
//       data: finalData
//     });

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ status: false, message: "Internal Server Error" });
//   }
// };



// Helper: Parse JSON fields safely
function parseArray(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (err) {
    return [];
  }
}

// Helper: Map files like name[0] → correct index array
function mapUploadedArray(uploadedFiles, fieldPrefix) {
  const arr = [];
  Object.keys(uploadedFiles).forEach(key => {
    if (key.startsWith(fieldPrefix + "[")) {
      const index = Number(key.match(/\[(\d+)\]/)[1]);
      arr[index] = uploadedFiles[key];
    }
  });
  return arr;
}

// Helper: Attach images to items
function attachImagesToItems(items, images, keyName) {
  items.forEach((item, idx) => {
    if (images[idx]) {
      item[keyName] = images[idx];
    }
  });
  return items;
}


exports.addUniversity = async (req, res) => {
  try {
    Logger.info(req.body)
    let uploadedFiles = {};

    req.files?.forEach((file) => {
      uploadedFiles[file.fieldname] = file.path;
    });
    Logger.info(uploadedFiles)
    // Parse main arrays
    let services = parseArray(req.body.services);
    let patterns = parseArray(req.body.patterns);
    let advantages = parseArray(req.body.advantages);
    let campusList = parseArray(req.body.campusList);
    let fees = parseArray(req.body.fees);
    let facts = parseArray(req.body.facts);
    let onlines = parseArray(req.body.onlines);
    let faqs = parseArray(req.body.faqs);
    // Extract image arrays
    const patternsImages = mapUploadedArray(uploadedFiles, "patternsimages");
    const servicesImages = mapUploadedArray(uploadedFiles, "servicesimages");
    const servicesIcons = mapUploadedArray(uploadedFiles, "servicesicon");
    const campusImages = mapUploadedArray(uploadedFiles, "campusimages");
    const factsImages = mapUploadedArray(uploadedFiles, "factsimages");

    // Attach images to correct array items
    services = attachImagesToItems(services, servicesImages, "image");
    services = attachImagesToItems(services, servicesIcons, "icon");
    patterns = attachImagesToItems(patterns, patternsImages, "image");
    campusList = attachImagesToItems(campusList, campusImages, "image");
    facts = attachImagesToItems(facts, factsImages, "image");
    const finalData = {
      // ✅ BASIC INFO
      slug: req.body.slug || "",
      name: req.body.name || "",
      position: req.body.position || "",

      // ✅ ABOUT SECTION
      about_title: req.body.about_title || "",
      about_desc: req.body.about_desc || "",
      descriptions: parseArray(req.body.descriptions),

      // ✅ MEDIA
      icon: uploadedFiles["icon"] || null,
      cover_image: uploadedFiles["cover_image"] || null,

      // ✅ MAIN ARRAYS (Parsed)
      services,
      patterns,
      advantages,
      campusList,
      fees,
      facts,
      onlines,
      faqs,

      // ✅ EXTRA SECTIONS (If Required)
      approvals: parseArray(req.body.approvals),
      partners: parseArray(req.body.partners),
      rankings_name: req.body.rankings_name || "",
      rankings_description: req.body.rankings_description || "",

      // ✅ FINANCIAL / CERTIFICATE
      financialname: req.body.financialname || "",
      financialdescription: req.body.financialdescription || "",
      certificatename: req.body.certificatename || "",
      certificatedescription: req.body.certificatedescription || "",

      // ✅ ADVANTAGE TITLES
      advantagesname: req.body.advantagesname || "",
      advantagesdescription: req.body.advantagesdescription || "",

      // ✅ FACTS TITLE
      factsname: req.body.factsname || "",

      // ✅ PARTNERS
      partnersname: req.body.partnersname || "",
      partnersdesc: req.body.partnersdesc || "",

      // ✅ ONLINE HEADING
      onlinetitle: req.body.onlinetitle || "",
      onlinedesc: req.body.onlinedesc || "",
    };

    console.log("campusList", campusList)

    Logger.silly(finalData)

    return res.status(200).json({
      status: true,
      message: "University Saved Successfully!",
      data: finalData
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

