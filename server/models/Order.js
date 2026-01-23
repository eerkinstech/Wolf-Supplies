import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  name: String,
  qty: Number,
  price: Number,
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  image: String,
  selectedVariants: { type: Object },
  selectedSize: { type: String },
  selectedColor: { type: String },
  variantId: { type: String },
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true, index: true, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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
  isDelivered: { type: Boolean, default: false },
  deliveredAt: Date,
  status: { type: String, default: 'pending' },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;
