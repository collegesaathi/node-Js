const multer = require("multer");
const path = require("path");
const fs = require("fs");

require("dotenv").config();

const BASE_UPLOAD_PATH = process.env.UPLOAD_BASE_PATH || "public/uploads";

const dynamicUpload = (folderName) => {
  return multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        const finalFolder = path.join(process.cwd(), BASE_UPLOAD_PATH, folderName);
        // Create folder if not exist
        if (!fs.existsSync(finalFolder)) {
          fs.mkdirSync(finalFolder, { recursive: true });
        }

        cb(null, finalFolder);
      },
      filename: (req, file, cb) => {
        const uniqueName =
          Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
        cb(null, uniqueName);
      },
    }),

    limits: { fileSize: 100  * 1024 * 1024 },
  });
};

module.exports = dynamicUpload;
