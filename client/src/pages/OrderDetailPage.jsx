import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaCheck, FaTruck, FaCreditCard } from 'react-icons/fa';

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
        console.error('Order fetch failed', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, token]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)]">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-accent-primary)] mb-4"></div>
        <p className="text-[var(--color-text-light)]">Loading order…</p>
      </div>
    </div>
  );
  if (!order) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)]">
      <div className="text-center">
        <p className="text-[var(--color-text-primary)] font-semibold mb-4">Order not found.</p>
        <Link to="/account" className="text-[var(--color-accent-primary)] font-bold hover:underline">Back to Account →</Link>
      </div>
    </div>
  );

  const totals = {
    items: order.itemsPrice ?? (order.orderItems?.reduce((s, it) => s + it.price * it.qty, 0) ?? 0),
    shipping: order.shippingPrice ?? 0,
    tax: order.taxPrice ?? 0,
    total: order.totalPrice ?? order.totalAmount ?? 0,
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--color-bg-primary, #ffffff)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 text-[var(--color-text-primary)]">Order Details</h1>
            <p className="text-sm sm:text-base font-mono text-[var(--color-accent-primary)]">
              {order.orderId || `ORD-${new Date(order.createdAt).toISOString().slice(0, 10).replace(/-/g, '')}-${order._id?.slice(-6)}`}
            </p>
            <p className="text-xs sm:text-sm text-[var(--color-text-light)] mt-1">
              {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <Link to="/account" className="px-6 py-2.5 rounded-lg font-semibold text-white hover:opacity-90 transition duration-300" style={{ backgroundColor: 'var(--color-accent-primary)' }}>
            ← Back to Account
          </Link>
        </div>

        {/* Customer Information Section */}
        <div className="mb-8 p-4 sm:p-6 rounded-lg border-2" style={{
          backgroundColor: 'var(--color-bg-section, #e5e5e5)',
          borderColor: 'var(--color-border-light, #e5e5e5)'
        }}>
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-[var(--color-text-primary)]">Contact Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div>
              <p className="text-xs sm:text-sm mb-1 font-semibold text-[var(--color-text-light)]">First Name</p>
              <p className="text-sm sm:text-base text-[var(--color-text-primary)]">{order.contactDetails?.firstName || order.user?.name?.split(' ')[0] || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm mb-1 font-semibold text-[var(--color-text-light)]">Last Name</p>
              <p className="text-sm sm:text-base text-[var(--color-text-primary)]">{order.contactDetails?.lastName || order.user?.name?.split(' ')[1] || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm mb-1 font-semibold text-[var(--color-text-light)]">Email</p>
              <p className="text-sm sm:text-base text-[var(--color-text-primary)]">
                {order.contactDetails?.email || order.user?.email || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm mb-1 font-semibold text-[var(--color-text-light)]">Phone</p>
              <p className="text-sm sm:text-base text-[var(--color-text-primary)]">
                {order.contactDetails?.phone || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Shipping & Billing Section */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Shipping Address */}
          <div className="p-4 sm:p-6 rounded-lg border-2" style={{
            backgroundColor: 'var(--color-bg-section, #e5e5e5)',
            borderColor: 'var(--color-border-light, #e5e5e5)'
          }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded" style={{ backgroundColor: 'var(--color-accent-primary, #a5632a)' }}>
                <FaTruck style={{ color: 'white' }} size={18} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[var(--color-text-primary)]">Shipping Address</h3>
            </div>
            {order.shippingAddress ? (
              <div className="space-y-2 text-sm sm:text-base text-[var(--color-text-primary)]">
                <p className="font-semibold">{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.city} {order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            ) : (
              <p className="text-[var(--color-text-light)]">No shipping address provided</p>
            )}
          </div>

          {/* Billing Address */}
          <div className="p-4 sm:p-6 rounded-lg border-2" style={{
            backgroundColor: 'var(--color-bg-section, #e5e5e5)',
            borderColor: 'var(--color-border-light, #e5e5e5)'
          }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded" style={{ backgroundColor: 'var(--color-accent-primary, #a5632a)' }}>
                <FaCreditCard style={{ color: 'white' }} size={18} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[var(--color-text-primary)]">Billing Address</h3>
            </div>
            {order.billingAddress ? (
              <div className="space-y-2 text-sm sm:text-base text-[var(--color-text-primary)]">
                <p className="font-semibold">{order.billingAddress.address}</p>
                <p>{order.billingAddress.city} {order.billingAddress.postalCode}</p>
                <p>{order.billingAddress.country}</p>
              </div>
            ) : (
              <p className="text-[var(--color-text-light)]">Same as shipping address</p>
            )}
          </div>
        </div>

        {/* Order Items Section */}
        <div className="mb-8 p-4 sm:p-6 rounded-lg border-2" style={{
          backgroundColor: 'white',
          borderColor: 'var(--color-border-light, #e5e5e5)'
        }}>
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-[var(--color-text-primary)]">Order Items</h2>
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
                <div key={item._id || item.product} className="flex gap-3 sm:gap-4 pb-4 border-b" style={{ borderColor: 'var(--color-border-light, #e5e5e5)' }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm sm:text-base text-[var(--color-text-primary)]">{item.name}</h3>
                    {parts.length > 0 && <p className="text-xs sm:text-sm mt-1 text-[var(--color-text-light)]">{parts.join(' / ')}</p>}
                    <p className="text-xs sm:text-sm mt-1 text-[var(--color-text-secondary)]">Qty: {item.qty} × £{Number(item.price).toFixed(2)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-base sm:text-lg text-[var(--color-accent-primary)]">
                      £{(item.qty * item.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary & Payment Footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Summary */}
          <div className="md:col-span-2 p-4 sm:p-6 rounded-lg border-2" style={{
            backgroundColor: 'white',
            borderColor: 'var(--color-border-light, #e5e5e5)'
          }}>
            <h3 className="text-lg sm:text-xl font-bold mb-4 text-[var(--color-text-primary)]">Order Summary</h3>
            <div className="space-y-3 text-sm sm:text-base">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Items Subtotal:</span>
                <span className="font-bold text-[var(--color-text-primary)]">£{totals.items.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Shipping:</span>
                <span className="font-bold text-[var(--color-text-primary)]">£{totals.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Tax:</span>
                <span className="font-bold text-[var(--color-text-primary)]">£{totals.tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between" style={{ borderColor: 'var(--color-border-light, #e5e5e5)' }}>
                <span className="text-base sm:text-lg font-bold text-[var(--color-text-primary)]">Grand Total:</span>
                <span className="text-base sm:text-lg font-bold text-[var(--color-accent-primary)]">£{totals.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Fulfillment & Delivery Status */}
          <div className="p-4 sm:p-6 rounded-lg border-2" style={{
            backgroundColor: 'white',
            borderColor: 'var(--color-border-light, #e5e5e5)'
          }}>
            <h3 className="text-lg sm:text-xl font-bold mb-4 text-[var(--color-text-primary)]">Status</h3>
            <div className="space-y-3">
              <div className="p-3 rounded" style={{ backgroundColor: 'var(--color-bg-section, #e5e5e5)' }}>
                <p className="text-xs sm:text-sm mb-1 font-semibold text-[var(--color-text-light)]">Fulfillment</p>
                <p className="font-bold text-sm sm:text-base text-[var(--color-text-primary)]">
                  {order.status === 'completed' ? '✓ Fulfilled' : '⏳ Pending'}
                </p>
              </div>
              <div className="p-3 rounded" style={{ backgroundColor: 'var(--color-bg-section, #e5e5e5)' }}>
                <p className="text-xs sm:text-sm mb-1 font-semibold text-[var(--color-text-light)]">Delivery</p>
                <p className="font-bold text-sm sm:text-base text-[var(--color-text-primary)]">
                  {order.isDelivered ? '✓ Delivered' : order.status === 'shipped' ? '📦 Shipped' : '⏳ Not Shipped'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
