import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { protect, admin } from '../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure local file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: name-timestamp-randomstring.ext
    // Sanitize the original filename: remove spaces and special characters
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000000000).toString();
    const ext = path.extname(file.originalname);

    // Get basename and sanitize: remove spaces, special chars, keep only alphanumeric, dash, underscore
    let name = path.basename(file.originalname, ext);
    name = name
      .toLowerCase()
      .replace(/\s+/g, '-')  // Replace spaces with dashes
      .replace(/[^a-z0-9\-_]/g, '')  // Remove special characters, keep only alphanumeric, dash, underscore
      .replace(/^-+|-+$/g, '');  // Remove leading/trailing dashes

    // Ensure name is not empty
    if (!name) name = 'file';

    const filename = `${name}-${timestamp}-${random}${ext}`;
    console.log(`Generated filename: ${filename} (types: ${typeof filename})`);
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  },
});

// GET endpoint to test uploads directory
router.get('/test', (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir);
    res.json({
      uploadsDir,
      filesCount: files.length,
      recentFiles: files.slice(-10)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error reading uploads directory', error: error.message });
  }
});

// Single image upload - only requires authentication (not admin)
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('=== FILE UPLOAD DEBUG ===');
    console.log('Original filename:', req.file.originalname);
    console.log('Saved filename:', req.file.filename);
    console.log('File size:', req.file.size);
    console.log('File path:', path.join(uploadsDir, req.file.filename));

    // Verify file exists
    const filePath = path.join(uploadsDir, req.file.filename);
    const fileExists = fs.existsSync(filePath);
    console.log('File exists:', fileExists);

    if (!fileExists) {
      console.error(`File not found after upload: ${filePath}`);
      return res.status(500).json({ message: 'File was not saved properly' });
    }

    // Return the relative URL path for the uploaded file
    const fileUrl = `/uploads/${req.file.filename}`;
    console.log('Returning URL:', fileUrl);
    console.log('======================');

    res.json({
      url: fileUrl,
      filename: req.file.filename,
      success: true
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// Public image upload - no authentication required (for page builder)
router.post('/public', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('=== PUBLIC FILE UPLOAD DEBUG ===');
    console.log('Original filename:', req.file.originalname);
    console.log('Saved filename:', req.file.filename);
    console.log('File size:', req.file.size);
    console.log('File path:', path.join(uploadsDir, req.file.filename));

    // Verify file exists
    const filePath = path.join(uploadsDir, req.file.filename);
    const fileExists = fs.existsSync(filePath);
    console.log('File exists:', fileExists);

    if (!fileExists) {
      console.error(`File not found after upload: ${filePath}`);
      return res.status(500).json({ message: 'File was not saved properly' });
    }

    // Return the relative URL path for the uploaded file
    const fileUrl = `/uploads/${req.file.filename}`;
    console.log('Returning URL:', fileUrl);
    console.log('======================');

    res.json({
      url: fileUrl,
      filename: req.file.filename,
      success: true
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// Multiple images upload - only requires authentication (not admin)
router.post('/multiple', protect, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const urls = req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename,
    }));

    res.json({ urls });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

export default router;

