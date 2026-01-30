import express from 'express';
import { getCart, updateCart, clearCart } from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Cart routes - allow both authenticated and guest users
router.get('/', getCart);
router.post('/', updateCart);
router.delete('/', clearCart);

export default router;
