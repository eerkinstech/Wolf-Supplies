const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error('Email service error:', error);
  } else {
    console.log('Email service ready:', success ? 'Connected' : 'Failed');
  }
});

// Color scheme
const colors = {
  primary: '#a5632a',
  background: '#f5f5f5',
  cardBg: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  border: '#dddddd',
};

// SEND ORDER CONFIRMATION EMAIL TO CUSTOMER
// 
// Format: HTML email with professional layout
// Sent To: Customer email address (contactDetails.email)
// Sent When: Immediately after order creation (on checkout completion)
// Used By: paymentController.js - createCheckoutSession() & createPaymentIntent()
// 
// Contents:
// - Order confirmation with Order ID and date
// - Customer contact details (Name, Email, Phone)
// - Shipping and Billing addresses (2-column layout)
// - Complete itemized order with variants (Product, Size, Color, SKU, Qty, Price)
// - Order summary with breakdown (Subtotal, Shipping, Tax, Discount, Total)
// - Important banner with order keeping information
// - Company contact footer

const sendOrderConfirmationEmail = async (order) => {
  try {
    const {
      orderId,
      contactDetails,
      orderItems,
      shippingAddress,
      billingAddress,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      couponCode,
      discountAmount,
      fulfillmentStatus,
      deliveryStatus,
    } = order;

    // Color scheme for fulfillment statuses
    const fulfillmentColors = {
      unfulfilled: '#FFA500', // Orange - being processed
      fulfilled: '#4169E1',   // Blue - ready to ship
    };

    const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const itemsHTML = orderItems
      .map((item) => {
        const variants = [];
        if (item.selectedSize) variants.push(`Size: ${item.selectedSize}`);
        if (item.selectedColor) variants.push(`Color: ${item.selectedColor}`);
        if (item.selectedVariants && typeof item.selectedVariants === 'object') {
          Object.entries(item.selectedVariants).forEach(([k, v]) => {
            if (v) variants.push(`${k}: ${v}`);
          });
        }
        if (item.sku) variants.push(`SKU: ${item.sku}`);

        const variantText = variants.length > 0 ? variants.join(', ') : 'None';
        const itemTotal = (item.price * item.qty).toFixed(2);

        return `
          <tr>
            <td style="padding: 12px 10px; border-bottom: 1px solid ${colors.border}; font-weight: 600;">${item.name}</td>
            <td style="padding: 12px 10px; border-bottom: 1px solid ${colors.border}; font-size: 12px; color: ${colors.textLight};">${variantText}</td>
            <td style="padding: 12px 10px; border-bottom: 1px solid ${colors.border}; text-align: center;">${item.qty}</td>
            <td style="padding: 12px 10px; border-bottom: 1px solid ${colors.border}; text-align: right;">£${item.price.toFixed(2)}</td>
            <td style="padding: 12px 10px; border-bottom: 1px solid ${colors.border}; text-align: right; font-weight: 600;">£${itemTotal}</td>
          </tr>
        `;
      })
      .join('');

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: contactDetails.email,
      subject: `Order Confirmation - ${orderId}`,
      html: `
        <div style="font-family: 'Outfit', Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: ${colors.cardBg};">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid ${colors.primary}; padding-bottom: 20px; background-color: ${colors.cardBg}; padding: 40px 30px 20px;">
            <p style="font-size: 18px; color: ${colors.primary}; margin: 0 0 15px 0; font-weight: 700; letter-spacing: 1px;">🐺 WOLF SUPPLIES LTD</p>
            <h1 style="font-size: 32px; color: ${colors.text}; margin: 0 0 10px 0; font-weight: 700;">Order Confirmation</h1>
            <div style="display: flex; justify-content: center; gap: 30px; flex-wrap: wrap; font-size: 13px; color: ${colors.textLight};">
              <div><span style="font-weight: 600; color: ${colors.text};">Order ID:</span> ${orderId}</div>
              <div><span style="font-weight: 600; color: ${colors.text};">Date:</span> ${orderDate}</div>
            </div>
          </div>

          <!-- Content -->
          <div style="padding: 30px; background-color: ${colors.cardBg};">
            <!-- Important Banner -->
            <div style="background-color: ${colors.background}; border: 2px solid ${colors.primary}; border-left: 5px solid ${colors.primary}; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
              <h3 style="font-size: 14px; color: ${colors.primary}; margin-bottom: 8px; font-weight: 700;">📌 Keep This For Your Records</h3>
              <p style="font-size: 13px; color: ${colors.text}; margin: 5px 0; font-weight: 500;"><strong>Order ID: ${orderId}</strong></p>
              <p style="font-size: 13px; color: ${colors.text}; margin: 5px 0;">Thank you for your order! We've received it and are processing it now.</p>
            </div>

            <!-- Contact Details -->
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 16px; font-weight: 700; color: ${colors.text}; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid ${colors.primary};">Contact Details</h2>
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                <div style="background-color: ${colors.background}; border: 1px solid ${colors.border}; padding: 12px; border-radius: 4px;">
                  <div style="font-size: 11px; font-weight: 600; color: ${colors.textLight}; margin-bottom: 4px; text-transform: uppercase;">First Name</div>
                  <div style="font-size: 13px; color: ${colors.text}; font-weight: 500;">${contactDetails.firstName}</div>
                </div>
                <div style="background-color: ${colors.background}; border: 1px solid ${colors.border}; padding: 12px; border-radius: 4px;">
                  <div style="font-size: 11px; font-weight: 600; color: ${colors.textLight}; margin-bottom: 4px; text-transform: uppercase;">Last Name</div>
                  <div style="font-size: 13px; color: ${colors.text}; font-weight: 500;">${contactDetails.lastName}</div>
                </div>
                <div style="background-color: ${colors.background}; border: 1px solid ${colors.border}; padding: 12px; border-radius: 4px;">
                  <div style="font-size: 11px; font-weight: 600; color: ${colors.textLight}; margin-bottom: 4px; text-transform: uppercase;">Email</div>
                  <div style="font-size: 13px; color: ${colors.text}; font-weight: 500;">${contactDetails.email}</div>
                </div>
                <div style="background-color: ${colors.background}; border: 1px solid ${colors.border}; padding: 12px; border-radius: 4px;">
                  <div style="font-size: 11px; font-weight: 600; color: ${colors.textLight}; margin-bottom: 4px; text-transform: uppercase;">Phone</div>
                  <div style="font-size: 13px; color: ${colors.text}; font-weight: 500;">${contactDetails.phone}</div>
                </div>
              </div>
            </div>

            <!-- Shipping Address -->
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 16px; font-weight: 700; color: ${colors.text}; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid ${colors.primary};">Delivery Information</h2>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="background-color: ${colors.background}; border: 1px solid ${colors.border}; padding: 15px; border-radius: 4px;">
                  <div style="font-size: 14px; font-weight: 700; color: ${colors.text}; margin-bottom: 12px;">📦 Shipping Address</div>
                  <p style="font-size: 13px; color: ${colors.text}; line-height: 1.6; margin: 0;">
                    <strong>${shippingAddress.address}</strong><br/>
                    ${shippingAddress.apartment ? shippingAddress.apartment + '<br/>' : ''}
                    ${shippingAddress.city}, ${shippingAddress.stateRegion} ${shippingAddress.postalCode}<br/>
                    ${shippingAddress.country}
                  </p>
                </div>
                <div style="background-color: ${colors.background}; border: 1px solid ${colors.border}; padding: 15px; border-radius: 4px;">
                  <div style="font-size: 14px; font-weight: 700; color: ${colors.text}; margin-bottom: 12px;">💳 Billing Address</div>
                  ${billingAddress && billingAddress.address ? `
                  <p style="font-size: 13px; color: ${colors.text}; line-height: 1.6; margin: 0;">
                    <strong>${billingAddress.address}</strong><br/>
                    ${billingAddress.apartment ? billingAddress.apartment + '<br/>' : ''}
                    ${billingAddress.city}, ${billingAddress.stateRegion} ${billingAddress.postalCode}<br/>
                    ${billingAddress.country}
                  </p>
                  ` : `
                  <p style="font-size: 13px; color: ${colors.textLight}; line-height: 1.6; margin: 0;">Same as shipping address</p>
                  `}
                </div>
              </div>
            </div>

            <!-- Order Items -->
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 16px; font-weight: 700; color: ${colors.text}; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid ${colors.primary};">Order Items</h2>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                  <tr style="background-color: ${colors.background}; border-bottom: 2px solid ${colors.primary};">
                    <th style="padding: 12px 10px; text-align: left; font-weight: 700; color: ${colors.text};">Product</th>
                    <th style="padding: 12px 10px; text-align: left; font-weight: 700; color: ${colors.text};">Variants</th>
                    <th style="padding: 12px 10px; text-align: center; font-weight: 700; color: ${colors.text};">Qty</th>
                    <th style="padding: 12px 10px; text-align: right; font-weight: 700; color: ${colors.text};">Price</th>
                    <th style="padding: 12px 10px; text-align: right; font-weight: 700; color: ${colors.text};">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                </tbody>
              </table>
            </div>

            <!-- Order Summary -->
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 16px; font-weight: 700; color: ${colors.text}; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid ${colors.primary};">Order Summary</h2>
              <div style="background-color: ${colors.background}; border: 1px solid ${colors.border}; padding: 20px; border-radius: 4px;">
                <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 13px; border-bottom: 1px solid ${colors.border};">
                  <span>Items Total:</span>
                  <span>£${itemsPrice.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 13px; border-bottom: 1px solid ${colors.border};">
                  <span>Shipping Cost:</span>
                  <span>£${shippingPrice.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 13px; border-bottom: 1px solid ${colors.border};">
                  <span>Tax:</span>
                  <span>£${taxPrice.toFixed(2)}</span>
                </div>
                ${discountAmount > 0 ? `
                <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 13px; border-bottom: 1px solid ${colors.border}; color: #10b981; font-weight: bold;">
                  <span>Discount (${couponCode}):</span>
                  <span>-£${discountAmount.toFixed(2)}</span>
                </div>
                ` : ''}
                <div style="display: flex; justify-content: space-between; padding: 15px; margin: 0 -20px -20px -20px; background-color: ${colors.primary}; color: white; border-radius: 0 0 4px 4px; font-weight: 700; font-size: 14px;">
                  <span>Grand Total:</span>
                  <span>£${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <!-- Order Status Section -->
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 16px; font-weight: 700; color: ${colors.text}; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid ${colors.primary};">Order Status</h2>
              <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <span style="display: inline-block; padding: 8px 15px; border-radius: 20px; font-size: 12px; font-weight: 600; background-color: ${fulfillmentColors[fulfillmentStatus]}; color: white;">
                  ${fulfillmentStatus === 'fulfilled' ? '✅ FULFILLED' : '⏳ UNFULFILLED'}
                </span>
                ${deliveryStatus === 'delivered' ? `<span style="display: inline-block; padding: 8px 15px; border-radius: 20px; font-size: 12px; font-weight: 600; background-color: #d4edda; color: #155724;">✓ Delivered</span>` : ''}
                ${deliveryStatus === 'shipped' ? `<span style="display: inline-block; padding: 8px 15px; border-radius: 20px; font-size: 12px; font-weight: 600; background-color: #fff3cd; color: #856404;">📦 Shipped</span>` : ''}
                ${deliveryStatus === 'refunded' ? `<span style="display: inline-block; padding: 8px 15px; border-radius: 20px; font-size: 12px; font-weight: 600; background-color: #f8d7da; color: #721c24;">⚠️ Refunded</span>` : ''}
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="padding: 20px 30px; background-color: ${colors.background}; border-top: 1px solid ${colors.border}; text-align: center; font-size: 13px; color: ${colors.textLight};">
            <p style="margin: 5px 0;"><strong>Thank you for your order!</strong></p>
            <p style="margin: 5px 0;">For any questions, contact us at <strong>${process.env.SUPPORT_EMAIL || 'support@wolfsupplies.com'}</strong></p>
            <p style="margin: 5px 0; font-size: 11px;">© Wolf Supplies LTD. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✓ Order confirmation email sent to ${contactDetails.email}`);
    return true;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return false;
  }
};

// SEND ORDER NOTIFICATION EMAIL TO ADMIN
// 
// Format: HTML email with professional layout
// Sent To: Admin email address (ADMIN_EMAIL environment variable)
// Sent When: Immediately after order creation (on checkout completion)
// Used By: paymentController.js - createCheckoutSession() & createPaymentIntent()
// 
// Contents:
// - New order alert with Order ID and date
// - Customer information (Name, Email, Phone, Payment Method)
// - Shipping and Billing addresses (2-column layout - Ship To / Bill To)
// - Complete itemized order with variants (Product, Variants, Qty, Price, Total)
// - Order summary with totals (Items, Shipping, Tax, Grand Total)
// - Call-to-action to log into admin panel
// - Company footer

const sendOrderNotificationToAdmin = async (order) => {
  try {
    const {
      orderId,
      contactDetails,
      orderItems,
      shippingAddress,
      billingAddress,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paymentMethod,
    } = order;

    const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const itemsHTML = orderItems
      .map((item) => {
        const variants = [];
        if (item.selectedSize) variants.push(`Size: ${item.selectedSize}`);
        if (item.selectedColor) variants.push(`Color: ${item.selectedColor}`);
        if (item.selectedVariants && typeof item.selectedVariants === 'object') {
          Object.entries(item.selectedVariants).forEach(([k, v]) => {
            if (v) variants.push(`${k}: ${v}`);
          });
        }
        if (item.sku) variants.push(`SKU: ${item.sku}`);

        const variantText = variants.length > 0 ? variants.join(', ') : 'None';
        const itemTotal = (item.price * item.qty).toFixed(2);
        return `
          <tr>
            <td style="padding: 12px 10px; border-bottom: 1px solid ${colors.border}; font-weight: 600;">${item.name}</td>
            <td style="padding: 12px 10px; border-bottom: 1px solid ${colors.border}; font-size: 12px; color: ${colors.textLight};">${variantText}</td>
            <td style="padding: 12px 10px; border-bottom: 1px solid ${colors.border}; text-align: center;">${item.qty}</td>
            <td style="padding: 12px 10px; border-bottom: 1px solid ${colors.border}; text-align: right;">£${item.price.toFixed(2)}</td>
            <td style="padding: 12px 10px; border-bottom: 1px solid ${colors.border}; text-align: right; font-weight: 600;">£${itemTotal}</td>
          </tr>
        `;
      })
      .join('');

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `🎉 New Order Received - ${orderId}`,
      html: `
        <div style="font-family: 'Outfit', Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: ${colors.cardBg};">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid ${colors.primary}; padding: 40px 30px 20px; background-color: ${colors.cardBg};">
            <p style="font-size: 18px; color: ${colors.primary}; margin: 0 0 15px 0; font-weight: 700; letter-spacing: 1px;">🐺 WOLF SUPPLIES LTD</p>
            <h1 style="font-size: 32px; color: ${colors.text}; margin: 0 0 10px 0; font-weight: 700;">🎉 New Order Received!</h1>
            <div style="display: flex; justify-content: center; gap: 30px; flex-wrap: wrap; font-size: 13px; color: ${colors.textLight};">
              <div><span style="font-weight: 600; color: ${colors.text};">Order ID:</span> ${orderId}</div>
              <div><span style="font-weight: 600; color: ${colors.text};">Date:</span> ${orderDate}</div>
            </div>
          </div>

          <!-- Content -->
          <div style="padding: 30px; background-color: ${colors.cardBg};">
            <!-- Customer Info -->
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 16px; font-weight: 700; color: ${colors.text}; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid ${colors.primary};">Customer Information</h2>
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                <div style="background-color: ${colors.background}; border: 1px solid ${colors.border}; padding: 12px; border-radius: 4px;">
                  <div style="font-size: 11px; font-weight: 600; color: ${colors.textLight}; margin-bottom: 4px; text-transform: uppercase;">Name</div>
                  <div style="font-size: 13px; color: ${colors.text}; font-weight: 500;">${contactDetails.firstName} ${contactDetails.lastName}</div>
                </div>
                <div style="background-color: ${colors.background}; border: 1px solid ${colors.border}; padding: 12px; border-radius: 4px;">
                  <div style="font-size: 11px; font-weight: 600; color: ${colors.textLight}; margin-bottom: 4px; text-transform: uppercase;">Email</div>
                  <div style="font-size: 13px; color: ${colors.text}; font-weight: 500;">${contactDetails.email}</div>
                </div>
                <div style="background-color: ${colors.background}; border: 1px solid ${colors.border}; padding: 12px; border-radius: 4px;">
                  <div style="font-size: 11px; font-weight: 600; color: ${colors.textLight}; margin-bottom: 4px; text-transform: uppercase;">Phone</div>
                  <div style="font-size: 13px; color: ${colors.text}; font-weight: 500;">${contactDetails.phone}</div>
                </div>
                <div style="background-color: ${colors.background}; border: 1px solid ${colors.border}; padding: 12px; border-radius: 4px;">
                  <div style="font-size: 11px; font-weight: 600; color: ${colors.textLight}; margin-bottom: 4px; text-transform: uppercase;">Payment Method</div>
                  <div style="font-size: 13px; color: ${colors.text}; font-weight: 500;">${paymentMethod}</div>
                </div>
              </div>
            </div>

            <!-- Shipping Address -->
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 16px; font-weight: 700; color: ${colors.text}; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid ${colors.primary};">Shipping Address</h2>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="background-color: ${colors.background}; border: 1px solid ${colors.border}; padding: 15px; border-radius: 4px;">
                  <div style="font-size: 14px; font-weight: 700; color: ${colors.text}; margin-bottom: 12px;">📦 Ship To</div>
                  <p style="font-size: 13px; color: ${colors.text}; line-height: 1.6; margin: 0;">
                    <strong>${shippingAddress.address}</strong><br/>
                    ${shippingAddress.apartment ? shippingAddress.apartment + '<br/>' : ''}
                    ${shippingAddress.city}, ${shippingAddress.stateRegion} ${shippingAddress.postalCode}<br/>
                    ${shippingAddress.country}
                  </p>
                </div>
                <div style="background-color: ${colors.background}; border: 1px solid ${colors.border}; padding: 15px; border-radius: 4px;">
                  <div style="font-size: 14px; font-weight: 700; color: ${colors.text}; margin-bottom: 12px;">💳 Bill To</div>
                  ${billingAddress && billingAddress.address ? `
                  <p style="font-size: 13px; color: ${colors.text}; line-height: 1.6; margin: 0;">
                    <strong>${billingAddress.address}</strong><br/>
                    ${billingAddress.apartment ? billingAddress.apartment + '<br/>' : ''}
                    ${billingAddress.city}, ${billingAddress.stateRegion} ${billingAddress.postalCode}<br/>
                    ${billingAddress.country}
                  </p>
                  ` : `
                  <p style="font-size: 13px; color: ${colors.textLight}; line-height: 1.6; margin: 0;">Same as shipping address</p>
                  `}
                </div>
              </div>
            </div>

            <!-- Order Items -->
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 16px; font-weight: 700; color: ${colors.text}; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid ${colors.primary};">Order Items</h2>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                  <tr style="background-color: ${colors.background}; border-bottom: 2px solid ${colors.primary};">
                    <th style="padding: 12px 10px; text-align: left; font-weight: 700; color: ${colors.text};">Product</th>
                    <th style="padding: 12px 10px; text-align: left; font-weight: 700; color: ${colors.text};">Variants</th>
                    <th style="padding: 12px 10px; text-align: center; font-weight: 700; color: ${colors.text};">Qty</th>
                    <th style="padding: 12px 10px; text-align: right; font-weight: 700; color: ${colors.text};">Price</th>
                    <th style="padding: 12px 10px; text-align: right; font-weight: 700; color: ${colors.text};">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                </tbody>
              </table>
            </div>

            <!-- Order Summary -->
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 16px; font-weight: 700; color: ${colors.text}; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid ${colors.primary};">Order Summary</h2>
              <div style="background-color: ${colors.background}; border: 1px solid ${colors.border}; padding: 20px; border-radius: 4px;">
                <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 13px; border-bottom: 1px solid ${colors.border};">
                  <span>Items Total:</span>
                  <span>£${itemsPrice.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 13px; border-bottom: 1px solid ${colors.border};">
                  <span>Shipping:</span>
                  <span>£${shippingPrice.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 13px; border-bottom: 1px solid ${colors.border};">
                  <span>Tax:</span>
                  <span>£${taxPrice.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 15px; margin: 0 -20px -20px -20px; background-color: ${colors.primary}; color: white; border-radius: 0 0 4px 4px; font-weight: 700; font-size: 14px;">
                  <span>Grand Total:</span>
                  <span>£${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="padding: 20px 30px; background-color: ${colors.background}; border-top: 1px solid ${colors.border}; text-align: center; font-size: 13px; color: ${colors.textLight};">
            <p style="margin: 5px 0;">Log into your admin panel to process this order.</p>
            <p style="margin: 5px 0; font-size: 11px;">© Wolf Supplies LTD</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✓ Order notification email sent to admin`);
    return true;
  } catch (error) {
    console.error('Error sending order notification to admin:', error);
    return false;
  }
};

// SEND ORDER STATUS UPDATE EMAIL TO CUSTOMER
// 
// Format: HTML email with status-colored header
// Sent To: Customer email address (contactDetails.email)
// Sent When: Whenever order status is changed by admin (fulfillment or delivery)
// Used By: orderController.js - updateOrderStatus(), updateOrderDelivery(), updateOrderRefund(), updateOrderFulfillment()
// 
// Contents:
// - Status update banner with color-coded background
// - Current order status section showing BOTH fulfillment and delivery status
// - Order summary cards (Order ID, Total Amount, Number of Items)
// - List of items in the order (Product names with quantities)
// - Meaningful status descriptions explaining what each status means
// - Call-to-action with support contact information
// - Company footer

const sendOrderStatusUpdateEmail = async (order, newStatus) => {
  try {
    const { orderId, contactDetails, orderItems, totalPrice, fulfillmentStatus, deliveryStatus } = order;

    // Fulfillment status messages - what admin is doing with the order
    const fulfillmentMessages = {
      unfulfilled: 'Your order has been received by our team and is being verified. We are checking inventory and preparing your items for shipment.',
      fulfilled: 'Your order has been verified and packed by our team. It is ready to be shipped out soon!',
    };

    // Delivery status messages - where the order is in shipping
    const deliveryMessages = {
      '': 'Your order is awaiting shipment. We will send it out very soon!',
      shipped: 'Great news! Your order has been shipped and is on its way to you. You will receive it within the estimated delivery period.',
      delivered: 'Your order has been delivered! Please check your package. Thank you for shopping with us!',
      refunded: 'Your order has been refunded. The refund amount will appear in your account within 5-7 business days.',
    };

    // Color scheme for different statuses
    const fulfillmentColors = {
      unfulfilled: '#FFA500', // Orange - being processed
      fulfilled: '#4169E1',   // Blue - ready to ship
    };

    const deliveryColors = {
      '': '#9CA3AF',           // Gray - awaiting shipment
      shipped: '#F59E0B',      // Amber - in transit
      delivered: '#10B981',    // Green - delivered
      refunded: '#EF4444',     // Red - refunded
    };

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: contactDetails.email,
      subject: `Order Status Update - ${orderId}`,
      html: `
        <div style="font-family: 'Outfit', Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: ${colors.cardBg};">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid ${colors.primary}; padding: 40px 30px 20px; background-color: ${colors.cardBg};">
            <p style="font-size: 18px; color: ${colors.primary}; margin: 0 0 15px 0; font-weight: 700; letter-spacing: 1px;">🐺 WOLF SUPPLIES LTD</p>
            <h1 style="font-size: 32px; color: ${colors.text}; margin: 0 0 10px 0; font-weight: 700;">Order Status Update</h1>
            <div style="display: flex; justify-content: center; gap: 30px; flex-wrap: wrap; font-size: 13px; color: ${colors.textLight};">
              <div><span style="font-weight: 600; color: ${colors.text};">Order ID:</span> ${orderId}</div>
            </div>
          </div>

          <!-- Content -->
          <div style="padding: 30px; background-color: ${colors.cardBg};">
            <!-- Current Status Section - BOTH STATUSES TOGETHER -->
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 16px; font-weight: 700; color: ${colors.text}; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid ${colors.primary};">Current Order Status</h2>
              
              <!-- Fulfillment Status Card -->
              <div style="background-color: ${colors.background}; border: 2px solid ${fulfillmentColors[fulfillmentStatus]}; border-left: 5px solid ${fulfillmentColors[fulfillmentStatus]}; padding: 15px; border-radius: 4px; margin-bottom: 15px;">
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                  <span style="display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background-color: ${fulfillmentColors[fulfillmentStatus]}; color: white; margin-right: 10px;">
                    ${fulfillmentStatus === 'fulfilled' ? '✅ FULFILLED' : '⏳ UNFULFILLED'}
                  </span>
                  <span style="font-size: 12px; font-weight: 600; color: ${colors.textLight}; text-transform: uppercase;">FULFILLMENT STATUS</span>
                </div>
                <p style="margin: 0; font-size: 13px; color: ${colors.text}; line-height: 1.6;">
                  ${fulfillmentMessages[fulfillmentStatus]}
                </p>
              </div>

              <!-- Delivery Status Card -->
              <div style="background-color: ${colors.background}; border: 2px solid ${deliveryColors[deliveryStatus]}; border-left: 5px solid ${deliveryColors[deliveryStatus]}; padding: 15px; border-radius: 4px;">
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                  <span style="display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background-color: ${deliveryColors[deliveryStatus]}; color: white; margin-right: 10px;">
                    ${deliveryStatus === 'shipped' ? '📦 SHIPPED' : deliveryStatus === 'delivered' ? '✓ DELIVERED' : deliveryStatus === 'refunded' ? '⚠️ REFUNDED' : '⏳ AWAITING SHIPMENT'}
                  </span>
                  <span style="font-size: 12px; font-weight: 600; color: ${colors.textLight}; text-transform: uppercase;">Delivery Status</span>
                </div>
                <p style="margin: 0; font-size: 13px; color: ${colors.text}; line-height: 1.6;">
                  ${deliveryMessages[deliveryStatus]}
                </p>
              </div>
            </div>

            <!-- Order Summary -->
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 16px; font-weight: 700; color: ${colors.text}; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid ${colors.primary};">Order Summary</h2>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                <div style="background-color: ${colors.background}; border: 1px solid ${colors.border}; padding: 15px; border-radius: 4px; text-align: center;">
                  <div style="font-size: 11px; font-weight: 600; color: ${colors.textLight}; margin-bottom: 8px; text-transform: uppercase;">Order ID</div>
                  <div style="font-size: 14px; color: ${colors.text}; font-weight: 700;">${orderId}</div>
                </div>
                <div style="background-color: ${colors.background}; border: 1px solid ${colors.border}; padding: 15px; border-radius: 4px; text-align: center;">
                  <div style="font-size: 11px; font-weight: 600; color: ${colors.textLight}; margin-bottom: 8px; text-transform: uppercase;">Total Amount</div>
                  <div style="font-size: 14px; color: ${colors.text}; font-weight: 700;">£${totalPrice.toFixed(2)}</div>
                </div>
                <div style="background-color: ${colors.background}; border: 1px solid ${colors.border}; padding: 15px; border-radius: 4px; text-align: center;">
                  <div style="font-size: 11px; font-weight: 600; color: ${colors.textLight}; margin-bottom: 8px; text-transform: uppercase;">Items</div>
                  <div style="font-size: 14px; color: ${colors.text}; font-weight: 700;">${orderItems.length}</div>
                </div>
              </div>
            </div>

            <!-- Items List -->
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 16px; font-weight: 700; color: ${colors.text}; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid ${colors.primary};">Items in This Order</h2>
              <ul style="color: ${colors.text}; margin: 0; padding-left: 20px;">
                ${orderItems.map((item) => `<li style="margin: 8px 0; font-size: 13px;"><strong>${item.name}</strong> (Qty: ${item.qty})</li>`).join('')}
              </ul>
            </div>
          </div>

          <!-- Footer -->
          <div style="padding: 20px 30px; background-color: ${colors.background}; border-top: 1px solid ${colors.border}; text-align: center; font-size: 13px; color: ${colors.textLight};">
            <p style="margin: 5px 0;">If you have any questions, contact us at <strong>${process.env.SUPPORT_EMAIL || 'support@wolfsupplies.com'}</strong></p>
            <p style="margin: 5px 0;">Thank you for shopping with Wolf Supplies LTD!</p>
            <p style="margin: 5px 0; font-size: 11px;">© Wolf Supplies LTD. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✓ Order status update email sent to ${contactDetails.email} - Fulfillment: ${fulfillmentStatus}, Delivery: ${deliveryStatus}`);
    return true;
  } catch (error) {
    console.error('Error sending order status update email:', error);
    return false;
  }
};

// SEND ORDER INVOICE WITH PDF ATTACHMENT
// 
// Format: HTML email with PDF invoice attachment
// Sent To: Customer email address (contactDetails.email)
// Sent When: After successful payment (on payment completion via Stripe webhook)
// Used By: paymentController.js - webhookHandler() for payment_intent.succeeded events
//          Also used by: orderController.js - resendOrderPDF() for manual admin resend
// 
// Contents:
// - Professional order invoice header
// - Personal greeting to customer
// - PDF attachment notification with file name (Invoice_[OrderID].pdf)
// - Support contact information
// - Company footer
// 
// Attachment Details:
// - PDF filename: Invoice_[OrderID].pdf
// - PDF content: Generated by pdfGenerator.js using Puppeteer
// - PDF layout: Matches OrderDetailPage.jsx design with professional styling
// - PDF includes: Order details, contact info, shipping/billing addresses, itemized list, totals, status
// 
// Note: PDF is generated server-side and attached as buffer (not as URL/link)

const sendOrderWithPDF = async (order, pdfBuffer) => {
  try {
    const { contactDetails, orderId, fulfillmentStatus, deliveryStatus } = order;

    // Color scheme for fulfillment statuses
    const fulfillmentColors = {
      unfulfilled: '#FFA500', // Orange - being processed
      fulfilled: '#4169E1',   // Blue - ready to ship
    };

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: contactDetails.email,
      subject: `Order Invoice - ${orderId}`,
      html: `
        <div style="font-family: 'Outfit', Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: ${colors.cardBg};">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid ${colors.primary}; padding: 40px 30px 20px; background-color: ${colors.cardBg};">
            <p style="font-size: 18px; color: ${colors.primary}; margin: 0 0 15px 0; font-weight: 700; letter-spacing: 1px;">🐺 WOLF SUPPLIES LTD</p>
            <h1 style="font-size: 32px; color: ${colors.text}; margin: 0 0 10px 0; font-weight: 700;">Order Invoice</h1>
            <p style="margin: 10px 0 0 0; font-size: 13px; color: ${colors.textLight};">Order ID: <strong>${orderId}</strong></p>
          </div>

          <!-- Content -->
          <div style="padding: 30px; background-color: ${colors.cardBg};">
            <p style="font-size: 14px; color: ${colors.text}; margin: 0 0 15px 0;">Dear ${contactDetails.firstName},</p>
            <p style="font-size: 14px; color: ${colors.text}; margin: 0 0 20px 0;">Your order invoice is attached to this email. Please keep it for your records.</p>
            
            <div style="background-color: ${colors.background}; border: 2px solid ${colors.primary}; border-left: 5px solid ${colors.primary}; padding: 15px; border-radius: 4px;">
              <p style="margin: 0; font-size: 13px; color: ${colors.text}; font-weight: 500;">✓ Invoice PDF attached: <strong>Invoice_${orderId}.pdf</strong></p>
            </div>

            <!-- Order Status Section -->
            <div style="margin-top: 20px;">
              <h2 style="font-size: 14px; font-weight: 700; color: ${colors.text}; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 2px solid ${colors.primary};">Current Status</h2>
              <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <span style="display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; background-color: ${fulfillmentColors[fulfillmentStatus]}; color: white;">
                  ${fulfillmentStatus === 'fulfilled' ? '✅ FULFILLED' : '⏳ UNFULFILLED'}
                </span>
                ${deliveryStatus === 'delivered' ? `<span style="display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; background-color: #d4edda; color: #155724;">✓ Delivered</span>` : ''}
                ${deliveryStatus === 'shipped' ? `<span style="display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; background-color: #fff3cd; color: #856404;">📦 Shipped</span>` : ''}
                ${deliveryStatus === 'refunded' ? `<span style="display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; background-color: #f8d7da; color: #721c24;">⚠️ Refunded</span>` : ''}
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="padding: 20px 30px; background-color: ${colors.background}; border-top: 1px solid ${colors.border}; text-align: center; font-size: 13px; color: ${colors.textLight};">
            <p style="margin: 5px 0;">If you have any questions, contact us at <strong>${process.env.SUPPORT_EMAIL || 'support@wolfsupplies.com'}</strong></p>
            <p style="margin: 5px 0; font-size: 11px;">© Wolf Supplies LTD. All rights reserved.</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `Invoice_${orderId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log(`✓ Order invoice PDF sent to ${contactDetails.email}`);
    return true;
  } catch (error) {
    console.error('Error sending order PDF email:', error);
    return false;
  }
};

module.exports = {
  sendOrderConfirmationEmail,
  sendOrderNotificationToAdmin,
  sendOrderStatusUpdateEmail,
  sendOrderWithPDF,
};
