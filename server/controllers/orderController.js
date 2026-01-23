import Order from '../models/Order.js';
import crypto from 'crypto';

// Get all orders (admin only)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('orderItems.product', 'name price image')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's orders
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('orderItems.product', 'name price image')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single order
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name price image');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization: user can only see their own orders
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new order
export const createOrder = async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalAmount, billingAddress } = req.body;

  try {
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // create deterministic-ish unique order id
    const orderId = `ORD-${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}`;

    const order = new Order({
      orderId,
      user: req.user.id,
      orderItems: orderItems.map((it) => ({
        name: it.name,
        qty: it.qty || it.quantity || 1,
        price: it.price,
        product: it.product || it._id || null,
        image: it.image,
        selectedVariants: it.selectedVariants || null,
        selectedSize: it.selectedSize || null,
        selectedColor: it.selectedColor || null,
        variantId: it.variantId || null,
      })),
      contactDetails: {
        firstName: shippingAddress?.firstName || '',
        lastName: shippingAddress?.lastName || '',
        email: shippingAddress?.email || '',
        phone: shippingAddress?.phone || '',
      },
      shippingAddress: {
        address: shippingAddress?.address || '',
        apartment: shippingAddress?.apartment || '',
        city: shippingAddress?.city || '',
        stateRegion: shippingAddress?.stateRegion || '',
        postalCode: shippingAddress?.postalCode || '',
        country: shippingAddress?.country || '',
      },
      billingAddress: billingAddress ? {
        address: billingAddress?.address || '',
        apartment: billingAddress?.apartment || '',
        city: billingAddress?.city || '',
        stateRegion: billingAddress?.stateRegion || '',
        postalCode: billingAddress?.postalCode || '',
        country: billingAddress?.country || '',
      } : null,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice: totalAmount,
      status: 'pending',
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status (admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'processing', 'shipped', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order payment status (admin only)
export const updateOrderPayment = async (req, res) => {
  try {
    const { isPaid, paidAt } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { isPaid, paidAt: isPaid ? paidAt || Date.now() : null },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order delivery status (admin only)
export const updateOrderDelivery = async (req, res) => {
  try {
    const { isDelivered, deliveredAt } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { isDelivered, deliveredAt: isDelivered ? deliveredAt || Date.now() : null },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete order (admin only)
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
