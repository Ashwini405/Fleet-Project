const multer = require('multer');
const path = require('path');

// The Cloudinary SDK parses CLOUDINARY_URL as soon as it is required and throws
// (crashing the whole server) if it is malformed. Clean up common paste mistakes
// first — surrounding quotes/spaces or a copied "CLOUDINARY_URL=" prefix — and if
// it is still invalid, log it and fall back to local disk instead of crashing.
function normalizeCloudinaryEnv() {
  const raw = process.env.CLOUDINARY_URL;
  if (raw === undefined) return;
  const value = raw.trim().replace(/^CLOUDINARY_URL\s*=\s*/i, '').replace(/^['"]|['"]$/g, '').trim();
  let valid = false;
  try {
    const url = new URL(value);
    valid = url.protocol === 'cloudinary:' && url.username && url.password && url.hostname;
  } catch { /* invalid URL */ }
  if (valid) {
    process.env.CLOUDINARY_URL = value;
  } else {
    if (value) console.error('CLOUDINARY_URL is invalid (expected cloudinary://<api_key>:<api_secret>@<cloud_name>) — uploads will be saved to local disk.');
    delete process.env.CLOUDINARY_URL;
  }
}
normalizeCloudinaryEnv();

const cloudinary = require('cloudinary').v2;

// ======================================================
// Upload storage shared by every multer instance.
//
// With CLOUDINARY_URL set (production / Render, whose disk is wiped on every
// deploy) files go to Cloudinary; otherwise they are written to uploads/ as
// before. Either way the file keeps the same generated filename and
// file.path = "uploads/<filename>", so controllers, DB values and frontend
// "/uploads/<filename>" links stay unchanged — server.js redirects
// /uploads/<filename> to Cloudinary when the file isn't on local disk.
// ======================================================

const FOLDER = 'fleet-uploads';
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);

let configured = false;
function isCloudinaryEnabled() {
  if (!process.env.CLOUDINARY_URL) return false;
  if (!configured) {
    // CLOUDINARY_URL = cloudinary://<api_key>:<api_secret>@<cloud_name>
    const url = new URL(process.env.CLOUDINARY_URL);
    cloudinary.config({
      cloud_name: url.hostname,
      api_key: decodeURIComponent(url.username),
      api_secret: decodeURIComponent(url.password),
      secure: true,
    });
    configured = true;
  }
  return true;
}

const uniqueFilename = (file) =>
  Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);

// Images are stored as image assets (public id without extension); PDFs and
// other documents as raw assets (public id keeps the extension).
function cloudinaryTarget(filename) {
  const ext = path.extname(filename).toLowerCase();
  return IMAGE_EXTENSIONS.has(ext)
    ? { resource_type: 'image', public_id: `${FOLDER}/${path.basename(filename, path.extname(filename))}`, format: ext.slice(1) }
    : { resource_type: 'raw', public_id: `${FOLDER}/${filename}` };
}

function cloudinaryUrl(filename) {
  if (!isCloudinaryEnabled()) return null;
  const { resource_type, public_id, format } = cloudinaryTarget(filename);
  return cloudinary.url(public_id, { resource_type, format, secure: true });
}

const cloudinaryStorage = {
  _handleFile(req, file, cb) {
    const filename = uniqueFilename(file);
    const { resource_type, public_id } = cloudinaryTarget(filename);
    const stream = cloudinary.uploader.upload_stream(
      // asset_folder: where it shows in the Media Library on "Dynamic folders" accounts
      { resource_type, public_id, asset_folder: FOLDER, overwrite: false },
      (error, result) => {
        if (error) return cb(new Error(`Cloud upload failed: ${error.message}`));
        cb(null, {
          filename,
          path: `uploads/${filename}`,
          size: result.bytes,
          cloudinary_url: result.secure_url,
        });
      }
    );
    file.stream.pipe(stream);
  },
  _removeFile(req, file, cb) {
    const { resource_type, public_id } = cloudinaryTarget(file.filename);
    cloudinary.uploader.destroy(public_id, { resource_type }).then(() => cb(null), cb);
  },
};

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, uniqueFilename(file)),
});

// Chosen per file so CLOUDINARY_URL is read after dotenv has loaded.
const uploadStorage = {
  _handleFile(req, file, cb) {
    (isCloudinaryEnabled() ? cloudinaryStorage : diskStorage)._handleFile(req, file, cb);
  },
  _removeFile(req, file, cb) {
    (file.cloudinary_url ? cloudinaryStorage : diskStorage)._removeFile(req, file, cb);
  },
};

module.exports = { uploadStorage, cloudinaryUrl, isCloudinaryEnabled };
