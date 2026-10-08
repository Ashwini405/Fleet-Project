const multer = require('multer');
const path = require('path');

const { uploadStorage } = require('./uploadStorage');

// ✅ STORAGE CONFIG (Cloudinary when CLOUDINARY_URL is set, else uploads/)
const storage = uploadStorage;

// ✅ FILE FILTER (VERY IMPORTANT)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;

  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);

  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Only images (jpg, png) and PDF files are allowed'));
  }
};

// ✅ FINAL UPLOAD CONFIG
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024   // 10MB — matches the "max. 10MB" upload boxes and Cloudinary's free-plan file limit
  },
  fileFilter
});

module.exports = upload;