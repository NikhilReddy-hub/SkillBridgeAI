const pdf = require('pdf-parse');

/**
 * Extract text content from a PDF buffer.
 * @param {Buffer} buffer - PDF file buffer
 * @returns {Promise<string>} Extracted text
 */
exports.extractText = async (buffer) => {
  try {
    const data = await pdf(buffer);
    // Clean up whitespace and normalize
    return data.text
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\s{2,}/g, ' ')
      .trim()
      .substring(0, 10000); // Limit to 10k chars for AI analysis
  } catch (error) {
    console.error('PDF extraction error:', error.message);
    return ''; // Return empty string if parsing fails
  }
};

/**
 * Upload PDF to Cloudinary (optional, requires cloudinary package).
 * Falls back gracefully if Cloudinary is not configured.
 * @param {Buffer} buffer - PDF file buffer
 * @param {string} userId - User ID for unique filename
 * @returns {Promise<string|null>} Cloudinary URL or null
 */
exports.uploadToCloudinary = async (buffer, userId) => {
  try {
    const cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'skillbridge/resumes',
          public_id: `resume_${userId}`,
          resource_type: 'raw',
          overwrite: true,
          format: 'pdf',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error.message);
    return null;
  }
};
