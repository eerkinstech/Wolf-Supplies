import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  name: String,
  qty: Number,
  price: Number,
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  image: String,
  variantImage: { type: String }, // Image of the selected variant
  selectedVariants: { type: Object },
  selectedSize: { type: String },
  selectedColor: { type: String },
  colorCode: { type: String }, // Hex color code for visual display
  variant: { type: String }, // Variant name/type
  sku: { type: String }, // Product SKU
  variantId: { type: String },
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true, index: true, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', sparse: true }, // Allow null for guest orders
  guestId: { type: String, sparse: true, index: true }, // UUID for guest tracking
  orderItems: [orderItemSchema],
  contactDetails: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
  },
  shippingAddress: {
    address: String,
    apartment: String,
    city: String,
    stateRegion: String,
    postalCode: String,
    country: String,
  },
  billingAddress: {
    address: String,
    apartment: String,
    city: String,
    stateRegion: String,
    postalCode: String,
    country: String,
  },
  paymentMethod: String,
  paymentResult: { type: Object },
  itemsPrice: Number,
  taxPrice: Number,
  shippingPrice: Number,
  totalPrice: Number,
  isPaid: { type: Boolean, default: false },
  paidAt: Date,
  isShipped: { type: Boolean, default: false }, // Track shipped status separately
  isDelivered: { type: Boolean, default: false },
  deliveredAt: Date,
  status: { type: String, default: 'pending' },
  remarks: { type: String, default: '' },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;
