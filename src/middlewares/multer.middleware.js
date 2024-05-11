import multer from "multer";
import path from "path";
import fs from "fs";

const ensureUploadDirectory = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join("public", "uploads");
    ensureUploadDirectory(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const originalName = file.originalname;
    cb(null, `${originalName}`);
  },
});

const fileFilter = (req, file, cb) => {
  cb(null, true);
};

const limits = { fileSize: 25 * 1024 * 1024 };

const multerMiddleware = multer({
  storage,
  fileFilter,
  limits,
});

const logMulter = (req, res, next) => {
  console.log("Uploaded File:", req.file); // Check if the file is here
  console.log("Request Body:", req.body); // Check the rest of the data
  next();
};

export default multerMiddleware;
