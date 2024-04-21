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
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const originalName = file.originalname.replace(/\s+/g, "_");
    cb(null, `${uniqueSuffix}-${originalName}`);
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

export default multerMiddleware;
