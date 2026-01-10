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
  const protocol = req.headers["x-forwarded-proto"] === "https" ? "https" : "https";
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



// exports.AddCourse = catchAsync(async (req, res) => {
//   try {
//     const uploadedFiles = {};
//     req.files?.forEach(file => {
//       uploadedFiles[file.fieldname] = file.path;
//     });
//     let services = parseArray(req.body.services);
//     let patterns = parseArray(req.body.patterns);
//     let campusList = parseArray(req.body.campusList);
//     let facts = parseArray(req.body.facts);
//     let indian = parseArray(req.body.indian);
//     let nri = parseArray(req.body.nri);

//     const patternsImages = mapUploadedArray(req, uploadedFiles, "patternsimages");
//     const nriimages = mapUploadedArray(req, uploadedFiles, "nriimages");
//     const indianimages = mapUploadedArray(req, uploadedFiles, "Indianimages");

//     const servicesImages = mapUploadedArray(req, uploadedFiles, "servicesimages");
//     const servicesIcons = mapUploadedArray(req, uploadedFiles, "servicesicon");
//     const campusImages = mapUploadedArray(req, uploadedFiles, "campusimages");
//     const factsImages = mapUploadedArray(req, uploadedFiles, "factsimages");

//     // attach images to corresponding items
//     services = attachImagesToItems(services, servicesImages, "image");
//     services = attachImagesToItems(services, servicesIcons, "icon");
//     patterns = attachImagesToItems(patterns, patternsImages, "image");
//     campusList = attachImagesToItems(campusList, campusImages, "image");
//     facts = attachImagesToItems(facts, factsImages, "image");
//     indian = attachImagesToItems(indian, indianimages, "images");
//     nri = attachImagesToItems(nri, nriimages, "images");

//     const finalData = {
//       name: req.body.name || "",
//       slug: req.body.slug || "",
//       position: req.body.position || 0,
//       descriptions: parseArray(req.body.descriptions) || "",
//       category_id: req.body.category_id || "",
//       cover_image_alt: req.body.cover_image_alt || "",
//       university_id: req.body.university_id || "",
//       icon_alt: req.body.icon_alt || "",
//       image_alt: req.body.image_alt || "",
//       about_title: req.body.about_title || "",
//       about_desc: req.body.about_desc || "",
//       semester_fees: req.body.semester_fees || "",
//       anuual_fees: req.body.anuual_fees || "",
//       tuition_fees: req.body.tuition_fees || "",
//       partnersdesc: req.body.partnersdesc || "",
//       advantagesname: req.body.advantagesname || "",
//       advantagesdescription: req.body.advantagesdescription || "",
//       approvals_name: req.body.approvals_name || "",
//       approvals_desc: req.body.approvals_desc || "",
//       certificatename: req.body.certificatename || "",
//       certificatedescription: req.body.certificatedescription || "",
//       certificatemage: toPublicUrl(req, uploadedFiles["certificatemage"]) || req.body.icon || null,
//       icon: toPublicUrl(req, uploadedFiles["icon"]) || req.body.icon || null,
//       cover_image: toPublicUrl(req, uploadedFiles["cover_image"]) || req.body.cover_image || null,
//       servicedesc: req.body.servicedesc || "",
//       servicetitle: req.body.servicetitle || "",
//       services: services || "",
//       patterns: patterns || "",
//       partnersname: req.body.partnersname || "",
//       partnersdesc: req.body.partnersdesc || "",
//       patterndescription: req.body.patterndescription || "",
//       patternname: req.body.patternname || "",
//       bottompatterndesc: req.body.bottompatterndesc || "",
//       advantages: parseArray(req.body.advantages) || "",
//       campusList: parseArray(req.body.campusList) || "",
//       fees: parseArray(req.body.fees) || "",
//       facts: parseArray(req.body.facts) || "",
//       factsname: req.body.factsname || "",
//       onlines: parseArray(req.body.onlines) || "",
//       onlinetitle: req.body.onlinetitle,
//       onlinedesc: req.body.onlinedesc,
//       financialdescription: req.body.financialdescription,
//       faqs: parseArray(req.body.faqs) || "",
//       approvals: parseArray(req.body.approvals) || "",
//       partners: parseArray(req.body.partners) || "",
//       rankings_name: req.body.rankings_name || "",
//       rankings_description: req.body.rankings_description || "",
//       financialname: req.body.financialname || "",
//       meta_title: req.body.meta_title || "",
//       fees_title: req.body.fees_title || "",
//       meta_description: req.body.meta_description || "",
//       canonical_url: req.body.canonical_url || "",
//       meta_keywords: req.body.meta_keywords || "",
//       creteria: req.body.creteria || "",
//       NRICriteria: nri || "",
//       IndianCriteria: indian || "",
//       semesters_title: req.body.semesters_title || "",
//       semesters: parseArray(req.body.semesters) || "",
//       skillsname: req.body.skillsname || "",
//       skilldesc: req.body.skilldesc || "",
//       skills: parseArray(req.body.skills) || "",
//       careername: req.body.careername || "",
//       careermanages: parseArray(req.body.careermanages) || "",
//       careerdesc: req.body.careerdesc || "",
//       desccreteria: req.body.desccreteria || "" ,
//     };
//     if (!finalData.university_id) {
//       return errorResponse(res, "University Id is required", 400);
//     }

//     if (!finalData.category_id) {
//       return errorResponse(res, "category Id is required", 400);
//     }

//     Logger.http(finalData)

//     const generatedSlug = await generateUniqueSlug(prisma, finalData.name);
//     // Save with Prisma (example)
//     const CoursesData = await prisma.Course.create({
//       data: {
//         name: finalData.name || "Untitled", 
//         cover_image: finalData.cover_image,
//         position: Number(finalData.position || 0),
//         description: finalData.descriptions, // Prisma field should be Json? or String[] depending on schema
//         icon: finalData.icon,
//         slug: finalData.slug ? finalData.slug : generatedSlug,
//         cover_image_alt: finalData?.cover_image_alt,
//         icon_alt: finalData?.icon_alt,
//         category_id: Number(finalData.category_id || 0),
//         university_id: Number(finalData.university_id || 0)
//       }
//     });
//     if (CoursesData.id) {
//       await prisma.About.create({
//         data: {
//           course_id: Number(CoursesData.id),
//           title: finalData.about_title,
//           description: finalData.about_desc
//         }
//       })
//     }

//     await prisma.Fees.create({
//       data: {
//         course_id: Number(CoursesData.id),
//         annual_fees: (finalData?.anuual_fees),
//         semester_wise_fees: (finalData?.semester_fees),
//         tuition_fees: (finalData?.tuition_fees),
//         fees_title: finalData.fees_title || ""
//       }
//     })

//     await prisma.Faq.create({
//       data: {
//         course_id: Number(CoursesData.id),
//         faqs: finalData.faqs,
//       }
//     })

//     await prisma.Approvals_Management.create({
//       data: {
//         course_id: Number(CoursesData.id),
//         title: finalData.approvals_name,
//         description: finalData.approvals_desc,
//         approval_ids: finalData.approvals
//       }
//     })
//     await prisma.Rankings.create({
//       data: {
//         course_id: Number(CoursesData.id),
//         title: finalData.rankings_name,
//         description: finalData.rankings_description,
//       }
//     })



//     await prisma.EligibilityCriteria.create({
//       data: {
//         course_id: Number(CoursesData.id),
//         title: finalData.creteria,
//         description : finalData.desccreteria || "" ,
//         NRICriteria: finalData.NRICriteria || "",
//         IndianCriteria: finalData.IndianCriteria || ""
//       }
//     })
//     await prisma.Curriculum.create({
//       data: {
//         course_id: Number(CoursesData.id),
//         title: finalData.semesters_title,
//         semesters: finalData.semesters,
//       }
//     })

//     await prisma.Services.create({
//       data: {
//         course_id: Number(CoursesData.id),
//         title: finalData.servicetitle,
//         description: finalData.servicedesc,
//         services: finalData.services || ""
//       }
//     })
//     await prisma.Certificates.create({
//       data: {
//         course_id: Number(CoursesData.id),
//         title: finalData.certificatename,
//         description: finalData.certificatedescription,
//         image: finalData.certificatemage,
//         image_alt: finalData?.image_alt
//       }
//     })

//     await prisma.Skills.create({
//       data: {
//         course_id: Number(CoursesData.id),
//         title: finalData.skillsname,
//         description: finalData.skilldesc,
//         skills: finalData.skills || ""
//       }
//     })

//     await prisma.Advantages.create({
//       data: {
//         course_id: Number(CoursesData.id),
//         title: finalData.advantagesname,
//         description: finalData.advantagesdescription,
//         advantages: finalData.advantages
//       }
//     })
//     await prisma.ExamPatterns.create({
//       data: {
//         course_id: Number(CoursesData.id),
//         title: finalData.patternname,
//         description: finalData.patterndescription,
//         bottompatterndesc: finalData.bottompatterndesc,
//         patterns: finalData.patterns
//       }
//     })
//     await prisma.FinancialAid.create({
//       data: {
//         title: finalData.financialname,
//         description: finalData.financialdescription || null,
//         aid: finalData.fees,
//         course_id: Number(CoursesData.id),
//       }
//     })

//     await prisma.Career.create({
//       data: {
//         title: finalData.careername,
//         description: finalData.careerdesc || null,
//         Career: finalData.careermanages,
//         course_id: Number(CoursesData.id),
//       }
//     })
//     await prisma.Partners.create({
//       data: {
//         course_id: Number(CoursesData.id),
//         title: finalData.partnersname,
//         description: finalData.partnersdesc,
//         placement_partner_id: finalData.partners
//       }
//     })
//     await prisma.AdmissionProcess.create({
//       data: {
//         course_id: Number(CoursesData.id),
//         title: finalData.onlinetitle,
//         description: finalData.onlinedesc,
//         process: finalData.onlines
//       }
//     })


//     await prisma.Seo.create({
//       data: {
//         course_id: Number(CoursesData.id),
//         meta_title: finalData.meta_title,
//         meta_description: finalData.meta_description,
//         meta_keywords: finalData.meta_keywords,
//         canonical_url: finalData.canonical_url,
//       }
//     })
//     return successResponse(res, "Course Saved successfully", 201, {
//       CoursesData,
//     });


//   } catch (error) {
//     console.error("AddCourse error:", error);

//     if (error.code === "P2002") {
//       return errorResponse(
//         res,
//         `Duplicate field value: ${error.meta.target.join(", ")}`,
//         400
//       );
//     }

//     return errorResponse(
//       res,
//       "Something went wrong",
//       500
//     );
//   }

// });


exports.AddCourse = catchAsync(async (req, res) => {
  try {
    const uploadedFiles = {};
    req.files?.forEach(file => {
      uploadedFiles[file.fieldname] = file.path;
    });
    Loggers.silly(req.body)
    let services = parseArray(req.body.services);
    let patterns = parseArray(req.body.patterns);
    let campusList = parseArray(req.body.campusList);
    let facts = parseArray(req.body.facts);
    let indian = parseArray(req.body.indian);
    let nri = parseArray(req.body.nri);

    const patternsImages = mapUploadedArray(req, uploadedFiles, "patternsimages");
    const nriimages = mapUploadedArray(req, uploadedFiles, "nriimages");
    const indianimages = mapUploadedArray(req, uploadedFiles, "Indianimages");
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
    indian = attachImagesToItems(indian, indianimages, "images");
    nri = attachImagesToItems(nri, nriimages, "images");

    const finalData = {
      fees_desc: req.body.fees_desc || "",
      name: req.body.name || "",
      position: req.body.position || 0,
      descriptions: parseArray(req.body.descriptions) || "",
      cover_image_alt: req.body.cover_image_alt || "",
      category_id: req.body.category_id || "",
      university_id: req.body.university_id || "",
      icon_alt: req.body.icon_alt || "",
      image_alt: req.body.image_alt || "",
      about_title: req.body.about_title || "",
      about_desc: req.body.about_desc || "",
      semester_fees: req.body.semester_fees || "",
      anuual_fees: req.body.anuual_fees || "",
      tuition_fees: req.body.tuition_fees || "",
      partnersdesc: req.body.partnersdesc || "",
      advantagesname: req.body.advantagesname || "",
      advantagesdescription: req.body.advantagesdescription || "",
      approvals_name: req.body.approvals_name || "",
      approvals_desc: req.body.approvals_desc || "",
      certificatename: req.body.certificatename || "",
      certificatedescription: req.body.certificatedescription || "",
      certificatemage: toPublicUrl(req, uploadedFiles["certificatemage"]) || req.body.icon || null,
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
      advantages: parseArray(req.body.advantages) || "",
      campusList: parseArray(req.body.campusList) || "",
      fees: parseArray(req.body.fees) || "",
      facts: parseArray(req.body.facts) || "",
      factsname: req.body.factsname || "",
      onlines: parseArray(req.body.onlines) || "",
      onlinetitle: req.body.onlinetitle,
      onlinedesc: req.body.onlinedesc,
      financialdescription: req.body.financialdescription,
      faqs: parseArray(req.body.faqs) || "",
      approvals: parseArray(req.body.approvals) || "",
      partners: parseArray(req.body.partners) || "",
      rankings_name: req.body.rankings_name || "",
      rankings_description: req.body.rankings_description || "",
      financialname: req.body.financialname || "",
      meta_title: req.body.meta_title || "",
      fees_title: req.body.fees_title || "",
      meta_description: req.body.meta_description || "",
      canonical_url: req.body.canonical_url || "",
      meta_keywords: req.body.meta_keywords || "",
      creteria: req.body.creteria || "",
      NRICriteria: nri || "",
      IndianCriteria: indian || "",
      semesters_title: req.body.semesters_title || "",
      semesters: parseArray(req.body.semesters) || "",
      skillsname: req.body.skillsname || "",
      skilldesc: req.body.skilldesc || "",
      skills: parseArray(req.body.skills) || "",
      careername: req.body.careername || "",
      careermanages: parseArray(req.body.careermanages) || "",
      careerdesc: req.body.careerdesc || "",
      desccreteria: req.body.desccreteria || "",
    };

    if (!finalData.university_id) return errorResponse(res, "University Id is required", 400);
    if (!finalData.category_id) return errorResponse(res, "Category Id is required", 400);

    const generatedSlug = await generateUniqueSlug(prisma, finalData.name);


    const CoursesData = await prisma.Course.create({
      data: {
        name: finalData.name || "Untitled",
        cover_image: finalData.cover_image,
        position: Number(finalData.position || 0),
        description: finalData.descriptions, // Prisma field should be Json? or String[] depending on schema
        icon: finalData.icon,
        slug: generatedSlug || req.body.slug ,
        cover_image_alt: finalData?.cover_image_alt,
        icon_alt: finalData?.icon_alt,
        rank: finalData.rank,
        university_id: Number(finalData.university_id),
        category_id: Number(finalData.category_id),
        video: finalData.video,
      }
    });
    // Upsert related tables
    await prisma.Fees.upsert({
      where: { course_id: CoursesData.id },
      update: {
        annual_fees: finalData.anuual_fees,
        semester_wise_fees: finalData.semester_fees,
        tuition_fees: finalData.tuition_fees,
        fees_title: finalData.fees_title || "",
        fees_desc: finalData.fees_desc || "",
        fees_notes: req.body?.fees_notes || "",
      },
      create: {
        course_id: CoursesData.id,
        annual_fees: finalData.anuual_fees,
        semester_wise_fees: finalData.semester_fees,
        tuition_fees: finalData.tuition_fees,
        fees_title: finalData.fees_title || "",
        fees_desc: finalData.fees_desc || "",
        fees_notes: req.body?.fees_notes || "",
      }
    });

    await prisma.Faq.upsert({
      where: { course_id: CoursesData.id },
      update: { faqs: finalData.faqs },
      create: { course_id: CoursesData.id, faqs: finalData.faqs }
    });

    await prisma.Approvals_Management.upsert({
      where: { course_id: CoursesData.id },
      update: {
        title: finalData.approvals_name,
        description: finalData.approvals_desc,
        approval_ids: finalData.approvals
      },
      create: {
        course_id: CoursesData.id,
        title: finalData.approvals_name,
        description: finalData.approvals_desc,
        approval_ids: finalData.approvals
      }
    });

    await prisma.Rankings.upsert({
      where: { course_id: CoursesData.id },
      update: {
        title: finalData.rankings_name,
        description: finalData.rankings_description
      },
      create: {
        course_id: CoursesData.id,
        title: finalData.rankings_name,
        description: finalData.rankings_description
      }
    });

    await prisma.EligibilityCriteria.upsert({
      where: { course_id: CoursesData.id },
      update: {
        title: finalData.creteria,
        description: finalData.desccreteria || "",
        NRICriteria: finalData.NRICriteria || "",
        IndianCriteria: finalData.IndianCriteria || "",
        notes: req.body.notescreteria || "",
      },
      create: {
        course_id: CoursesData.id,
        title: finalData.creteria,
        description: finalData.desccreteria || "",
        NRICriteria: finalData.NRICriteria || "",
        IndianCriteria: finalData.IndianCriteria || "",
        notes: req.body.notescreteria || "",
      }
    });

    await prisma.Curriculum.upsert({
      where: { course_id: CoursesData.id },
      update: {
        title: finalData.semesters_title,
        semesters: finalData.semesters,
        notes: req.body.semesters_notes,
      },
      create: {
        course_id: CoursesData.id,
        title: finalData.semesters_title,
        semesters: finalData.semesters,
        notes: req.body.semesters_notes,

      }
    });

    const record = await prisma.Services.upsert({
      where: { course_id: CoursesData.id },
      update: {
        title: finalData.servicetitle,
        description: finalData.servicedesc,
        services: finalData.services || ""
      },
      create: {
        course_id: CoursesData.id,
        title: finalData.servicetitle,
        description: finalData.servicedesc,
        services: finalData.services || ""
      }
    });


    await prisma.Certificates.upsert({
      where: { course_id: CoursesData.id },
      update: {
        title: finalData.certificatename,
        description: finalData.certificatedescription,
        image: finalData.certificatemage,
        image_alt: finalData.image_alt
      },
      create: {
        course_id: CoursesData.id,
        title: finalData.certificatename,
        description: finalData.certificatedescription,
        image: finalData.certificatemage,
        image_alt: finalData.image_alt
      }
    });

    await prisma.Skills.upsert({
      where: { course_id: CoursesData.id },
      update: {
        title: finalData.skillsname,
        description: finalData.skilldesc,
        skills: finalData.skills || ""
      },
      create: {
        course_id: CoursesData.id,
        title: finalData.skillsname,
        description: finalData.skilldesc,
        skills: finalData.skills || ""
      }
    });

    await prisma.Advantages.upsert({
      where: { course_id: CoursesData.id },
      update: {
        title: finalData.advantagesname,
        description: finalData.advantagesdescription,
        advantages: finalData.advantages
      },
      create: {
        course_id: CoursesData.id,
        title: finalData.advantagesname,
        description: finalData.advantagesdescription,
        advantages: finalData.advantages
      }
    });

    await prisma.ExamPatterns.upsert({
      where: { course_id: CoursesData.id },
      update: {
        title: finalData.patternname,
        description: finalData.patterndescription,
        bottompatterndesc: finalData.bottompatterndesc,
        patterns: finalData.patterns
      },
      create: {
        course_id: CoursesData.id,
        title: finalData.patternname,
        description: finalData.patterndescription,
        bottompatterndesc: finalData.bottompatterndesc,
        patterns: finalData.patterns
      }
    });

    await prisma.FinancialAid.upsert({
      where: { course_id: CoursesData.id },
      update: {
        title: finalData.financialname,
        description: finalData.financialdescription || null,
        aid: finalData.fees,
        notes: req.body.finacial_notes,
      },
      create: {
        course_id: CoursesData.id,
        title: finalData.financialname,
        description: finalData.financialdescription || null,
        aid: finalData.fees,
        notes: req.body.finacial_notes,

      }
    });

    await prisma.Career.upsert({
      where: { course_id: CoursesData.id },
      update: {
        title: finalData.careername,
        description: finalData.careerdesc || null,
        Career: finalData.careermanages
      },
      create: {
        course_id: CoursesData.id,
        title: finalData.careername,
        description: finalData.careerdesc || null,
        Career: finalData.careermanages
      }
    });

    await prisma.Partners.upsert({
      where: { course_id: CoursesData.id },
      update: {
        title: finalData.partnersname,
        description: finalData.partnersdesc,
        placement_partner_id: finalData.partners
      },
      create: {
        course_id: CoursesData.id,
        title: finalData.partnersname,
        description: finalData.partnersdesc,
        placement_partner_id: finalData.partners
      }
    });

    await prisma.AdmissionProcess.upsert({
      where: { course_id: CoursesData.id },
      update: {
        title: finalData.onlinetitle,
        description: finalData.onlinedesc,
        process: finalData.onlines
      },
      create: {
        course_id: CoursesData.id,
        title: finalData.onlinetitle,
        description: finalData.onlinedesc,
        process: finalData.onlines
      }
    });

    await prisma.Seo.upsert({
      where: { course_id: CoursesData.id },
      update: {
        meta_title: finalData.meta_title,
        meta_description: finalData.meta_description,
        meta_keywords: finalData.meta_keywords,
        canonical_url: finalData.canonical_url
      },
      create: {
        course_id: CoursesData.id,
        meta_title: finalData.meta_title,
        meta_description: finalData.meta_description,
        meta_keywords: finalData.meta_keywords,
        canonical_url: finalData.canonical_url
      }
    });

    return successResponse(res, "Course saved successfully", 201, { CoursesData });

  } catch (error) {
    console.error("AddCourse error:", error);

    if (error.code === "P2002") {
      return errorResponse(res, `Duplicate field value: ${error.meta.target.join(", ")}`, 400);
    }

    return errorResponse(res, "Something went wrong", 500);
  }
});

exports.CoursesDelete = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return validationErrorResponse(res, "Course ID is required", 400);
    }
    const existingcourse = await prisma.Course.findUnique({
      where: {
        id: parseInt(id),
      }
    });
    if (!existingcourse) {
      return validationErrorResponse(res, "Course not found", 404);
    }
    let updatedRecord;
    if (existingcourse.deleted_at) {
      updatedRecord = await prisma.Course.update({
        where: { id: parseInt(id) },
        data: { deleted_at: null }
      });

      return successResponse(res, "Course restored successfully", 200, updatedRecord);
    }

    updatedRecord = await prisma.Course.update({
      where: { id: parseInt(id) },
      data: { deleted_at: new Date() }
    });

    return successResponse(res, "Course deleted successfully", 200, updatedRecord);
  } catch (error) {
    if (error.code === 'P2025') {
      return errorResponse(res, "Course not found", 404);
    }
    return errorResponse(res, error.message, 500);
  }
});


exports.GetCourseById = catchAsync(async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      return errorResponse(res, "Course slug is required", 400);
    }
    const CourseData = await prisma.Course.findFirst({
      where: {
        slug: slug,
        deleted_at: null,
      },
      include: {
        about: true,
        university: true,
        fees: true,
        approvals: true,
        rankings: true,
        eligibilitycriteria: true,
        curriculum: true,
        certificates: true,
        skills: true,
        examPatterns: true,
        financialAid: true,
        career: true,
        partners: true,
        services: true,
        admissionprocess: true,
        faq: true,
        seo: true,
        advantages: true,
      },
    });

    if (!CourseData) {
      return errorResponse(res, "CourseData not found", 404);
    }

    const toArray = (val) => {
      if (!val && val !== 0) return [];
      return Array.isArray(val) ? val : [val];
    };

    // ----------- Extract partner IDs (defensively) -----------
    let placementPartnerIds = [];

    const partnersRaw = CourseData.partners;
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

    const approvalsRaw = CourseData.approvals;
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
      "Course fetched successfully",
      200,
      { CourseData, approvalsData, placementPartners }
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


exports.GetUniversityCourseList = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return errorResponse(res, "University id is required", 400);
    }

    const courseList = await prisma.Course.findMany({
      where: {
        university_id: Number(id),
      },
      include: {
        fees: true,
        university: {
          select: {
            id: true,
            name: true,
            slug: true,   // ✅ university slug
          },
        },
      },
    });

    if (!courseList || courseList.length === 0) {
      return validationErrorResponse(res, "Course not found", 404);
    }

    return successResponse(res, "Course list fetched successfully", 200, courseList);

  } catch (error) {
    if (error.code === "P2025") {
      return errorResponse(res, "Course not found", 404);
    }
    return errorResponse(res, error.message, 500);
  }
});



exports.AllCourses = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 9;
  const skip = (page - 1) * limit;


  const courses = await prisma.Course.findMany({
    orderBy: { created_at: "desc" },
    skip,
    take: limit,
  });

  const totalCourses = await prisma.Course.count();

  const totalPages = Math.ceil(totalCourses / limit);

  return successResponse(res, "Course fetched successfully", 200, {
    courses,
    pagination: {
      page,
      limit,
      totalPages,
      totalCourses,
    },
  });
});



exports.UpdateCourse = catchAsync(async (req, res) => {
  try {
    const CourseId = Number(req.body.id);
    // Collect uploaded files
    Loggers.silly(req.body)
    const uploadedFiles = {};
    req.files?.forEach((file) => {
      uploadedFiles[file.fieldname] = file.path;
    });
    if (!CourseId) {
      return validationErrorResponse(res, "Univesirty ID is required", 400);
    }
    // Fetch existing university with all relations
    const existing = await prisma.Course.findUnique({
      where: { id: CourseId },
      include: {
        about: true,
        fees: true,
        approvals: true,
        rankings: true,
        eligibilitycriteria: true,
        curriculum: true,
        certificates: true,
        skills: true,
        examPatterns: true,
        financialAid: true,
        career: true,
        partners: true,
        services: true,
        admissionprocess: true,
        faq: true,
        seo: true,
        advantages: true,
      }
    });

    if (!existing) {
      return res.status(404).json({ status: false, message: "Course not found" });
    }

    // Parse arrays
    let services = parseArray(req.body.services);
    let patterns = parseArray(req.body.patterns);
    let advantages = parseArray(req.body.advantages);
    let campusList = parseArray(req.body.campusList);
    let fees = parseArray(req.body.fees);
    let facts = parseArray(req.body.facts);
    let onlines = parseArray(req.body.onlines);
    let faqs = parseArray(req.body.faqs);
    let descriptions = parseArray(req.body.descriptions);
    let indian = parseArray(req.body.indian);
    let nri = parseArray(req.body.nri);
    // Build images from uploads
    const patternsImages = mapUploadedArray(req, uploadedFiles, "patternsimages");
    const servicesImages = mapUploadedArray(req, uploadedFiles, "servicesimages");
    const servicesIcons = mapUploadedArray(req, uploadedFiles, "servicesicon");
    const campusImages = mapUploadedArray(req, uploadedFiles, "campusimages");
    const nriimages = mapUploadedArray(req, uploadedFiles, "nriimages");
    const Indianimages = mapUploadedArray(req, uploadedFiles, "Indianimages");
    const factsImages = mapUploadedArray(req, uploadedFiles, "factsimages");
    // Attach images to arrays
    services = attachImagesToItems(services, servicesImages, "image", existing.services?.services);
    services = attachImagesToItems(services, servicesIcons, "icon", existing.services?.services);
    patterns = attachImagesToItems(patterns, patternsImages, "image", existing.examPatterns?.patterns);
    campusList = attachImagesToItems(campusList, campusImages, "image", existing.universityCampuses?.campus);
    indian = attachImagesToItems(indian, Indianimages, "image", existing.EligibilityCriteria?.IndianCriteria);
    nri = attachImagesToItems(nri, nriimages, "image", existing.EligibilityCriteria?.NRICriteria);
    facts = attachImagesToItems(facts, factsImages, "image", existing.facts?.facts);
    // FINAL DATA MERGED WITH EXISTING
    const finalData = {
      name: req.body.name || "",
      university_id: req.body.university_id || "",
      position: req.body.position || "",
      icon_alt: req.body.icon_alt || "",
      meta_title: req.body.meta_title || "",
      category_id: req.body.category_id || "",
      descriptions: descriptions?.length && descriptions || "",
      cover_image_alt: req.body.cover_image_alt || "",
      about_title: req.body.about_title || "",
      about_desc: req.body.about_desc || "",
      tuition_fees: req.body.tuition_fees || "",
      anuual_fees: req.body.anuual_fees || "",
      fees_desc: req.body.fees_desc || "",
      semester_fees: req.body.semester_fees || "",
      approvals_name: req.body.approvals_name || "",
      approvals_desc: req.body.approvals_desc || "",
      approvals: parseArray(req.body.approvals) || "",
      rankings_name: req.body.rankings_name || "",
      rankings_description: req.body.rankings_description || "",
      creteria: req.body.creteria || "",
      NRICriteria: nri?.length && nri || "",
      IndianCriteria: indian?.length && indian || "",
      semesters_title: req.body.semesters_title || "",
      semesters: parseArray(req.body.semesters) || "",
      certificatename: req.body.certificatename || "",
      certificatedescription: req.body.certificatedescription || "",
      image_alt: req.body.image_alt || "",
      fees_title: req.body.fees_title || "",
      certificatemage:
        uploadedFiles["certificatemage"]
          ? (deleteUploadedFiles([existing.certificatemage]),
            toPublicUrl(req, uploadedFiles["certificatemage"]))
          : existing?.certificatemage,
      careername: req.body.careername || "",
      careermanages: parseArray(req.body.careermanages) || "",
      careerdesc: req.body.careerdesc || "",
      meta_description: req.body.meta_description || "",
      canonical_url: req.body.canonical_url || "",
      meta_keywords: req.body.meta_keywords || "",

      partnersdesc: req.body.partnersdesc || "",
      partnersname: req.body.partnersname || "",
      advantagesname: req.body.advantagesname || "",
      advantagesdescription: req.body.advantagesdescription || "",
      skills: parseArray(req.body.skills) || "",
      skillsname: req.body.skillsname || "",
      skilldesc: req.body.skilldesc || "",
      desccreteria: req.body.desccreteria || "",
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

      servicedesc: req.body.servicedesc || "",
      servicetitle: req.body.servicetitle || "",
      services: services?.length && services || [],
      patterns: patterns?.length && patterns || [],
      patterndescription: req.body.patterndescription || "",
      patternname: req.body.patternname || "",
      bottompatterndesc: req.body.bottompatterndesc || "",
      advantages: advantages?.length && advantages || [],
      campusList: campusList?.length && campusList || [],
      fees: fees?.length && fees || "",
      facts: facts?.length && facts || [],
      factsname: req.body.factsname || "",
      onlines: onlines?.length && onlines || [],
      onlinetitle: req.body.onlinetitle || "",
      onlinedesc: req.body.onlinedesc || "",
      financialdescription:
        req.body.financialdescription || "",
      financialname: req.body.financialname || "",
      faqs: faqs?.length && faqs || "",
      partners: parseArray(req.body.partners) || [],


    };
    const UpdateCourse = await prisma.Course.update({
      where: { id: CourseId },
      data: {
        name: finalData.name,
        cover_image: finalData.cover_image,
        position: Number(finalData.position),
        description: finalData.descriptions,
        icon: finalData.icon,
        slug: req.body.slug,
        cover_image_alt: finalData.cover_image_alt || "",
        icon_alt: finalData.icon_alt || "",
        university_id: Number(finalData.university_id) || "",
        category_id: Number(finalData.category_id) || "",
        video: req.body.video || ""
      }
    });

    if (UpdateCourse.id) {
      await prisma.About.upsert({
        where: { course_id: CourseId },
        update: { title: finalData.about_title, description: finalData.about_desc },
        create: { course_id: CourseId, title: finalData.about_title, description: finalData.about_desc }
      });

      await prisma.Fees.update({
        where: { id: existing.fees.id },
        data: {
          annual_fees: finalData?.anuual_fees,
          semester_wise_fees: finalData?.semester_fees,
          tuition_fees: finalData?.tuition_fees,
          fees_title: finalData?.fees_title,
          fees_desc: finalData?.fees_desc,
          fees_notes: req.body?.fees_notes,
        }
      });

      await prisma.Approvals_Management.upsert({
        where: { course_id: CourseId },
        update: {
          title: finalData.approvals_name,
          description: finalData.approvals_desc,
          approval_ids: finalData.approvals,
        },
        create: {
          course_id: CourseId,
          title: finalData.approvals_name,
          description: finalData.approvals_desc,
          approval_ids: finalData.approvals,
        }
      });

      await prisma.Rankings.upsert({
        where: { course_id: CourseId },
        update: { title: finalData.rankings_name, description: finalData.rankings_description },
        create: { course_id: CourseId, title: finalData.rankings_name, description: finalData.rankings_description }
      });

      await prisma.EligibilityCriteria.upsert({
        where: { course_id: CourseId },
        update: {
          title: finalData.creteria,
          description: finalData.desccreteria,
          NRICriteria: finalData.NRICriteria,
          notes: req.body.notescreteria || "",
          IndianCriteria: finalData.IndianCriteria || ""
        },
        create: {
          course_id: Number(CourseId),
          title: finalData.creteria,
          NRICriteria: finalData.NRICriteria,
          IndianCriteria: finalData.IndianCriteria || "",
          description: finalData.desccreteria,
          notes: req.body.notescreteria || "",

        }
      })

      await prisma.Curriculum.upsert({
        where: { course_id: Number(CourseId) }, // ya unique id field
        update: {
          title: finalData.semesters_title,
          semesters: finalData.semesters,
          notes: req.body.semesters_notes,
        },
        create: {
          course_id: Number(CourseId),
          title: finalData.semesters_title,
          semesters: finalData.semesters,
          notes: req.body.semesters_notes,

        }
      });

      await prisma.Certificates.upsert({
        where: { course_id: CourseId },
        update: {
          title: finalData.certificatename,
          description: finalData.certificatedescription,
          image: finalData.certificatemage,
          image_alt: finalData.image_alt,
        },
        create: {
          course_id: CourseId,
          title: finalData.certificatename,
          description: finalData.certificatedescription,
          image: finalData.certificatemage,
          image_alt: finalData.image_alt,

        }
      });
      await prisma.Advantages.upsert({
        where: { course_id: CourseId },
        update: {
          title: finalData.advantagesname,
          description: finalData.advantagesdescription,
          advantages: finalData.advantages,
        },
        create: {
          course_id: CourseId,
          title: finalData.advantagesname,
          description: finalData.advantagesdescription,
          advantages: finalData.advantages,
        }
      });
      await prisma.Skills.upsert({
        where: { course_id: CourseId },
        update: {
          title: finalData.skillsname,
          description: finalData.skilldesc,
          skills: finalData.skills || ""
        },
        create: {
          course_id: Number(CourseId),
          title: finalData.skillsname,
          description: finalData.skilldesc,
          skills: finalData.skills || ""
        }
      })
      await prisma.ExamPatterns.upsert({
        where: { course_id: CourseId },
        update: {
          title: finalData.patternname,
          description: finalData.patterndescription,
          bottompatterndesc: finalData.bottompatterndesc,
          patterns: finalData.patterns,
        },
        create: {
          course_id: CourseId,
          title: finalData.patternname,
          description: finalData.patterndescription,
          bottompatterndesc: finalData.bottompatterndesc,
          patterns: finalData.patterns,
        }
      });
      await prisma.FinancialAid.upsert({
        where: { course_id: CourseId, },
        update: {
          title: finalData.financialname,
          description: finalData.financialdescription,
          aid: finalData.fees,
          notes: req.body.finacial_notes,

        },
        create: {
          course_id: CourseId,
          title: finalData.financialname,
          description: finalData.financialdescription,
          aid: finalData.fees, notes: req.body.finacial_notes,

        }
      });

      await prisma.Career.upsert({
        where: { course_id: CourseId, },
        update: {
          title: finalData.careername,
          description: finalData.careerdesc || null,
          Career: finalData.careermanages,
        },
        create: {
          title: finalData.careername,
          description: finalData.careerdesc || null,
          Career: finalData.careermanages,
          course_id: Number(CourseId),
        }
      })

      await prisma.Partners.upsert({
        where: { course_id: Number(CourseId), },
        update: {
          title: finalData.partnersname,
          description: finalData.partnersdesc,
          placement_partner_id: finalData.partners,
        },
        create: {
          course_id: Number(CourseId),
          title: finalData.partnersname,
          description: finalData.partnersdesc,
          placement_partner_id: finalData.partners,
        }
      });

      await prisma.Faq.upsert({
        where: { course_id: Number(CourseId) },
        update: { faqs: finalData.faqs },
        create: { course_id: Number(CourseId), faqs: finalData.faqs }
      });

      await prisma.Seo.upsert({
        where: { course_id: Number(CourseId), },
        update: {
          meta_title: finalData.meta_title,
          meta_description: finalData.meta_description,
          meta_keywords: finalData.meta_keywords,
          canonical_url: finalData.canonical_url,
        },
        create: {
          course_id: Number(CourseId),
          meta_title: finalData.meta_title,
          meta_description: finalData.meta_description,
          meta_keywords: finalData.meta_keywords,
          canonical_url: finalData.canonical_url,
        }
      });


      const servcies = await prisma.Services.upsert({
        where: { course_id: Number(CourseId) },
        update: {
          title: finalData.servicetitle,
          description: finalData.servicedesc,
          services: finalData.services,
        },
        create: {
          course_id: Number(CourseId),
          title: finalData.servicetitle,
          description: finalData.servicedesc,
          services: finalData.services,
        }
      });
      await prisma.AdmissionProcess.upsert({
        where: { course_id: Number(CourseId) },
        update: {
          title: finalData.onlinetitle,
          description: finalData.onlinedesc,
          process: finalData.onlines,
        },
        create: {
          course_id: Number(CourseId),
          title: finalData.onlinetitle,
          description: finalData.onlinedesc,
          process: finalData.onlines,
        }
      });
    }
    return successResponse(
      res,
      "Courses Updated Successfully!",
      201,
      UpdateCourse
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


exports.GetCourseByName = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return errorResponse(res, "Course id is required", 400);
    }
    const CourseData = await prisma.Course.findFirst({
      where: {
        id: Number(id),
        deleted_at: null,
      },
    });

    if (!CourseData) {
      return errorResponse(res, "CourseData not found", 404);
    }

    return successResponse(
      res,
      "Course Name fetched successfully",
      200,
      { CourseData }
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

