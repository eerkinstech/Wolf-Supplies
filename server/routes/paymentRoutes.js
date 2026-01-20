import express from 'express';
import { createCheckoutSession, webhookHandler, getStripeStatus, createPaymentIntent } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected endpoint to create a checkout session
router.post('/create-checkout-session', protect, createCheckoutSession);

// Status (debug) - shows whether Stripe key is configured (masked preview)
router.get('/status', getStripeStatus);

// Create PaymentIntent for Elements (in-page) flow
router.post('/create-payment-intent', protect, createPaymentIntent);

// Note: webhook should be mounted with raw body - Server.js mounts the raw endpoint.

export default router;
