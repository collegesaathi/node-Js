const { errorResponse, successResponse, validationErrorResponse } = require("../utils/ErrorHandling");
const prisma = require("../config/prisma");
const catchAsync = require("../utils/catchAsync");

const Logger = require("../utils/Logger");
const deleteUploadedFiles = require("../utils/fileDeleter");
const Loggers = require("../utils/Logger");

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

exports.AllTopProgram = catchAsync(async (req, res) => {
  try {
    // ✅ LATEST PROGRAMS
    const allowedPrograms = [
      "online mba",
      "online mca",
      "online bba",
      "online bca",
      "online m.com",
      "online b.com",
      "online majmc",
      "online bajmc",
      "online ma",
      "online ba"
    ];

    const latestPrograms = await prisma.program.findMany({
      where: {
        deleted_at: null,
        OR: allowedPrograms.map(p => ({
          title: {
            contains: p,
            mode: "insensitive", // case-insensitive match
          },
        })),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 8,
      select: {
        id: true,
        title: true,
        slug: true,
        bannerImage: true,
        bannerImageAlt: true,
        shortDescription: true,
        duration: true,
        specialization: true,
        createdAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    const allowedSpecialisations = [
      "business analytics",
      "data science",
      "analytics",
      "digital marketing",
      "financial management",
      "fintech",
      "healthcare",
      "hospital administration",
      "information technology",
      "international business",
      "logistics",
      "supply chain",
      "marketing management",
      "project management",
      "retail management"
    ];

    const laspetestPrograms = await prisma.SpecialisationProgram.findMany({
      where: {
        deleted_at: null,

        // ✅ Only MBA Program
        program_id: 1,

        // ✅ Only allowed specialisations
        OR: allowedSpecialisations.map(sp => ({
          title: {
            contains: sp,
            mode: "insensitive",
          },
        })),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 12,
      select: {
        id: true,
        title: true,
        slug: true,
        bannerImage: true,
        bannerImageAlt: true,
        shortDescription: true,
        duration: true,
        specialization: true,
        createdAt: true,

        // 👇 Program table
        program: {
          select: {
            id: true,
            title: true,
            slug: true,
            bannerImage: true,
            bannerImageAlt: true,

            // 👇 Program ke andar category
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    const allowedCertificates = [
      "certificate program in ui",
      "certificate program in data science",
      "certificate program in project management",
      "certificate program in text mining",
      "certificate program in nlp",
      "certificate program in big data",
      "certificate program in hr analytics",
      "certificate program in financial analytics",
      "certificate program in predictive analytics",
      "predictive analytics using python"
    ];

    const LastCertificationPrograms = await prisma.program.findMany({
      where: {
        deleted_at: null,
        category_id: 4, // Certificate category
        // OR: allowedCertificates.map(p => ({
        //   title: {
        //     contains: p,
        //     mode: "insensitive", // case-insensitive
        //   },
        // })),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 8,
      select: {
        id: true,
        title: true,
        slug: true,
        bannerImage: true,
        bannerImageAlt: true,
        shortDescription: true,
        duration: true,
        specialization: true,
        createdAt: true,

        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });



    return successResponse(res, "Home Page data fetched successfully", 201, {
      latestPrograms, laspetestPrograms, LastCertificationPrograms
    });


  } catch (err) {
    console.log("ERROR:", err)
    return errorResponse(res, "Something went wrong", 400);
  }
});

exports.AddVideo = catchAsync(async (req, res) => {
  try {
    Loggers.silly("Add Home Page Video API Hit");
    Loggers.silly(req.body);

    // Collect uploaded files (even though not required)
    const uploadedFiles = {};
    req.files?.forEach(file => {
      uploadedFiles[file.fieldname] = file.path;
    });

    // ✅ Validation
    if (!req.body.videoUrl) {
      // Clean up any accidentally uploaded files
      if (req.files?.length) {
        deleteUploadedFiles(req.files);
      }
      return validationErrorResponse(res, "Video URL is required");
    }

    // ✅ Create Home Page Video
    const videoData = await prisma.homePageVideo.create({
      data: {
        title: req.body.title || "",
        description: req.body.description || "",
        videoUrl: req.body.videoUrl || "",
        coverimage: toPublicUrl(req, uploadedFiles["coverimage"]) || "",
      }
    });

    return successResponse(
      res,
      "Home page video added successfully",
      201,
      { videoData }
    );

  } catch (error) {
    Logger.error("AddVideo Error:", error);

    // Cleanup uploads if anything went wrong
    if (req.files?.length) {
      deleteUploadedFiles(req.files);
    }

    // Prisma-specific handling
    if (error.code === "P2002") {
      return errorResponse(
        res,
        `Duplicate field value: ${error.meta?.target?.join(", ")}`,
        400
      );
    }

    return errorResponse(res, "Something went wrong", 500);
  }
});


exports.GetVideoById = catchAsync(async (req, res) => {
  try {
    Loggers.silly("Get Home Page Video By ID API Hit");
    Loggers.silly(req.params);

    const videoId = Number(req.params.id);

    // ✅ Validation
    if (!videoId || isNaN(videoId)) {
      return validationErrorResponse(res, "Valid video id is required");
    }

    // ✅ Fetch video
    const videoData = await prisma.homePageVideo.findFirst({
      where: {
        id: videoId,
        deleted_at: null
      }
    });

    // ❌ Not found
    if (!videoData) {
      return errorResponse(res, "Video not found", 404);
    }

    return successResponse(
      res,
      "Home page video fetched successfully",
      200,
      { videoData }
    );

  } catch (error) {
    Logger.error("GetVideoById Error:", error);
    return errorResponse(res, "Something went wrong", 500);
  }
});


exports.UpdateVideo = catchAsync(async (req, res) => {
  try {
    Loggers.silly("Update Home Page Video API Hit");
    Loggers.silly(req.body);

    const videoId = Number(req.body.id);

    // ✅ Validation
    if (!videoId) {
      return validationErrorResponse(res, "Video ID is required");
    }

    // Collect uploaded files
    const uploadedFiles = {};
    req.files?.forEach(file => {
      uploadedFiles[file.fieldname] = file.path;
    });

    // ✅ Fetch existing video
    const existingVideo = await prisma.homePageVideo.findFirst({
      where: {
        id: videoId,
        // deleted_at: null
      }
    });

    if (!existingVideo) {
      return errorResponse(res, "Video not found", 404);
    }

    // ✅ Prepare updated data
    const updatedData = {
      title: req.body.title ?? existingVideo.title,
      description: req.body.description ?? existingVideo.description,
      videoUrl: req.body.videoUrl ?? existingVideo.videoUrl,
      coverimage: existingVideo.coverimage
    };

    // ✅ Handle cover image update
    if (uploadedFiles["coverimage"]) {
      // delete old image if exists
      if (existingVideo.coverimage) {
        deleteUploadedFiles([existingVideo.coverimage]);
      }

      updatedData.coverimage = toPublicUrl(
        req,
        uploadedFiles["coverimage"]
      );
    }

    // ✅ Update video
    const updatedVideo = await prisma.homePageVideo.update({
      where: { id: videoId },
      data: updatedData
    });

    return successResponse(
      res,
      "Home page video updated successfully",
      200,
      { updatedVideo }
    );

  } catch (error) {
    Logger.error("UpdateVideo Error:", error);

    // cleanup new uploads if error
    if (req.files?.length) {
      deleteUploadedFiles(req.files.map(f => f.path));
    }

    if (error.code === "P2002") {
      return errorResponse(
        res,
        `Duplicate field value: ${error.meta?.target?.join(", ")}`,
        400
      );
    }

    return errorResponse(res, "Something went wrong", 500);
  }
});

exports.VideoDelete = catchAsync(async (req, res) => {
  try {
    Loggers.silly("Delete / Restore Home Page Video API Hit");
    Loggers.silly(req.params);

    const { id } = req.params;

    // ✅ Validation
    if (!id) {
      return validationErrorResponse(res, "Video ID is required", 400);
    }

    // ✅ Find existing video
    const existingVideo = await prisma.homePageVideo.findUnique({
      where: {
        id: parseInt(id)
      }
    });

    if (!existingVideo) {
      return validationErrorResponse(res, "Video not found", 404);
    }

    let updatedRecord;

    // 🔁 Restore if already deleted
    if (existingVideo.deleted_at) {
      updatedRecord = await prisma.homePageVideo.update({
        where: { id: parseInt(id) },
        data: { deleted_at: null }
      });

      return successResponse(
        res,
        "Home page video restored successfully",
        200,
        updatedRecord
      );
    }

    // 🗑 Soft delete
    updatedRecord = await prisma.homePageVideo.update({
      where: { id: parseInt(id) },
      data: { deleted_at: new Date() }
    });

    return successResponse(
      res,
      "Home page video deleted successfully",
      200,
      updatedRecord
    );

  } catch (error) {
    Logger.error("VideoDelete Error:", error);

    if (error.code === "P2025") {
      return errorResponse(res, "Video not found", 404);
    }

    return errorResponse(res, error.message || "Something went wrong", 500);
  }
});

exports.ExploreUniversities = catchAsync(async (req, res) => {

  const topUniversities = await prisma.university.findMany({
    where: {
      deleted_at: null,
      position: { gte: 1, lte: 10 },
    },
    select: {
      id: true,
      slug: true,
      name: true,
      icon: true,
      position: true
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

    select: {
      id: true,
      slug: true,
      name: true,
      icon: true,
      position: true
    },
    orderBy: [
      { position: 'asc' },
      { created_at: 'desc' }
    ]
  });
  // 3️⃣ Merge
  const finalList = [...topUniversities, ...otherUniversities];


  const totalUniversities = finalList.length;

  return successResponse(res, "Universities fetched successfully", 200, {
    universities: finalList,
    totalUniversities

  });

});


exports.GetTrendingExecutives = catchAsync(async (req, res) => {
  try {
    const programId = 44; // static program_id

    const trendingExecutives = await prisma.specialisationProgram.findMany({
      where: {
        program_id: programId,
      },
      orderBy: {
        createdAt: 'desc', // optional (remove if not needed)
      },
      // select: {        // use this if you want limited fields
      //   id: true,
      //   title: true,
      //   slug: true,
      //   bannerImage: true,
      //   shortDescription: true,
      // }
    });


    if (!trendingExecutives || trendingExecutives.length === 0) {
      return errorResponse(res, "Trending executives not found", 404);
    }

    return successResponse(
      res,
      "Trending executives fetched successfully",
      200,
      trendingExecutives,
    );
  } catch (error) {
    Logger.error("GetTrendingExecutives Error:", error);

    if (error.code === "P2025") {
      return errorResponse(res, "Trending executives not found", 404);
    }

    return errorResponse(res, error.message || "Something went wrong", 500);
  }
});


exports.GetHomePageProgarm = catchAsync(async (req, res) => {
  try {
    const { category_id, program_id } = req.query;

    /**
     * CATEGORY → PROGRAM NAME MAPPING
     */
    const categoryProgramMap = {
      1: [
        "online-mba",
        "1-year-online-mba",
        "online-mtech",
        "online-pgdm-program",
        "online-mca",
        "online-dual-mba",
      ],
      2: [
        "online-bba",
        "online-bcom",
        "distance-bcom",
        "online-bachelor-arts-journalism-mass-communication",
        "online-bca",
        "online-ba",
      ],
      3: [
        "online-pgdm-program",
        "online-postgraduate-diploma-business-administration",
        "executive-post-graduate-diploma-in-management",
        "online-diploma-courses",
        "online-executive-pgdba",
        "online-diploma-programs",
      ],
      5: [
        "executive-mba",
        "online-executive-msc",
        "online-executive-pgcm",
        "executive-dba",
        "executive-post-graduate-diploma-in-management",
        "online-executive-pgdba",
      ],
      6: [
        "online-doctor-of-business-administration",
        "global-doctor-of-business-administration",
        "online-dnp-programs",
        "doctor-of-nursing-practice-program",
        "executive-dba",
      ],
      4: [
        "online-certificate-programme",
        "social-media-analytics-certification",
        "digital-marketing",
        "certification-in-financial-analytics",
        "online-pgcm",
        "ui-ux-design-certification",
      ],
    };

    /**
     * NO PARAMS → FETCH CATEGORIES
     */
    if (!category_id && !program_id) {
      const categories = await prisma.category.findMany({
        where: { deleted_at: null },
        select: {
          id: true,
          short_title: true,
          icon: true,
        },
        orderBy: { id: "asc" },
      });

      return successResponse(res, "Categories fetched", 200, categories);
    }

    /**
     * CATEGORY_ID PROVIDED → FETCH PROGRAMS IN GIVEN SLUG ORDER
     */
    if (category_id) {
      const programNames = categoryProgramMap[category_id] || [];

      const programs = await prisma.Program.findMany({
        where: {
          slug: {
            in: programNames,
          },
          deleted_at: null,
        },
        select: {
          id: true,
          title: true,
          shortname: true,
          short_icon: true,
          icon: true,
          slug: true,
          category_id: true,
        },
      });

      // 🔥 Maintain slug order same as array
      const sortedPrograms = programNames
        .map((slug) => programs.find((p) => p.slug === slug))
        .filter(Boolean);

      return successResponse(
        res,
        "Programs fetched successfully",
        200,
        sortedPrograms
      );
    }

  } catch (error) {
    console.error(error);
    return errorResponse(res, error.message, 500);
  }
});


exports.OnlineCourseProgram = async (req, res) => {
  try {
    const categoryProgramMap = {
      1: [
        "online-mba",
        "online-mca",
        "online-bba",
        "online-bca",
        "1-year-online-mba",
        "online-dual-mba",
      ],
    };

    /**
     * CATEGORY → SPECIALIZATION SLUG MAP
     * ⚡ ONLY SLUGS HERE
     */
    const specializationSlugMap = {
      1: [
        "artificial-intelligence-machine-learning",
        "online-mba-in-business-analytics",
        "online-mba-in-digital-marketing",
        "cyber-security",
        "online-mba-in-fintech",
        "online-mba-in-healthcare-and-hospital-administration",
        "information-technology",
        "international-finance",
        "pharmaceuticals",
        "online-mba-in-logistics-supply-chain-management",
        "online-mba-in-marketing-management",
        "operations-production",
        "blockchain",
        "ui-ux",
      ],
    };

      const specializationSlugs =
        specializationSlugMap[category_id] || [];

      const specializations = await prisma.specialization.findMany({
        where: {
          slug: { in: specializationSlugs },
          deleted_at: null,
        },
        select: {
          id: true,
          title: true,
          shortname: true,
          short_icon: true,
          icon: true,
          image: true,
          slug: true,
          category_id: true,
        },
      });

      // Maintain slug order
      const sortedSpecializations = specializationSlugs
        .map((slug) =>
          specializations.find((s) => s.slug === slug)
        )
        .filter(Boolean);


    /**
     * 🔹 FETCH PROGRAMS (Default)
     */
    const programSlugs = categoryProgramMap[category_id] || [];

    const programs = await prisma.program.findMany({
      where: {
        slug: { in: programSlugs },
        deleted_at: null,
      },
      select: {
        id: true,
        title: true,
        shortname: true,
        short_icon: true,
        icon: true,
        slug: true,
        category_id: true,
      },
    });

    const sortedPrograms = programSlugs
      .map((slug) => programs.find((p) => p.slug === slug))
      .filter(Boolean);

    return res.status(200).json({
      success: true,
      message: "Programs fetched successfully",
      sortedPrograms: sortedPrograms,
      sortedSpecializations : sortedSpecializations
    });
  } catch (error) {
    console.error("Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};