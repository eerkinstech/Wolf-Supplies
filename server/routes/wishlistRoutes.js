import express from 'express';
import { getWishlist, addToWishlist, removeFromWishlist, clearWishlist } from '../controllers/wishlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getWishlist).post(addToWishlist).delete(clearWishlist);
// DELETE /api/wishlist/:productId?variantId=... will remove specific variant snapshot when provided
router.route('/:productId').delete(removeFromWishlist);

export default router;

