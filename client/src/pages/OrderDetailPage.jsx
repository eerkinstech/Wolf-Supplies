import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || '';

const OrderDetailPage = () => {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API}/api/orders/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.message || 'Failed to load order');
        }
        const data = await response.json();
        setOrder(data);
      } catch (err) {
        // swallow error to avoid showing raw error UI; log for debugging
        // keep order as null which will show 'Order not found.' fallback
        console.error('Order fetch failed', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, token]);

  const refetch = async () => {
    try {
      const response = await fetch(`${API}/api/orders/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) return;
      const data = await response.json();
      setOrder(data);
    } catch (e) {
      console.error('refetch order failed', e);
    }
  };

  // Order update actions are performed from the admin Orders page.
  // This user-facing page only displays current status and delivery badges.

  if (loading) return <div className="p-8 text-center">Loading order…</div>;
  if (!order) return <div className="p-8">Order not found.</div>;

  const totals = {
    items: order.itemsPrice ?? (order.orderItems?.reduce((s, it) => s + it.price * it.qty, 0) ?? 0),
    shipping: order.shippingPrice ?? 0,
    tax: order.taxPrice ?? 0,
    total: order.totalPrice ?? order.totalAmount ?? 0,
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Order Details</h1>
        <Link to="/account" className="text-sm text-gray-700">Back to Account</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-3">Items</h2>
          <div className="space-y-4">
            {order.orderItems && order.orderItems.map((item) => {
              const parts = [];
              if (item.selectedSize) parts.push(`Size: ${item.selectedSize}`);
              if (item.selectedColor) parts.push(`Color: ${item.selectedColor}`);
              if (item.selectedVariants && typeof item.selectedVariants === 'object') {
                Object.entries(item.selectedVariants).forEach(([k, v]) => {
                  if (v) parts.push(`${k}: ${v}`);
                });
              }
              if (item.variantId) parts.push(`VariantId: ${item.variantId}`);

              return (
                <div key={item._id || item.product} className="flex items-center gap-4 border-b pb-3">
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
                  <div className="flex-1">
                    <div className="font-semibold">{item.name}</div>
                    {parts.length > 0 && <div className="text-sm text-gray-900">{parts.join(' / ')}</div>}
                    <div className="text-sm text-gray-600">Qty: {item.qty} × £{Number(item.price).toFixed(2)}</div>
                  </div>
                  <div className="font-semibold">£{(item.qty * item.price).toFixed(2)}</div>
                </div>
              );
            })}
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-2">Shipping Address</h3>
            {order.shippingAddress ? (
              <div className="text-sm text-gray-700">
                <div>{order.shippingAddress.address}</div>
                <div>{order.shippingAddress.city} {order.shippingAddress.postalCode}</div>
                <div>{order.shippingAddress.country}</div>
              </div>
            ) : <div className="text-sm text-gray-900">No shipping address provided.</div>}
          </div>

          {/* Billing Address Block */}
          {order.billingAddress && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Billing Address</h3>
              <div className="text-sm text-gray-700">
                <div>{order.billingAddress.address}</div>
                <div>{order.billingAddress.city} {order.billingAddress.postalCode}</div>
                <div>{order.billingAddress.country}</div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <h3 className="font-semibold mb-2">Payment Method:</h3>
            <div className="text-sm text-gray-700"> {order.paymentMethod || 'N/A'}</div>
            {order.isPaid && (
              <div className="mt-2 inline-block px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                Paid at {order.paidAt ? new Date(order.paidAt).toLocaleString() : ''}
              </div>
            )}
          </div>
        </div>

        <aside className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-3">Order Summary</h3>
          <div className="text-sm text-gray-700 mb-2">Order ID: <span className="font-mono">{order.orderId || order._id}</span></div>
          <div className="text-sm text-gray-700 mb-2">Date: {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</div>

          <div className="border-t pt-3">
            <div className="flex justify-between text-sm"><span>Items</span><span>£{totals.items.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm"><span>Shipping</span><span>£{totals.shipping.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm"><span>Tax</span><span>£{totals.tax.toFixed(2)}</span></div>
            <div className="flex justify-between font-semibold text-lg mt-3"><span>Total</span><span>£{totals.total.toFixed(2)}</span></div>
          </div>

          <div className="mt-4">
              <h4 className="font-semibold">Customer</h4>
            <div className="text-sm text-gray-700">{order.user?.name || order.customerName || user?.name}</div>
            <div className="text-sm text-gray-600">{order.user?.email || order.customerEmail || user?.email}</div>
            {order.user?.phone || order.customerPhone || user?.phone ? (
              <div className="text-sm text-gray-600">{order.user?.phone || order.customerPhone || user?.phone}</div>
            ) : null}
          </div>

            <div className="mt-4">
              <h4 className="font-semibold">Delivery</h4>
              <div className="flex items-center gap-3">
                <div className={`inline-block px-3 py-1 rounded-full text-sm ${order.isDelivered ? 'bg-gray-200 text-gray-800' : (order.status === 'shipped' ? 'bg-gray-100 text-gray-700' : 'bg-gray-50 text-gray-600')}`}>
                  {order.isDelivered ? `Delivered at ${order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : ''}` : (order.status === 'shipped' ? 'Shipped' : 'No Status')}
                </div>
                {/* Delivery actions are handled in the admin Orders page; this view is read-only for users. */}
              </div>
            </div>

            {/* Show payment / fulfilled badges here */}
            <div className="mt-4">
              <h4 className="font-semibold">Status</h4>
              <div className="mt-2 flex items-center gap-3">
                {order.isPaid && (
                  <div className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                    Paid
                  </div>
                )}
                <div className={`px-3 py-1 rounded-full text-sm ${order.status === 'completed' ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-700'}`}>
                  {order.status === 'completed' ? 'Fulfilled' : 'Unfulfilled'}
                </div>
                {/* Fulfilment updates are performed by admins in the admin Orders page. */}
              </div>
            </div>
        </aside>
      </div>
    </div>
  );
};

export default OrderDetailPage;
