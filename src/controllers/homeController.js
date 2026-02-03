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
    const latestPrograms = await prisma.program.findMany({
      where: {
        deleted_at: null
      },
      orderBy: {
        createdAt: "desc"
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

        // 👇 category table ka data
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });
   const laspetestPrograms = await prisma.SpecialisationProgram.findMany({
  where: {
    deleted_at: null
  },
  orderBy: {
    createdAt: "desc"
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
            slug: true
          }
        }
      }
    }
  }
});



    const LastCertificationPrograms = await prisma.program.findMany({
      where: {
        deleted_at: null,
        category_id: 4
      },
      orderBy: {
        createdAt: "desc"
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
            slug: true
          }
        }
      }
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
        deleted_at: null, // optional but recommended if you soft-delete
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
      trendingExecutives,
      200
    );
  } catch (error) {
    Logger.error("GetTrendingExecutives Error:", error);

    if (error.code === "P2025") {
      return errorResponse(res, "Trending executives not found", 404);
    }

    return errorResponse(res, error.message || "Something went wrong", 500);
  }
});

