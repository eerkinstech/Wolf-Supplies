import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  updateReviewApprovalStatus,
  deleteProductReview,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getProducts);
router.post('/', protect, admin, createProduct);
router.post('/:id/reviews', protect, createProductReview);
router.patch('/:id/reviews/:index', protect, admin, updateReviewApprovalStatus);
router.delete('/:id/reviews/:index', protect, admin, deleteProductReview);
router.get('/slug/:slug', getProductById); // temporary: route slug to id handler (controller will handle both)
router.get('/:id', getProductById);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

export default router;

