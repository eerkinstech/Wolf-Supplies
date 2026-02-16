const express = require('express');
const {
  getAllPages,
  getPage,
  createPage,
  updatePage,
  deletePage
} = require('../controllers/pageController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

const router = express.Router();

// Get all pages (public - for menu selector)
router.get('/', getAllPages);

// Get single page (public)
router.get('/:slug', getPage);

// Create page (admin)
router.post('/', protect, admin, createPage);

// Update page (admin)
router.patch('/:id', protect, admin, updatePage);

// Delete page (admin)
router.delete('/:id', protect, admin, deletePage);

module.exports = router;

