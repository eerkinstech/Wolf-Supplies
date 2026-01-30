import mongoose from 'mongoose';
import Order from './models/Order.js';
import Product from './models/Product.js';

// Script to clean old order data - removes selectedVariants from non-variant products

async function cleanOldOrders() {
  try {
    const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/ecommerce';
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUrl);
    console.log('Connected!');

    // Get all orders
    const orders = await Order.find({});
    console.log(`Found ${orders.length} orders to check`);

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
                console.log(`Cleaning selectedVariants from non-variant product: ${item.name} (ID: ${item.product})`);
                order.orderItems[i].selectedVariants = null;
                order.orderItems[i].variant = null;
                hasChanges = true;
              }
            } catch (err) {
              console.error(`Error checking product ${item.product}:`, err.message);
            }
          }
        }
      }

      if (hasChanges) {
        await order.save();
        updatedCount++;
        console.log(`Updated order ${order.orderId}`);
      }
    }

    console.log(`\n=== Cleanup Complete ===`);
    console.log(`Total orders checked: ${orders.length}`);
    console.log(`Items with selectedVariants: ${checkCount}`);
    console.log(`Orders updated: ${updatedCount}`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}

cleanOldOrders();
