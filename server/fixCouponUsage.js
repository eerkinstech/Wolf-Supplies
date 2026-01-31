import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order.js';
import Coupon from './models/Coupon.js';

dotenv.config();

const fixCouponUsage = async () => {
    try {
        const mongoUri = process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
        await mongoose.connect(mongoUri);
        console.log('✓ Connected to MongoDB');

        // Find all orders with coupon codes
        const ordersWithCoupons = await Order.find({
            couponCode: { $exists: true, $ne: null }
        });

        console.log(`\n✓ Found ${ordersWithCoupons.length} orders with coupons\n`);

        if (ordersWithCoupons.length === 0) {
            console.log('No orders with coupons found.');
            await mongoose.connection.close();
            return;
        }

        // Group orders by coupon code
        const couponMap = {};
        for (const order of ordersWithCoupons) {
            const code = order.couponCode.toUpperCase();
            if (!couponMap[code]) {
                couponMap[code] = [];
            }
            couponMap[code].push(order._id.toString());
        }

        console.log('Coupon Usage Summary:');
        console.log('====================');
        for (const [code, orderIds] of Object.entries(couponMap)) {
            console.log(`\n${code}: ${orderIds.length} orders`);
            for (const orderId of orderIds) {
                console.log(`  - ${orderId}`);
            }
        }

        // Update each coupon with correct usage count
        console.log('\n\nUpdating Coupon Usage Counters:');
        console.log('===============================');

        for (const [code, orderIds] of Object.entries(couponMap)) {
            const updateResult = await Coupon.findOneAndUpdate(
                { code: code },
                { currentUses: orderIds.length },
                { new: true }
            );

            if (updateResult) {
                console.log(`\n✓ ${code}`);
                console.log(`  Current Uses: ${updateResult.currentUses}/${updateResult.maxUses}`);
                console.log(`  Discount: £${updateResult.discountValue} (${updateResult.discountType})`);

                if (updateResult.currentUses >= updateResult.maxUses) {
                    console.log(`  ⚠️  USAGE LIMIT REACHED - Coupon should be expired`);
                }
            } else {
                console.log(`\n✗ ${code} - Coupon not found`);
            }
        }

        console.log('\n\n✓ Coupon usage correction completed!');
        await mongoose.connection.close();

    } catch (error) {
        console.error('✗ Error:', error.message);
        process.exit(1);
    }
};

fixCouponUsage();
