/**
 * Media Utilities - Helper functions for media processing
 */

const fs = require('fs');
const path = require('path');

/**
 * Get image dimensions using a lightweight approach
 * For production, consider using a library like 'sharp' or 'jimp'
 */
const getImageDimensions = async (filePath) => {
  try {
    // For now, return null - in production, use 'sharp'
    // const metadata = await sharp(filePath).metadata();
    // return { width: metadata.width, height: metadata.height };
    return null;
  } catch (error) {

    return null;
  }
};

/**
 * Ensure uploads directory exists
 */
const ensureUploadsDir = () => {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  return uploadsDir;
};

/**
 * Validate file size
 */
const validateFileSize = (size, maxSize = 100 * 1024 * 1024) => {
  // 100MB max by default
  return size <= maxSize;
};

/**
 * Generate unique filename
 */
const generateFilename = (originalname) => {
  const ext = path.extname(originalname);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `media-${timestamp}-${random}${ext}`;
};

module.exports = {
  getImageDimensions,
  ensureUploadsDir,
  validateFileSize,
  generateFilename,
};

