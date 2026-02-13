const prisma = require("../config/prisma");
const catchAsync = require("../utils/catchAsync");
const { successResponse, errorResponse, validationErrorResponse } = require("../utils/ErrorHandling");
const Loggers = require("../utils/Logger");

exports.GetSitemap = catchAsync(async (req, res) => {
  try {

    /* ================================
       1. FETCH PROGRAMS
    =================================*/
    const programs = await prisma.program.findMany({
      where: {
        deleted_at: null
      },
      select: {
        id: true,
        title: true,
        university_id: true
      }
    });

    /* ================================
       2. EXTRACT UNIVERSITY IDS (PROGRAM)
    =================================*/
    const programUniversityIds = new Set();

    programs.forEach(p => {
      if (!p.university_id) return;

      // Handle different JSON formats safely
      if (Array.isArray(p.university_id)) {
        p.university_id.forEach(id => programUniversityIds.add(Number(id)));
      } 
      else if (typeof p.university_id === "object") {
        Object.values(p.university_id).flat().forEach(id => {
          if (!isNaN(id)) programUniversityIds.add(Number(id));
        });
      }
    });

    /* ================================
       3. FETCH UNIVERSITIES (PROGRAM)
    =================================*/
    const programUniversities = await prisma.university.findMany({
      where: {
        id: { in: [...programUniversityIds] },
        deleted_at: null
      },
      select: {
        id: true,
        name: true,
        slug: true
      }
    });

    /* ================================
       4. MAP UNIVERSITY DATA
    =================================*/
    const universityMap = {};
    programUniversities.forEach(u => {
      universityMap[u.id] = u;
    });

    /* ================================
       5. ATTACH UNIVERSITIES TO PROGRAMS
    =================================*/
    const programData = programs.map(p => {
      let uniList = [];

      if (p.university_id) {
        let ids = [];

        if (Array.isArray(p.university_id)) {
          ids = p.university_id;
        } else if (typeof p.university_id === "object") {
          ids = Object.values(p.university_id).flat();
        }

        uniList = ids
          .map(id => universityMap[Number(id)])
          .filter(Boolean);
      }

      if (!uniList.length) return null; // Skip if no universities attached
      return {
        title: p.title,
        universities: uniList
      };
    }).filter(Boolean);

    /* ================================
       6. FETCH SPECIALISATION PROGRAMS
    =================================*/
    const specialisations = await prisma.specialisationProgram.findMany({
      where: {
        deleted_at: null
      },
      select: {
        id: true,
        title: true,
        university_id: true,
        slug: true
      }
    });

    /* ================================
       7. EXTRACT UNIVERSITY IDS (SPECIALISATION)
    =================================*/
    const specUniversityIds = new Set();

    specialisations.forEach(s => {
      if (!s.university_id) return;

      if (Array.isArray(s.university_id)) {
        s.university_id.forEach(id => specUniversityIds.add(Number(id)));
      } 
      else if (typeof s.university_id === "object") {
        Object.values(s.university_id).flat().forEach(id => {
          if (!isNaN(id)) specUniversityIds.add(Number(id));
        });
      }
    });

    /* ================================
       8. FETCH UNIVERSITIES (SPECIALISATION)
    =================================*/
    const specUniversities = await prisma.university.findMany({
      where: {
        id: { in: [...specUniversityIds] },
        deleted_at: null
      },
      select: {
        id: true,
        name: true,
        slug: true
      }
    });

    const specUniMap = {};
    specUniversities.forEach(u => {
      specUniMap[u.id] = u;
    });

    /* ================================
       9. ATTACH UNIVERSITIES TO SPECIALISATIONS
    =================================*/
    const specialisationData = specialisations.map(s => {
      let uniList = [];

      if (s.university_id) {
        let ids = [];

        if (Array.isArray(s.university_id)) {
          ids = s.university_id;
        } else if (typeof s.university_id === "object") {
          ids = Object.values(s.university_id).flat();
        }

        uniList = ids
          .map(id => specUniMap[Number(id)])
          .filter(Boolean);
      }
      if (!uniList.length) return null; // Skip if no universities attached
      return {
        title: s.title,
        slug: s.slug,
        universities: uniList
      };
    }).filter(Boolean);

    /* ================================
       10. FINAL RESPONSE
    =================================*/
    return successResponse(res, "Sitemap retrieved successfully", 200, {
      programs: programData,
      specialisations: specialisationData
    });

  } catch (error) {
    console.error("Sitemap Error:", error);

    if (error.code === "P2025") {
      return errorResponse(res, "Not found", 404);
    }

    return errorResponse(res, error.message, 500);
  }
});
