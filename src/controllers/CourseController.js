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
  const existingSlugs = await prisma.Course.findMany({
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



exports.AddCourse = catchAsync(async (req, res) => {
  try {
    Logger.error(req.body)
    // collect uploaded files: store raw path under fieldname keys
    const uploadedFiles = {};
    req.files?.forEach(file => {
      // file.fieldname might be "servicesimages[0]" or "icon" etc.
      uploadedFiles[file.fieldname] = file.path;
    });
    Logger.error(uploadedFiles)
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
      name: req.body.name || "",
      slug: req.body.slug || "",
      position: req.body.position || 0,
      cover_image_alt: req.body.cover_image_alt,
      university_id: req.body.university_id,
      icon_alt: req.body.icon_alt,
      image_alt: req.body.image_alt,
      category_id: req.body.category_id,
      about_title: req.body.about_title || "",
      about_desc: req.body.about_desc || "",
      semester_fees: req.body.semester_fees || "",
      anuual_fees: req.body.anuual_fees || "",
      tuition_fees: req.body.tuition_fees || "",
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
      patternname: req.body.patternname,
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
      meta_title: req.body.meta_title,
      meta_description: req.body.meta_description,
      canonical_url: req.body.canonical_url,
      meta_keywords: req.body.meta_keywords,
      creteria: req.body.creteria,
      IndianCriteria: req.body.indian,
      NRICriteria: req.body.nri,
      semesters_title: req.body.semesters_title,
      semesters: req.body.semesters,
      skillsname: req.body.skillsname,
      skilsdescription: req.body.skilsdescription,
      skills: req.body.skills,
      careername: req.body.careername,
      careermanages: req.body.careermanages,
      careerdesc: req.body.careerdesc,
      // add other fields as needed
    };
    const generatedSlug = await generateUniqueSlug(prisma, finalData.name);
    // Save with Prisma (example)
    const CoursesData = await prisma.Course.create({
      data: {
        name: finalData.name || "Untitled",
        cover_image: finalData.cover_image,
        position: Number(finalData.position || 0),
        description: finalData.descriptions, // Prisma field should be Json? or String[] depending on schema
        icon: finalData.icon,
        slug: finalData.slug ? finalData.slug : generatedSlug,
        cover_image_alt: finalData?.cover_image_alt,
        icon_alt: finalData?.icon_alt,
        category_id: Number(finalData.category_id || 0),
        university_id: Number(finalData.university_id || 0)
      }
    });
    if (CoursesData.id) {
      await prisma.About.create({
        data: {
          course_id: Number(CoursesData.id),
          title: finalData.about_title,
          description: finalData.about_desc
        }
      })
    }

    await prisma.CourseFees.create({
      data: {
        course_id: Number(CoursesData.id),
        annual_fees: (finalData?.anuual_fees),
        semester_wise_fees: (finalData?.semester_fees),
        tuition_fees: (finalData?.tuition_fees)
      }
    })

    await prisma.Faq.create({
      data: {
        course_id: Number(CoursesData.id),
        faqs: finalData.faqs,
      }
    })

    await prisma.Approvals_Management.create({
      data: {
        course_id: Number(CoursesData.id),
        title: finalData.approvals_name,
        description: finalData.approvals_desc,
        approval_ids: finalData.approvals
      }
    })
    await prisma.Rankings.create({
      data: {
        course_id: Number(CoursesData.id),
        title: finalData.rankings_name,
        description: finalData.rankings_description,
      }
    })



    await prisma.EligibilityCriteria.create({
      data: {
        course_id: Number(CoursesData.id),
        title: finalData.creteria,
        NRICriteria: finalData.NRICriteria,
        IndianCriteria: finalData.IndianCriteria || ""
      }
    })
    await prisma.Curriculum.create({
      data: {
        course_id: Number(CoursesData.id),
        title: finalData.semesters_title,
        semesters: finalData.semesters,
      }
    })

    await prisma.Services.create({
      data: {
        course_id: Number(CoursesData.id),
        title: finalData.servicetitle,
        description: finalData.servicedesc,
        services: finalData.services || ""
      }
    })
    await prisma.Certificates.create({
      data: {
        course_id: Number(CoursesData.id),
        title: finalData.certificatename,
        description: finalData.certificatedescription,
        image: finalData.certificatemage,
        image_alt: finalData?.image_alt
      }
    })

    await prisma.CourseSkills.create({
      data: {
        course_id: Number(CoursesData.id),
        title: finalData.skillsname,
        description: finalData.skilsdescription,
        skills: finalData.skills || ""
      }
    })

    await prisma.ExamPatterns.create({
      data: {
        course_id: Number(CoursesData.id),
        title: finalData.patternname,
        description: finalData.patterndescription,
        bottompatterndesc: finalData.bottompatterndesc,
        patterns: finalData.patterns
      }
    })
    await prisma.FinancialAid.create({
      data: {
        title: finalData.financialname,
        description: finalData.financialdescription || null,
        aid: finalData.fees,
        course_id: Number(CoursesData.id),
      }
    })

    await prisma.CourseCareer.create({
      data: {
        title: finalData.careername,
        description: finalData.careerdesc || null,
        Career: finalData.careermanages,
        course_id: Number(CoursesData.id),
      }
    })
    await prisma.Partners.create({
      data: {
        course_id: Number(CoursesData.id),
        title: finalData.partnersname,
        description: finalData.partnersdesc,
        placement_partner_id: finalData.partners
      }
    })
    await prisma.AdmissionProcess.create({
      data: {
        course_id: Number(CoursesData.id),
        title: finalData.onlinetitle,
        description: finalData.onlinedesc,
        process: finalData.onlines
      }
    })


    await prisma.Seo.create({
      data: {
        course_id: Number(CoursesData.id),
        meta_title: finalData.meta_title,
        meta_description: finalData.meta_description,
        meta_keywords: finalData.meta_keywords,
        canonical_url: finalData.canonical_url,
      }
    })
    console.log("CoursesData" ,CoursesData)
    return successResponse(res, "Course Saved successfully", 201, {
      CoursesData,
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



exports.AllCourses = catchAsync(async (req, res) => {
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = 9;
  const skip = (page - 1) * limit;
  const courses = await prisma.Course.findMany({
    where: { deleted_at: null },
    orderBy: [
      { created_at: "desc" }
    ],
    skip,
    take: limit,
  });

  console.log("courses", courses)
  if (!courses) {
    return errorResponse(res, "Failed to fetch courses", 500);
  }

  // --- Count total ---
  const totalCourses = await prisma.Course.count({
    where: { deleted_at: null }
  });

  const totalPages = Math.ceil(totalCourses / limit);

  return successResponse(res, "Course fetched successfully", 201, {
    courses,
    pagination: {
      page,
      limit,
      totalPages,
      totalCourses,
    }
  });

});