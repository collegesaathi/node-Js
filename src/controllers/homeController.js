const prisma = require("../config/prisma");

module.exports = {
  home: async (req, res) => {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { id: "asc" },
        include: {  
          courses: {
            orderBy: { created_at: "asc" }
          } 
        }
      });

      const universities = await prisma.$queryRaw`
        SELECT * FROM "University"
        WHERE "deleted_at" IS NULL
        ORDER BY CASE WHEN "position" IS NULL THEN 1 ELSE 0 END,
                 "position" ASC,
                 "created_at" DESC
      `;

      const blogs = await prisma.$queryRaw`
        SELECT * FROM "Blog"
        WHERE "deleted_at" IS NULL
        ORDER BY "created_at" DESC
        LIMIT 15;
      `;

      res.json({ categories, universities, blogs });

    } catch (err) {
      res.status(500).json({ error: "Something went wrong" });
    }
  }
};
