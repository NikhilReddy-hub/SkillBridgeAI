const multer = require('multer');
const path = require('path');
const { AppError } = require('../utils/AppError');

// ─── Storage: memory (for PDF parsing / Cloudinary upload) ───────────────────
const storage = multer.memoryStorage();

// ─── File Filter ──────────────────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['application/pdf'];
  const allowedExtensions = ['.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new AppError('Only PDF files are allowed for resume upload.', 400), false);
  }
};

// ─── Upload Instance ──────────────────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
});

// ─── Middleware Exports ───────────────────────────────────────────────────────
const uploadResume = upload.single('resume');

/**
 * Wraps multer upload with proper error handling
 */
const handleResumeUpload = (req, res, next) => {
  uploadResume(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError('Resume file size exceeds 5MB limit.', 400));
      }
      return next(new AppError(`Upload error: ${err.message}`, 400));
    }
    if (err) return next(err);
    next();
  });
};

module.exports = { handleResumeUpload };
