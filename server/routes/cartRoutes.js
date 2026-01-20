import express from 'express';
import { getCart, updateCart, clearCart } from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getCart);
router.post('/', protect, updateCart);
router.delete('/', protect, clearCart);

export default router;
