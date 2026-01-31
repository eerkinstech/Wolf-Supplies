import express from 'express';
import { createCheckoutSession, webhookHandler, getStripeStatus, createPaymentIntent } from '../controllers/paymentController.js';

const router = express.Router();

// Public endpoints - allow both guest and authenticated users
router.post('/create-checkout-session', createCheckoutSession);

// Status (debug) - shows whether Stripe key is configured (masked preview)
router.get('/status', getStripeStatus);

// Create PaymentIntent for Elements (in-page) flow - allow both guest and authenticated
router.post('/create-payment-intent', createPaymentIntent);

// Note: webhook should be mounted with raw body - Server.js mounts the raw endpoint.

export default router;

