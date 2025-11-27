const multer = require('multer');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');

// ✅ Backblaze B2 S3-compatible client (for uploads/deletes)
const s3Client = new S3Client({
  region: process.env.B2_REGION,
  endpoint: process.env.B2_ENDPOINT, // S3 API endpoint (e.g. https://s3.us-west-004.backblazeb2.com)
  credentials: {
    accessKeyId: process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APPLICATION_KEY,
  },
});

const upload = multer({ storage: multer.memoryStorage() });

const uploadFileToSpaces = async (file) => {
  try {
    const fileName = `${uuidv4()}-${file.originalname.replaceAll(" ", "_")}`;
    const folder = 'files';
    // console.log("fileName", fileName);

    const uploadParams = {
      Bucket: process.env.B2_BUCKET, // B2 bucket name
      Key: `${folder}/${fileName}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const command = new PutObjectCommand(uploadParams);
    const response = await s3Client.send(command);
    // console.log("response", response);

    // ✅ Correct public Backblaze download URL
    // Pattern:  https://<download-domain>/file/<bucket-name>/<key>
    const fileUrl = `${process.env.B2_DOWNLOAD_URL}/file/${process.env.B2_BUCKET}/${folder}/${fileName}`;
    return fileUrl;
  } catch (err) {
    console.error('Upload error:', err.message);
    return null;
  }
};

const deleteFileFromSpaces = async (fileUrl) => {
  try {
    // ✅ Extract the S3 key from the public URL
    // Example public URL: https://f004.backblazeb2.com/file/<bucket>/<folder>/<filename>
    const pathnameParts = new URL(fileUrl).pathname.split('/');
    const bucketIndex = pathnameParts.indexOf(process.env.B2_BUCKET);
    const fileKey = pathnameParts.slice(bucketIndex + 1).join('/'); // files/uuid-file.ext
    // console.log("filekey", fileKey);

    const deleteParams = {
      Bucket: process.env.B2_BUCKET,
      Key: fileKey,
    };
    const command = new DeleteObjectCommand(deleteParams);
    await s3Client.send(command);
    return true;
  } catch (err) {
    console.error('Delete error:', err.message);
    return false;
  }
};

module.exports = { upload, uploadFileToSpaces, deleteFileFromSpaces };