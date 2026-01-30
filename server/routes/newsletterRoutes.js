import express from 'express';
import {
    subscribeNewsletter,
    getNewsletterSubscriptions,
    getNewsletterSubscription,
    unsubscribeNewsletter,
    updateNewsletterStatus,
    deleteNewsletterSubscription,
    getNewsletterStats
} from '../controllers/newsletterController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// ===== PUBLIC ROUTES (No authentication required) =====
router.post('/subscribe', subscribeNewsletter);
router.post('/unsubscribe', unsubscribeNewsletter);

// ===== ADMIN ROUTES (Admin authentication required) =====
router.get('/', protect, admin, getNewsletterSubscriptions);
router.get('/stats', protect, admin, getNewsletterStats);
router.get('/:id', protect, admin, getNewsletterSubscription);
router.patch('/:id/status', protect, admin, updateNewsletterStatus);
router.delete('/:id', protect, admin, deleteNewsletterSubscription);

export default router;
