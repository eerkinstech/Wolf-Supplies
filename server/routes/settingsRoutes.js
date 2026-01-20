import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { getMenu, saveMenu } from '../controllers/settingsController.js';
import { getFeaturedCollections, saveFeaturedCollections } from '../controllers/settingsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getSettings);
router.patch('/', protect, admin, updateSettings);

// Browse menu endpoints
router.get('/menu', getMenu);
router.post('/menu', protect, admin, saveMenu);

// Featured collections endpoints
router.get('/featured-collections', getFeaturedCollections);
router.post('/featured-collections', protect, admin, saveFeaturedCollections);

export default router;