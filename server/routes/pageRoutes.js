import express from 'express';
import {
  getAllPages,
  getPage,
  createPage,
  updatePage,
  deletePage
} from '../controllers/pageController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

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

export default router;
