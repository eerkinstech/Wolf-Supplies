/**
 * Media Controller - Handle media uploads, listing, and serving
 */

import fs from 'fs';
import path from 'path';
import MediaAsset from '../models/MediaAsset.js';
import { getImageDimensions } from '../utils/mediaUtils.js';

// ============================================================================
// UPLOAD - POST /api/media/upload
// ============================================================================

export const uploadMedia = async (req, res) => {
  try {
    // Multer middleware should have processed the file
    const file = req.file;
    console.log('Upload request received:', {
      hasFile: !!file,
      fileName: file?.originalname,
      mimeType: file?.mimetype,
      size: file?.size,
      path: file?.path,
    });

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Extract mime type and validate
    const mime = file.mimetype;
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm', 'video/ogg'].includes(mime)) {
      fs.unlinkSync(file.path); // Clean up uploaded file
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    // Determine asset type
    const type = mime.startsWith('image') ? 'image' : 'video';

    // Get dimensions for images
    let width, height;
    if (type === 'image') {
      const dims = await getImageDimensions(file.path);
      width = dims?.width;
      height = dims?.height;
    }

    // Create MediaAsset document
    const asset = new MediaAsset({
      filename: file.originalname || file.filename,
      mime,
      size: file.size,
      type,
      storageKeyOrPath: file.path,
      url: `/api/media/serve/${generateAssetId()}`, // Will be updated with actual ID
      width,
      height,
      uploadedBy: req.user?._id || null,
    });

    await asset.save();

    // Update URL with actual asset ID
    asset.url = `/api/media/serve/${asset._id}`;
    await asset.save();

    console.log('File uploaded successfully:', {
      assetId: asset._id,
      url: asset.url,
      filePath: file.path,
    });

    res.json({
      success: true,
      asset: {
        _id: asset._id,
        assetId: asset._id.toString(),
        type: asset.type,
        filename: asset.filename,
        url: asset.url,
        thumbnailUrl: asset.thumbnailUrl,
        width: asset.width,
        height: asset.height,
        duration: asset.duration,
        size: asset.size,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Upload failed' });
  }
};

// ============================================================================
// LIST - GET /api/media (with pagination, search, filter)
// ============================================================================

export const getMediaAssets = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type, // 'image' | 'video' | undefined (all)
      search, // search in filename
      sort = '-createdAt', // sort field
    } = req.query;

    // Build query
    let query = MediaAsset.find().active();

    if (type && ['image', 'video'].includes(type)) {
      query = query.where('type', type);
    }

    if (search) {
      query = query.where('filename', { $regex: search, $options: 'i' });
    }

    // Count total for pagination
    const total = await MediaAsset.countDocuments(query);
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with sort and pagination
    const assets = await query
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('_id filename mime type url thumbnailUrl width height duration size createdAt');

    res.json({
      success: true,
      assets: assets.map((asset) => ({
        _id: asset._id,
        assetId: asset._id.toString(),
        filename: asset.filename,
        type: asset.type,
        url: asset.url,
        thumbnailUrl: asset.thumbnailUrl,
        width: asset.width,
        height: asset.height,
        duration: asset.duration,
        size: asset.size,
        createdAt: asset.createdAt,
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('List error:', error);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
};

// ============================================================================
// GET ASSET - GET /api/media/:id
// ============================================================================

export const getMediaAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await MediaAsset.findById(id).active();

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    res.json({
      success: true,
      asset: {
        _id: asset._id,
        assetId: asset._id.toString(),
        filename: asset.filename,
        type: asset.type,
        url: asset.url,
        thumbnailUrl: asset.thumbnailUrl,
        width: asset.width,
        height: asset.height,
        duration: asset.duration,
        size: asset.size,
        mime: asset.mime,
        createdAt: asset.createdAt,
      },
    });
  } catch (error) {
    console.error('Get error:', error);
    res.status(500).json({ error: 'Failed to fetch asset' });
  }
};

// ============================================================================
// SERVE - GET /api/media/serve/:id (serve actual file)
// ============================================================================

export const serveMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { thumbnail } = req.query;

    console.log('Serve request:', { id, thumbnail });

    const asset = await MediaAsset.findById(id).active();

    if (!asset) {
      console.error('Asset not found:', id);
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Check if file exists
    const filePath = asset.storageKeyOrPath;
    console.log('Serving file:', { filePath, exists: fs.existsSync(filePath) });

    if (!fs.existsSync(filePath)) {
      console.error('File not found at path:', filePath);
      return res.status(404).json({ error: 'File not found' });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', asset.mime);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache

    // Serve file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (err) => {
      console.error('Stream error:', err);
      res.status(500).json({ error: 'Failed to serve file' });
    });
  } catch (error) {
    console.error('Serve error:', error);
    res.status(500).json({ error: 'Failed to serve asset' });
  }
};

// ============================================================================
// DELETE - DELETE /api/media/:id (soft delete)
// ============================================================================

export const deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await MediaAsset.findById(id).active();

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Soft delete
    asset.deletedAt = new Date();
    await asset.save();

    // Optionally hard-delete file from disk
    // (commented out - keep files for recovery)
    // if (fs.existsSync(asset.storageKeyOrPath)) {
    //   fs.unlinkSync(asset.storageKeyOrPath);
    // }

    res.json({ success: true, message: 'Asset deleted' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete asset' });
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateAssetId() {
  return `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
