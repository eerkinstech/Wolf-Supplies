import express from 'express';
import {
  getAllOrders,
  getUserOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  updateOrderPayment,
  updateOrderDelivery,
  deleteOrder,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin routes
router.get('/', protect, admin, getAllOrders); // Get all orders (admin only)
router.delete('/:id', protect, admin, deleteOrder); // Delete order (admin only)

// User routes
router.get('/user/my-orders', protect, getUserOrders); // Get user's orders
router.post('/', protect, createOrder); // Create new order
router.get('/:id', protect, getOrderById); // Get single order

// Admin update routes
router.put('/:id/status', protect, admin, updateOrderStatus); // Update order status
router.put('/:id/payment', protect, admin, updateOrderPayment); // Update payment status
router.put('/:id/delivery', protect, admin, updateOrderDelivery); // Update delivery status
router.put('/:id', protect, admin, updateOrderStatus); // Generic update for status

export default router;
