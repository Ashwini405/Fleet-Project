const multer = require('multer');
const path = require('path');

// ✅ STORAGE CONFIG
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + '-' + Math.round(Math.random() * 1E9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  }
});

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
    fileSize: 5 * 1024 * 1024   // 5MB limit
  },
  fileFilter
});

module.exports = upload;