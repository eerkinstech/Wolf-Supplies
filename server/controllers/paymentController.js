import Stripe from 'stripe';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { sendOrderConfirmationEmail, sendOrderNotificationToAdmin, sendOrderWithPDF } from '../utils/emailService.js';
import { generateOrderPDF } from '../utils/pdfGenerator.js';

dotenv.config();

// Accept both STRIPE_SECRET_KEY and STRIPE_KEY for backwards compatibility
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_KEY;
let stripe = null;
if (STRIPE_KEY) {
    stripe = new Stripe(STRIPE_KEY);
} else {

}
// Base URL for building absolute image paths. Prefer server API URL if available.
const SERVER_BASE = process.env.SERVER_URL || process.env.VITE_API_URL || process.env.CLIENT_URL;

// Create an order and Stripe Checkout session (guest or authenticated users)
export const createCheckoutSession = async (req, res, next) => {
    try {
        if (!stripe) return res.status(500).json({ message: 'Stripe is not configured on the server. Set STRIPE_SECRET_KEY in environment.' });
        const user = req.user; // optional - can be null for guest users

        const {
            orderItems,
            shippingAddress,
            billingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalAmount,
            couponCode,
            discountAmount,
        } = req.body;

        if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        // Create order in DB with pending status
        const orderId = `ORD-${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}`;

        // DEBUG: Log incoming request data

        const order = new Order({
            orderId,
            user: user?._id || null, // Allow null for guest users
            orderItems: orderItems.map((it) => ({
                name: it.name,
                qty: it.qty || it.quantity || it.quantityOrdered || 1,
                price: it.price,
                product: it.product || it._id || it.productId,
                image: it.image,
                selectedVariants: it.selectedVariants || null,
                selectedSize: it.selectedSize || null,
                selectedColor: it.selectedColor || null,
                variantId: it.variantId || null,
            })),
            contactDetails: {
                firstName: shippingAddress.firstName || '',
                lastName: shippingAddress.lastName || '',
                email: shippingAddress.email || '',
                phone: shippingAddress.phone || '',
            },
            shippingAddress: {
                address: shippingAddress.address,
                apartment: shippingAddress.apartment || '',
                city: shippingAddress.city,
                stateRegion: shippingAddress.stateRegion || '',
                postalCode: shippingAddress.postalCode || shippingAddress.postalCode || shippingAddress.postal || '',
                country: shippingAddress.country || 'UK',
            },
            billingAddress: billingAddress ? {
                address: billingAddress.address,
                apartment: billingAddress.apartment || '',
                city: billingAddress.city,
                stateRegion: billingAddress.stateRegion || '',
                postalCode: billingAddress.postalCode || '',
                country: billingAddress.country || 'UK',
            } : {
                address: shippingAddress.address,
                apartment: shippingAddress.apartment || '',
                city: shippingAddress.city,
                stateRegion: shippingAddress.stateRegion || '',
                postalCode: shippingAddress.postalCode || '',
                country: shippingAddress.country || 'UK',
            },
            paymentMethod: paymentMethod || 'card',
            itemsPrice: itemsPrice || 0,
            taxPrice: taxPrice || 0,
            shippingPrice: shippingPrice || 0,
            totalPrice: totalAmount || itemsPrice || 0,
            couponCode: couponCode || null,
            discountAmount: discountAmount || 0,
            status: 'pending',
        });

        try {
            await order.save();
            console.log('[Payment:Checkout] ✓ Order created:', {
                orderId: order.orderId,
                couponCode: order.couponCode,
                discountAmount: order.discountAmount,
                itemsPrice: order.itemsPrice,
                totalPrice: order.totalPrice
            });

            // Increment coupon usage immediately when order is created
            if (order.couponCode) {
                try {
                    console.log('[Payment:Checkout] Incrementing coupon usage for:', order.couponCode);
                    const updatedCoupon = await Coupon.findOneAndUpdate(
                        { code: order.couponCode.toUpperCase() },
                        { $inc: { currentUses: 1 } },
                        { new: true }
                    );

                    if (updatedCoupon) {
                        console.log('[Payment:Checkout] ✓ Coupon usage incremented:', {
                            code: updatedCoupon.code,
                            currentUses: updatedCoupon.currentUses,
                            maxUses: updatedCoupon.maxUses
                        });

                        // Mark order as having coupon usage incremented
                        await Order.updateOne(
                            { _id: order._id },
                            { couponUsageIncremented: true }
                        );
                    } else {
                        console.log('[Payment:Checkout] ⚠️  Coupon not found:', order.couponCode);
                    }
                } catch (couponErr) {
                    console.error('[Payment:Checkout] ⚠️  Failed to increment coupon:', couponErr.message);
                    // Don't fail order creation if coupon update fails
                }
            }
        } catch (saveErr) {
            console.error('[Payment:Checkout] ✗ Failed to save order:', saveErr.message);
            return res.status(400).json({ message: 'Failed to create order', error: saveErr.message });
        }

        // Build Stripe line items
        const isValidUrl = (u) => {
            try {
                // allow http(s) only
                const parsed = new URL(u);
                return parsed.protocol === 'http:' || parsed.protocol === 'https:';
            } catch (e) {
                return false;
            }
        };

        const normalizeImage = (img) => {
            if (!img) return null;
            if (Array.isArray(img)) {
                const first = img.find((x) => !!x);
                return normalizeImage(first);
            }
            if (typeof img === 'object') {
                const url = img.url || img.secure_url || img.path || img.src || img.public_id || img.location;
                if (!url) return null;
                if (typeof url === 'string' && isValidUrl(url)) return url;
                // try prefixing with SERVER_BASE if url is a path
                if (typeof url === 'string' && url.startsWith('/')) return `${SERVER_BASE}${url}`;
                return null;
            }
            if (typeof img === 'string') {
                if (isValidUrl(img)) return img;
                if (img.startsWith('/')) return `${SERVER_BASE}${img}`;
            }
            return null;
        };

        const makeVariantSummary = (it) => {
            const parts = [];
            if (it.selectedSize) parts.push(`Size: ${it.selectedSize}`);
            if (it.selectedColor) parts.push(`Color: ${it.selectedColor}`);
            if (it.selectedVariants && typeof it.selectedVariants === 'object') {
                Object.entries(it.selectedVariants).forEach(([k, v]) => {
                    if (v) parts.push(`${k}: ${v}`);
                });
            }
            if (it.variantId) parts.push(`VariantId: ${it.variantId}`);
            return parts.join(' | ');
        };

        const line_items = order.orderItems.map((it) => {
            const imageUrl = normalizeImage(it.image);
            const variantSummary = makeVariantSummary(it);
            const productData = { name: it.name + (variantSummary ? ` — ${variantSummary}` : '') };
            if (imageUrl) productData.images = [imageUrl];
            // include small metadata for debugging / order reconciliation
            productData.metadata = {
                productId: it.product ? String(it.product) : '',
                variant: JSON.stringify({
                    selectedVariants: it.selectedVariants || null,
                    selectedSize: it.selectedSize || null,
                    selectedColor: it.selectedColor || null,
                    variantId: it.variantId || null,
                }),
            };

            return {
                price_data: {
                    currency: 'gbp',
                    product_data: productData,
                    unit_amount: Math.round((it.price || 0) * 100),
                },
                quantity: it.qty || 1,
            };
        });

        // log line items for debugging (server console)

        let session;
        try {
            session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'payment',
                line_items,
                success_url: `${SERVER_BASE.replace(/\/$/, '')}/order/${order._id}`,
                cancel_url: `${SERVER_BASE.replace(/\/$/, '')}/checkout?canceled=true`,
                metadata: { orderId: order._id.toString(), userId: user?._id?.toString() || 'guest' },
            });

            // Send confirmation emails (don't block checkout if emails fail)
            try {
                await sendOrderConfirmationEmail(order);
                await sendOrderNotificationToAdmin(order);
                console.log('[Payment:Checkout] ✓ Emails sent successfully');
            } catch (emailErr) {
                console.error('[Payment:Checkout] ✗ Email sending failed:', emailErr.message);
                // Don't fail the checkout, just log the error
            }
        } catch (stripeErr) {
            // Return Stripe error details to client for debugging

            return res.status(400).json({ error: stripeErr.message || 'Stripe error' });
        }

        return res.json({ url: session.url, orderId: order._id });
    } catch (err) {
        next(err);
    }
};

// Create PaymentIntent for in-page Stripe Elements flow
export const createPaymentIntent = async (req, res, next) => {
    try {
        if (!stripe) return res.status(500).json({ message: 'Stripe is not configured on the server.' });
        const user = req.user; // Optional - can be null for guest users

        const { orderItems, shippingAddress, billingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalAmount, couponCode, discountAmount } = req.body;
        if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) return res.status(400).json({ message: 'No order items' });

        // create order in DB (pending)
        const orderId = `ORD-${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}`;
        const order = new Order({
            orderId,
            user: user?._id || null, // Allow null for guest users
            orderItems: orderItems.map((it) => ({
                name: it.name,
                qty: it.qty || it.quantity || 1,
                price: it.price,
                product: it.product || it._id || it.productId,
                image: it.image,
                selectedVariants: it.selectedVariants || null,
                selectedSize: it.selectedSize || null,
                selectedColor: it.selectedColor || null,
                variantId: it.variantId || null,
            })),
            contactDetails: {
                firstName: shippingAddress.firstName || '',
                lastName: shippingAddress.lastName || '',
                email: shippingAddress.email || '',
                phone: shippingAddress.phone || '',
            },
            shippingAddress: {
                address: shippingAddress.address,
                apartment: shippingAddress.apartment || '',
                city: shippingAddress.city,
                stateRegion: shippingAddress.stateRegion || '',
                postalCode: shippingAddress.postalCode || '',
                country: shippingAddress.country || 'UK',
            },
            billingAddress: billingAddress ? {
                address: billingAddress.address,
                apartment: billingAddress.apartment || '',
                city: billingAddress.city,
                stateRegion: billingAddress.stateRegion || '',
                postalCode: billingAddress.postalCode || '',
                country: billingAddress.country || 'UK',
            } : {
                address: shippingAddress.address,
                apartment: shippingAddress.apartment || '',
                city: shippingAddress.city,
                stateRegion: shippingAddress.stateRegion || '',
                postalCode: shippingAddress.postalCode || '',
                country: shippingAddress.country || 'UK',
            },
            paymentMethod: paymentMethod || 'card',
            itemsPrice: itemsPrice || 0,
            taxPrice: taxPrice || 0,
            shippingPrice: shippingPrice || 0,
            totalPrice: totalAmount || itemsPrice || 0,
            couponCode: couponCode || null,
            discountAmount: discountAmount || 0,
            status: 'pending',
        });

        try {
            await order.save();
            console.log('[Payment:Intent] ✓ Order created:', {
                orderId: order.orderId,
                couponCode: order.couponCode,
                discountAmount: order.discountAmount,
                itemsPrice: order.itemsPrice,
                totalPrice: order.totalPrice
            });

            // Increment coupon usage immediately when order is created
            if (order.couponCode) {
                try {
                    console.log('[Payment:Intent] Incrementing coupon usage for:', order.couponCode);
                    const updatedCoupon = await Coupon.findOneAndUpdate(
                        { code: order.couponCode.toUpperCase() },
                        { $inc: { currentUses: 1 } },
                        { new: true }
                    );

                    if (updatedCoupon) {
                        console.log('[Payment:Intent] ✓ Coupon usage incremented:', {
                            code: updatedCoupon.code,
                            currentUses: updatedCoupon.currentUses,
                            maxUses: updatedCoupon.maxUses
                        });

                        // Mark order as having coupon usage incremented
                        await Order.updateOne(
                            { _id: order._id },
                            { couponUsageIncremented: true }
                        );
                    } else {
                        console.log('[Payment:Intent] ⚠️  Coupon not found:', order.couponCode);
                    }
                } catch (couponErr) {
                    console.error('[Payment:Intent] ⚠️  Failed to increment coupon:', couponErr.message);
                    // Don't fail order creation if coupon update fails
                }
            }
        } catch (saveErr) {
            console.error('[Payment:Intent] ✗ Failed to save order:', saveErr.message);
            return res.status(400).json({ message: 'Failed to create order', error: saveErr.message });
        }

        // Send confirmation emails (don't block checkout if emails fail)
        try {
            await sendOrderConfirmationEmail(order);
            await sendOrderNotificationToAdmin(order);
            console.log('[Payment:Intent] ✓ Emails sent successfully');
        } catch (emailErr) {
            console.error('[Payment:Intent] ✗ Email sending failed:', emailErr.message);
            // Don't fail the checkout, just log the error
        }

        const amount = Math.round((totalAmount || itemsPrice || 0) * 100);

        // Create PaymentIntent
        const intent = await stripe.paymentIntents.create({
            amount,
            currency: 'gbp',
            metadata: { orderId: order._id.toString(), userId: user?._id?.toString() || 'guest' },
        });

        return res.json({ clientSecret: intent.client_secret, orderId: order._id });
    } catch (err) {

        return res.status(500).json({ error: err.message || 'PaymentIntent creation failed' });
    }
};

// Helper function to increment coupon usage when payment is completed
const incrementCouponUsage = async (orderId) => {
    if (!orderId) {
        console.log('[Coupon] No orderId provided');
        return;
    }

    try {
        console.log('[Coupon] Attempting to increment usage for orderId:', orderId);
        const order = await Order.findById(orderId);

        if (!order) {
            console.log('[Coupon] Order not found:', orderId);
            return;
        }

        console.log('[Coupon] Order found. Coupon code:', order.couponCode);

        if (order.couponCode) {
            const couponCode = order.couponCode.toUpperCase();
            console.log('[Coupon] Looking up coupon with code:', couponCode);

            try {
                const updatedCoupon = await Coupon.findOneAndUpdate(
                    { code: couponCode },
                    { $inc: { currentUses: 1 } },
                    { new: true }
                );

                if (updatedCoupon) {
                    console.log('[Coupon] ✓ Coupon usage updated:', {
                        code: updatedCoupon.code,
                        currentUses: updatedCoupon.currentUses,
                        maxUses: updatedCoupon.maxUses
                    });
                } else {
                    console.log('[Coupon] ✗ Coupon not found with code:', couponCode);
                }
            } catch (couponErr) {
                console.error('[Coupon] ✗ Failed to increment coupon usage:', couponErr.message);
            }
        } else {
            console.log('[Coupon] No coupon code on order');
        }
    } catch (err) {
        console.error('[Coupon] ✗ Error incrementing coupon usage:', err.message);
    }
};

// Stripe webhook handler (expects raw body)
export const webhookHandler = async (req, res) => {
    if (!stripe) return res.status(500).send('Stripe not configured on server.');
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    console.log('[Webhook] ===== WEBHOOK RECEIVED =====');
    console.log('[Webhook] Signature:', sig ? 'Present' : 'Missing');
    console.log('[Webhook] Secret configured:', !!webhookSecret);

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        console.log('[Webhook] ✓ Event verified and constructed');
    } catch (err) {
        console.error('[Webhook] ✗ Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log('[Webhook] ✓ Event type:', event.type);
    console.log('[Webhook] Event ID:', event.id);

    // Handle checkout.session.completed (Hosted Checkout flow)
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const orderId = session.metadata && session.metadata.orderId;
        console.log('[Webhook] checkout.session.completed - orderId:', orderId);
        console.log('[Webhook] Session payment status:', session.payment_status);
        // Increment coupon usage when payment is completed
        if (orderId) {
            await incrementCouponUsage(orderId);

            // Generate and send PDF invoice
            try {
                const order = await Order.findById(orderId);
                if (order) {
                    const pdfBuffer = await generateOrderPDF(order);
                    await sendOrderWithPDF(order, pdfBuffer);
                    console.log('[Webhook] ✓ Order PDF sent successfully');
                }
            } catch (pdfErr) {
                console.error('[Webhook] ✗ PDF generation/send failed:', pdfErr.message);
            }
        } else {
            console.log('[Webhook] ⚠️  No orderId in metadata');
        }
    }

    // Handle payment_intent.succeeded (Elements/PaymentIntent flow)
    if (event.type === 'payment_intent.succeeded') {
        const intent = event.data.object;
        const orderId = intent.metadata && intent.metadata.orderId;
        console.log('[Webhook] payment_intent.succeeded - orderId:', orderId);
        console.log('[Webhook] Intent status:', intent.status);
        // Increment coupon usage when payment is completed
        if (orderId) {
            await incrementCouponUsage(orderId);

            // Generate and send PDF invoice
            try {
                const order = await Order.findById(orderId);
                if (order) {
                    const pdfBuffer = await generateOrderPDF(order);
                    await sendOrderWithPDF(order, pdfBuffer);
                    console.log('[Webhook] ✓ Order PDF sent successfully');
                }
            } catch (pdfErr) {
                console.error('[Webhook] ✗ PDF generation/send failed:', pdfErr.message);
            }
        } else {
            console.log('[Webhook] ⚠️  No orderId in metadata');
        }
    }

    // Handle charge.succeeded (fallback for card payments)
    if (event.type === 'charge.succeeded') {
        const charge = event.data.object;
        const orderId = charge.metadata && charge.metadata.orderId;
        console.log('[Webhook] charge.succeeded - orderId:', orderId);
        console.log('[Webhook] Charge paid:', charge.paid);
        // Increment coupon usage when payment is completed
        if (orderId) {
            await incrementCouponUsage(orderId);

            // Generate and send PDF invoice
            try {
                const order = await Order.findById(orderId);
                if (order) {
                    const pdfBuffer = await generateOrderPDF(order);
                    await sendOrderWithPDF(order, pdfBuffer);
                    console.log('[Webhook] ✓ Order PDF sent successfully');
                }
            } catch (pdfErr) {
                console.error('[Webhook] ✗ PDF generation/send failed:', pdfErr.message);
            }
        } else {
            console.log('[Webhook] ⚠️  No orderId in metadata');
        }
    }

    console.log('[Webhook] ===== WEBHOOK PROCESSED =====\n');
    res.json({ received: true });
};

export const getStripeStatus = (req, res) => {
    const envKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_KEY || '';
    const configured = !!stripe && !!envKey;
    const preview = envKey ? `${envKey.slice(0, 8)}...${envKey.slice(-4)}` : null;
    return res.json({ configured, keyPreview: preview });
};

export default { createCheckoutSession, webhookHandler, getStripeStatus };

