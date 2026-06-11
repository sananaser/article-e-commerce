const path = require("path");
const multer = require("multer");

const storage = multer.memoryStorage();

const imageFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype.split("/")[1] || "");
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (JPEG, PNG, WEBP, GIF) are allowed"), false);
  }
};

const uploadProductImages = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: imageFilter,
});

module.exports = { uploadProductImages, uploadDir: "" };
