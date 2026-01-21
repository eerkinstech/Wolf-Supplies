import Stripe from 'stripe';
import Order from '../models/Order.js';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

// Accept both STRIPE_SECRET_KEY and STRIPE_KEY for backwards compatibility
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_KEY;
let stripe = null;
if (STRIPE_KEY) {
    stripe = new Stripe(STRIPE_KEY);
} else {
    console.warn('Stripe secret key not set. Stripe payment endpoints will return errors until STRIPE_SECRET_KEY is configured.');
}
// Base URL for building absolute image paths. Prefer server API URL if available.
const SERVER_BASE = process.env.SERVER_URL || process.env.VITE_API_URL || process.env.CLIENT_URL;

// Create an order and Stripe Checkout session
export const createCheckoutSession = async (req, res, next) => {
    try {
        if (!stripe) return res.status(500).json({ message: 'Stripe is not configured on the server. Set STRIPE_SECRET_KEY in environment.' });
        const user = req.user; // requires auth middleware
        if (!user) return res.status(401).json({ message: 'Not authorized' });

        const {
            orderItems,
            shippingAddress,
            billingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalAmount,
        } = req.body;

        if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        // Create order in DB with pending status
        const orderId = `ORD-${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}`;
        const order = new Order({
            orderId,
            user: user._id,
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
            shippingAddress: {
                address: shippingAddress.address,
                city: shippingAddress.city,
                postalCode: shippingAddress.postalCode || shippingAddress.postalCode || shippingAddress.postal || '',
                country: shippingAddress.country || 'UK',
            },
            billingAddress: billingAddress ? {
                address: billingAddress.address,
                city: billingAddress.city,
                postalCode: billingAddress.postalCode || '',
                country: billingAddress.country || 'UK',
            } : undefined,
            paymentMethod: paymentMethod || 'card',
            itemsPrice: itemsPrice || 0,
            taxPrice: taxPrice || 0,
            shippingPrice: shippingPrice || 0,
            totalPrice: totalAmount || itemsPrice || 0,
            status: 'pending',
        });

        await order.save();

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
        console.log('Stripe line_items:', JSON.stringify(line_items, null, 2));

        let session;
        try {
            session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'payment',
                line_items,
                success_url: `${SERVER_BASE.replace(/\/$/, '')}/order/${order._id}`,
                cancel_url: `${SERVER_BASE.replace(/\/$/, '')}/checkout?canceled=true`,
                metadata: { orderId: order._id.toString(), userId: user._id.toString() },
            });
        } catch (stripeErr) {
            // Return Stripe error details to client for debugging
            console.error('Stripe error creating session:', stripeErr.message || stripeErr);
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
        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Not authorized' });

        const { orderItems, shippingAddress, billingAddress, paymentMethod, itemsPrice, shippingPrice, totalAmount } = req.body;
        if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) return res.status(400).json({ message: 'No order items' });

        // create order in DB (pending)
        const orderId = `ORD-${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}`;
        const order = new Order({
            orderId,
            user: user._id,
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
            shippingAddress: {
                address: shippingAddress.address,
                city: shippingAddress.city,
                postalCode: shippingAddress.postalCode || '',
                country: shippingAddress.country || 'UK',
            },
            billingAddress: billingAddress ? {
                address: billingAddress.address,
                city: billingAddress.city,
                postalCode: billingAddress.postalCode || '',
                country: billingAddress.country || 'UK',
            } : undefined,
            paymentMethod: paymentMethod || 'card',
            itemsPrice: itemsPrice || 0,
            shippingPrice: shippingPrice || 0,
            totalPrice: totalAmount || itemsPrice || 0,
            status: 'pending',
        });

        await order.save();

        const amount = Math.round((totalAmount || itemsPrice || 0) * 100);

        // Create PaymentIntent
        const intent = await stripe.paymentIntents.create({
            amount,
            currency: 'gbp',
            metadata: { orderId: order._id.toString(), userId: user._id.toString() },
        });

        return res.json({ clientSecret: intent.client_secret, orderId: order._id });
    } catch (err) {
        console.error('createPaymentIntent error', err.message || err);
        return res.status(500).json({ error: err.message || 'PaymentIntent creation failed' });
    }
};

// Stripe webhook handler (expects raw body)
export const webhookHandler = async (req, res) => {
    if (!stripe) return res.status(500).send('Stripe not configured on server.');
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed.', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const orderId = session.metadata && session.metadata.orderId;
        try {
            if (orderId) {
                const order = await Order.findById(orderId);
                if (order) {
                    order.isPaid = true;
                    order.paidAt = new Date();
                    order.paymentResult = {
                        id: session.payment_intent || session.id,
                        status: 'paid',
                        update_time: new Date(),
                        email_address: session.customer_details ? session.customer_details.email : undefined,
                    };
                    order.status = 'paid';
                    await order.save();
                    console.log(`Order ${orderId} marked as paid via Stripe webhook.`);
                }
            }
        } catch (err) {
            console.error('Error updating order from webhook:', err);
        }
    }

    res.json({ received: true });
};

export const getStripeStatus = (req, res) => {
    const envKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_KEY || '';
    const configured = !!stripe && !!envKey;
    const preview = envKey ? `${envKey.slice(0, 8)}...${envKey.slice(-4)}` : null;
    return res.json({ configured, keyPreview: preview });
};

export default { createCheckoutSession, webhookHandler, getStripeStatus };
