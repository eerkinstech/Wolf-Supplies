import mongoose from 'mongoose';
import Order from './models/Order.js';
import Product from './models/Product.js';

// Script to clean old order data - removes selectedVariants from non-variant products

async function cleanOldOrders() {
  try {
    const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/ecommerce';

    await mongoose.connect(mongoUrl);

    // Get all orders
    const orders = await Order.find({});

    let updatedCount = 0;
    let checkCount = 0;

    for (const order of orders) {
      let hasChanges = false;

      for (let i = 0; i < order.orderItems.length; i++) {
        const item = order.orderItems[i];
        
        if (item.selectedVariants) {
          checkCount++;
          
          // Check if this product actually has variants
          if (item.product) {
            try {
              const product = await Product.findById(item.product).select('variants');
              
              if (!product || !product.variants || product.variants.length === 0) {

                order.orderItems[i].selectedVariants = null;
                order.orderItems[i].variant = null;
                hasChanges = true;
              }
            } catch (err) {

            }
          }
        }
      }

      if (hasChanges) {
        await order.save();
        updatedCount++;

      }
    }

    await mongoose.disconnect();

  } catch (error) {

    process.exit(1);
  }
}

cleanOldOrders();

