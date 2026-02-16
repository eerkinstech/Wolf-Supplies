const express = require('express');
const {
  getPageConfig,
  savePageConfig,
  getAllPageConfigs,
  updatePageSection,
  deletePageSection,
  togglePagePublish
} = require('../controllers/pageConfigController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

const router = express.Router();

// Get page configuration (public)
router.get('/:pageName', getPageConfig);

// Get all page configurations (admin only)
router.get('/', protect, admin, getAllPageConfigs);

// Save page configuration (admin only)
router.post('/:pageName', protect, admin, savePageConfig);

// Update specific section (admin only)
router.patch('/:pageName/section/:sectionId', protect, admin, updatePageSection);

// Delete specific section (admin only)
router.delete('/:pageName/section/:sectionId', protect, admin, deletePageSection);

// Toggle page publish status (admin only)
router.patch('/:pageName/publish', protect, admin, togglePagePublish);

module.exports = router;

