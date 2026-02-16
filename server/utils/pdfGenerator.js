const puppeteer = require('puppeteer');

// Generate order invoice PDF matching frontend design
const generateOrderPDF = async (order) => {
    try {
        const orderId = order.orderId || `ORD-${order._id}`;
        const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Format order items for display
        const itemsHTML = order.orderItems?.map(item => {
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
            const itemTotal = (item.price || 0) * (item.qty || 1);

            return `
                <tr>
                    <td><strong>${item.name}</strong></td>
                    <td style="font-size: 12px; color: #666666;">${variantText}</td>
                    <td style="text-align: center;">${item.qty || 1}</td>
                    <td style="text-align: right;">£${(item.price || 0).toFixed(2)}</td>
                    <td style="text-align: right;"><strong>£${itemTotal.toFixed(2)}</strong></td>
                </tr>
            `;
        }).join('') || '';

        // Create HTML content matching OrderDetailPage design
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body {
                        font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                        background-color: #f5f5f5;
                        color: #333333;
                        line-height: 1.6;
                    }
                    .container {
                        max-width: 900px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        padding: 40px 30px;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 40px;
                        border-bottom: 3px solid #a5632a;
                        padding-bottom: 20px;
                    }
                    .header h1 {
                        font-size: 32px;
                        color: #333333;
                        margin-bottom: 10px;
                        font-weight: 700;
                    }
                    .order-info {
                        display: flex;
                        justify-content: center;
                        gap: 30px;
                        flex-wrap: wrap;
                        font-size: 13px;
                        color: #666666;
                        margin-top: 10px;
                    }
                    .order-info-label {
                        font-weight: 600;
                        color: #333333;
                    }
                    .important-banner {
                        background-color: #f5f5f5;
                        border: 2px solid #a5632a;
                        border-left: 5px solid #a5632a;
                        padding: 20px;
                        margin-bottom: 30px;
                        border-radius: 4px;
                    }
                    .important-banner h3 {
                        font-size: 14px;
                        color: #a5632a;
                        margin-bottom: 8px;
                        font-weight: 700;
                    }
                    .important-banner p {
                        font-size: 13px;
                        color: #333333;
                        margin: 5px 0;
                        font-weight: 500;
                    }
                    .section {
                        margin-bottom: 30px;
                    }
                    .section-title {
                        font-size: 16px;
                        font-weight: 700;
                        color: #333333;
                        margin-bottom: 15px;
                        padding-bottom: 10px;
                        border-bottom: 2px solid #a5632a;
                    }
                    .grid-2 {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 20px;
                        margin-bottom: 20px;
                    }
                    .grid-4 {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 10px;
                        margin-bottom: 20px;
                    }
                    .info-card {
                        background-color: #f5f5f5;
                        border: 1px solid #dddddd;
                        padding: 15px;
                        border-radius: 4px;
                    }
                    .info-card-title {
                        margin-bottom: 12px;
                        font-size: 14px;
                        font-weight: 700;
                        color: #333333;
                    }
                    .info-card p {
                        font-size: 13px;
                        color: #333333;
                        line-height: 1.5;
                    }
                    .contact-field {
                        background-color: #f5f5f5;
                        border: 1px solid #dddddd;
                        padding: 10px;
                        border-radius: 4px;
                    }
                    .contact-field-label {
                        font-size: 11px;
                        font-weight: 600;
                        color: #666666;
                        margin-bottom: 4px;
                        text-transform: uppercase;
                    }
                    .contact-field-value {
                        font-size: 13px;
                        color: #333333;
                        font-weight: 500;
                    }
                    .items-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 15px;
                        font-size: 13px;
                    }
                    .items-table thead {
                        background-color: #f5f5f5;
                        border-bottom: 2px solid #a5632a;
                    }
                    .items-table th {
                        padding: 12px 10px;
                        text-align: left;
                        font-weight: 700;
                        color: #333333;
                    }
                    .items-table td {
                        padding: 12px 10px;
                        border-bottom: 1px solid #dddddd;
                    }
                    .items-table tr:last-child td {
                        border-bottom: none;
                    }
                    .totals-section {
                        background-color: #f5f5f5;
                        border: 1px solid #dddddd;
                        padding: 20px;
                        border-radius: 4px;
                        margin-top: 20px;
                    }
                    .total-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 10px 0;
                        font-size: 13px;
                        border-bottom: 1px solid #dddddd;
                    }
                    .total-row:last-child {
                        border-bottom: none;
                    }
                    .total-row.grand-total {
                        background-color: #a5632a;
                        color: white;
                        padding: 15px;
                        margin: 0 -20px -20px -20px;
                        padding-left: 20px;
                        padding-right: 20px;
                        border-radius: 0 0 4px 4px;
                        font-weight: 700;
                        font-size: 14px;
                    }
                    .badges {
                        display: flex;
                        gap: 10px;
                        flex-wrap: wrap;
                        margin-top: 10px;
                    }
                    .badge {
                        padding: 6px 12px;
                        border-radius: 20px;
                        font-size: 11px;
                        font-weight: 600;
                        display: inline-block;
                    }
                    .badge.pending {
                        background-color: #e2e3e5;
                        color: #383d41;
                    }
                    .footer {
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 1px solid #dddddd;
                        text-align: center;
                        font-size: 11px;
                        color: #666666;
                    }
                    .footer p {
                        margin: 5px 0;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <!-- Header -->
                    <div class="header">
                        <p style="font-size: 18px; color: #a5632a; margin: 0 0 15px 0; font-weight: 700; letter-spacing: 1px;">🐺 WOLF SUPPLIES LTD</p>
                        <h1>Order Confirmation</h1>
                        <div class="order-info">
                            <div><span class="order-info-label">Order ID:</span> ${orderId}</div>
                            <div><span class="order-info-label">Date:</span> ${orderDate}</div>
                        </div>
                    </div>

                    <!-- Important Banner -->
                    <div class="important-banner">
                        <h3>📌 Keep This For Your Records</h3>
                        <p><strong>Order ID: ${orderId}</strong></p>
                        <p>Use this ID to track and look up your order status anytime at our website.</p>
                    </div>

                    <!-- Contact Details -->
                    <div class="section">
                        <h2 class="section-title">Contact Details</h2>
                        <div class="grid-4">
                            <div class="contact-field">
                                <div class="contact-field-label">First Name</div>
                                <div class="contact-field-value">${order.contactDetails?.firstName || 'N/A'}</div>
                            </div>
                            <div class="contact-field">
                                <div class="contact-field-label">Last Name</div>
                                <div class="contact-field-value">${order.contactDetails?.lastName || 'N/A'}</div>
                            </div>
                            <div class="contact-field">
                                <div class="contact-field-label">Email</div>
                                <div class="contact-field-value">${order.contactDetails?.email || 'N/A'}</div>
                            </div>
                            <div class="contact-field">
                                <div class="contact-field-label">Phone</div>
                                <div class="contact-field-value">${order.contactDetails?.phone || 'N/A'}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Delivery Information -->
                    <div class="section">
                        <h2 class="section-title">Delivery Information</h2>
                        <div class="grid-2">
                            <div class="info-card">
                                <div class="info-card-title">📦 Shipping Address</div>
                                <p>
                                    <strong>${order.shippingAddress?.address}</strong><br/>
                                    ${order.shippingAddress?.apartment || ''}<br/>
                                    ${order.shippingAddress?.city}, ${order.shippingAddress?.stateRegion} ${order.shippingAddress?.postalCode}<br/>
                                    ${order.shippingAddress?.country}
                                </p>
                            </div>
                            <div class="info-card">
                                <div class="info-card-title">💳 Billing Address</div>
                                <p>
                                    <strong>${order.billingAddress?.address || order.shippingAddress?.address}</strong><br/>
                                    ${order.billingAddress?.apartment || order.shippingAddress?.apartment || ''}<br/>
                                    ${order.billingAddress?.city || order.shippingAddress?.city}, ${order.billingAddress?.stateRegion || order.shippingAddress?.stateRegion} ${order.billingAddress?.postalCode || order.shippingAddress?.postalCode}<br/>
                                    ${order.billingAddress?.country || order.shippingAddress?.country}
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Order Items -->
                    <div class="section">
                        <h2 class="section-title">Order Items</h2>
                        <table class="items-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Variants</th>
                                    <th style="text-align: center;">Qty</th>
                                    <th style="text-align: right;">Price</th>
                                    <th style="text-align: right;">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHTML}
                            </tbody>
                        </table>
                    </div>

                    <!-- Order Summary -->
                    <div class="section">
                        <h2 class="section-title">Order Summary</h2>
                        <div class="totals-section">
                            <div class="total-row">
                                <span>Items Total:</span>
                                <span>£${(order.itemsPrice || 0).toFixed(2)}</span>
                            </div>
                            <div class="total-row">
                                <span>Shipping Cost:</span>
                                <span>£${(order.shippingPrice || 0).toFixed(2)}</span>
                            </div>
                            <div class="total-row">
                                <span>Tax:</span>
                                <span>£${(order.taxPrice || 0).toFixed(2)}</span>
                            </div>
                            ${order.discountAmount > 0 && order.couponCode ? `
                            <div class="total-row" style="color: #10b981; font-weight: bold;">
                                <span>Discount (${order.couponCode}):</span>
                                <span>-£${(order.discountAmount || 0).toFixed(2)}</span>
                            </div>
                            ` : ''}
                            <div class="total-row grand-total">
                                <span>Grand Total:</span>
                                <span>£${(order.totalPrice || 0).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Status -->
                    <div class="section">
                        <h2 class="section-title">Order Status</h2>
                        <div class="badges">
                            <div class="badge ${order.fulfillmentStatus === 'fulfilled' ? 'completed' : 'pending'}">${order.fulfillmentStatus === 'fulfilled' ? '✓ Fulfilled' : '⏳ Unfulfilled'}</div>
                            ${order.deliveryStatus === 'delivered' ? '<div class="badge delivered">✓ Delivered</div>' : ''}
                            ${order.deliveryStatus === 'shipped' ? '<div class="badge shipped">📦 Shipped</div>' : ''}
                            ${order.deliveryStatus === 'refunded' ? '<div class="badge refunded">⚠️ Refunded</div>' : ''}
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="footer">
                        <p><strong>Thank you for your order!</strong></p>
                        <p>For any queries, please contact us at ${process.env.SUPPORT_EMAIL || 'support@wolfsupplies.com'}</p>
                        <p>© Wolf Supplies LTD. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Use Puppeteer to convert HTML to PDF
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            margin: { top: '10px', right: '10px', bottom: '10px', left: '10px' },
        });

        await browser.close();
        return pdfBuffer;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
};

module.exports = { generateOrderPDF };