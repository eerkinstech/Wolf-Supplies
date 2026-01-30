import express from 'express';
import {
  getAllPolicies,
  getPolicy,
  createPolicy,
  updatePolicy,
  deletePolicy
} from '../controllers/policyController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all policies (public - for menu selector)
router.get('/', getAllPolicies);

// Get single policy (public)
router.get('/:slug', getPolicy);

// Create policy (admin)
router.post('/', protect, admin, createPolicy);

// Update policy (admin)
router.patch('/:id', protect, admin, updatePolicy);

// Delete policy (admin)
router.delete('/:id', protect, admin, deletePolicy);

export default router;
