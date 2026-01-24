const dotenv = require("dotenv");
dotenv.config();
// require("./dbconfigration");
require("./config/prisma");
const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
// const serverless = require('serverless-http');


app.use(
  cors({
    origin: [
      "https://indiaprograms.com",
      "https://www.indiaprograms.com"
    ],
    credentials: true,
    methods: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
  })
);



app.use(express.json({ limit: "500000mb" }));
app.use(express.urlencoded({ extended: true, limit: "500000mb" }));

// -----------------------------------------------------
// ✅ STATIC IMAGE FOLDERS (VERY IMPORTANT)
// -----------------------------------------------------
// app.use("/approval_images", express.static(path.join(__dirname, "../public/approval_images")));
// app.use("/placement_partners", express.static(path.join(__dirname, "../public/placement_partners")));

// app.use("/universities/icon", express.static(path.join(__dirname, "../public/universities/icon")));
// app.use("/universities/main", express.static(path.join(__dirname, "../public/universities/main")));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
// या
app.use(express.static(path.join(__dirname, 'public')));

// Alternative: सभी static files के लिए
app.use(express.static('public'));

// -----------------------------------------------------


const PORT = process.env.REACT_APP_SERVER_DOMAIN || 5000;

app.use("/api", require("./routes/authRoutes"));
app.use("/api", require("./routes/homeRoutes"));
app.use("/api", require("./routes/userRoutes"));
app.use("/api", require("./routes/universityRoutes"));
app.use("/api", require("./routes/CourseRoute"));
app.use("/api", require("./routes/CommonRoute"));
app.use("/api", require("./routes/specialisationRoute"));
app.use("/api", require("./routes/EnqiuryRoute"));
app.use("/api", require("./routes/PlaceAndApprovalRoute"));
app.use("/api", require("./routes/programRoutes"));
app.use("/api", require("./routes/OtpRoutes"));
app.use("/api", require("./routes/CompareRoute"));
app.use("/api", require("./routes/proinsightRoutes"));
app.use("/api", require("./routes/JobRoute"));
app.use("/api", require("./routes/ChatRoute"));
app.use("/api", require("./routes/specialisationprogramRoutes"));
app.use("/api", require("./routes/SitemapRoutes"));
app.use("/api", require("./routes/clickpickRoutes"));
app.use("/api", require("./routes/FiltrationRoutes"));





// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();


// app.get('/', async (req, res) => {
//   try {
//     // 1️⃣ Get MAX(id)
//     const maxResult = await prisma.$queryRaw`
//       SELECT MAX(id) AS max_id FROM "Approvals"
//     `;
//     const maxId = maxResult[0]?.max_id || 0;

//     // 2️⃣ Reset sequence
//     await prisma.$queryRaw`
//       SELECT setval('"Approvals_id_seq"', ${maxId + 1}, false);
//     `;

//     console.log("Approvals sequence updated to:", maxId + 1);

//     // 3️⃣ Create test record (use correct field: title)
//     const test = await prisma.approvals.create({
//       data: {
//         title: "Test Approval " + Date.now(),
//         image: null
//       }
//     });

//     res.json({
//       success: true,
//       expectedNextId: maxId + 1,
//       actualInsertedId: test.id
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error });
//   }
// });
// app.get('/', async (req, res) => {
//   try {
//     const maxResult = await prisma.$queryRaw`
//       SELECT MAX(id) as max_id FROM "University"
//     `;
//     const maxId = maxResult[0]?.max_id || 0;

//     await prisma.$queryRaw`
//       SELECT setval('"University_id_seq"', ${maxId + 1}, false)
//     `;

//     console.log("University sequence updated to:", maxId + 1);

//     const test = await prisma.university.create({
//       data: {
//         slug: "test-university-" + Date.now(),
//         name: "Test University"
//       }
//     });

//     res.json({
//       success: true,
//       expectedId: maxId + 1,
//       actualId: test.id
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error });
//   }
// });


// app.get('/', async (req, res) => {
//   try {
//     // 1️⃣ Get MAX(id)
//     const maxResult = await prisma.$queryRaw`
//       SELECT MAX(id) AS max_id FROM "Placements"
//     `;
//     const maxId = maxResult[0]?.max_id || 0;

//     // 2️⃣ Reset sequence for Placements
//     await prisma.$queryRaw`
//       SELECT setval('"Placements_id_seq"', ${maxId + 1}, false);
//     `;

//     console.log("Placements sequence updated to:", maxId + 1);

//     // 3️⃣ Insert test row
//     const test = await prisma.placements.create({
//       data: {
//         title: "Test Placement " + Date.now(),
//         image: null
//       }
//     });

//     res.json({
//       success: true,
//       expectedNextId: maxId + 1,
//       actualInsertedId: test.id
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error });
//   }
// });






// app.get('/', async (req, res) => {
//   try {
//     const baseURL = "http://localhost:5000/uploads/universities/";

//     const query = `
//       UPDATE "University"
//       SET 
//         cover_image = '${baseURL}' || cover_image,
//         icon = '${baseURL}' || icon
//       WHERE 
//         (
//           (cover_image IS NOT NULL AND cover_image NOT LIKE 'http%') OR
//           (icon IS NOT NULL AND icon NOT LIKE 'http%')
//         );
//     `;

//     await prisma.$queryRawUnsafe(query);

//     return res.status(200).json({
//       message: "University images updated successfully with full URLs"
//     });

//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({
//       error: error.message,
//       code: error.code,
//       meta: error.meta
//     });
//   }
// });

// app.get("/", async (req, res) => {
//   try {
//     const newDomain = process.env.BASE_URL || "https://yourdomain.com";
//     const folder = "/uploads/universities/";

//     const newURL = newDomain + folder;

//     const query = `
//       UPDATE "University"
//       SET 
//         cover_image = regexp_replace(cover_image, '^http[s]?://[^/]+/uploads/universities/', '${newURL}'),
//         icon = regexp_replace(icon, '^http[s]?://[^/]+/uploads/universities/', '${newURL}')
//       WHERE 
//         (cover_image IS NOT NULL AND cover_image LIKE 'http%')
//         OR
//         (icon IS NOT NULL AND icon LIKE 'http%');
//     `;

//     await prisma.$queryRawUnsafe(query);

//     return res.status(200).json({
//       message: "Old domain replaced with NEW domain successfully!"
//     });

//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: error.message });
//   }
// });


app.get("/", (req, res) => {
  res.json({
    msg: "Hello World",
    status: 200,
  });
});

// app.get('/', async (req, res) => {
//   try {
//     const baseURL = "http://localhost:5000/uploads/approvals/";

//     // Update Approvals image URLs
//     await prisma.$queryRawUnsafe(`
//       UPDATE "Approvals"
//       SET image = '${baseURL}' || image
//       WHERE image IS NOT NULL AND image NOT LIKE 'http%';
//     `);

//     return res.status(200).json({
//       message: "approvals image URLs updated successfully"
//     });

//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({
//       error: error.message
//     });
//   }
// });


const server = app.listen(PORT, () => console.log("Server is running at port : " + PORT));
server.timeout = 360000;