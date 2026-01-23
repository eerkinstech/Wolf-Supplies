import React from 'react';
import { FaBox, FaTruck, FaCheck } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const CartSummary = ({
  totalPrice,
  totalQuantity,
  onCheckout,
  onClearCart,
  shippingCost,
  taxCost,
  finalTotal
}) => {
  return (
    <div className="rounded-2xl shadow-lg border p-8 sticky top-24 space-y-8" style={{ backgroundColor: 'var(--color-bg-section)', borderColor: 'var(--color-border-light)' }}>
      <h2 className="text-3xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
        <FaBox style={{ color: 'var(--color-accent-primary)' }} /> Order Summary
      </h2>

      {/* Shipping Info - always free */}
      <div className="border-l-4 p-6 rounded-xl" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-accent-primary)' }}>
        <div className="flex items-center gap-3 mb-2">
          <FaTruck className="text-xl" style={{ color: 'var(--color-accent-primary)' }} />
          <p className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>Free Shipping</p>
        </div>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Shipping is free for all orders</p>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-4 pb-8" style={{ borderBottomColor: 'var(--color-border-light)' }}>
        <div className="flex justify-between text-base" style={{ borderColor: 'var(--color-border-light)' }}>
          <span className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>Subtotal</span>
          <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>£{totalPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-base">
          <span className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>Shipping</span>
          <span className="font-semibold" style={{ color: shippingCost === 0 ? 'var(--color-text-light)' : 'var(--color-text-primary)' }}>
            {shippingCost === 0 ? 'FREE' : `£${shippingCost.toFixed(2)}`}
          </span>
        </div>
        <div className="flex justify-between text-base items-center">
          <span className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>VAT</span>
          <span className="inline-block px-2 py-1 text-xs font-semibold rounded" style={{ backgroundColor: 'var(--color-accent-primary)', color: 'white' }}>0%</span>
        </div>
      </div>

      {/* Total */}
      <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>Total Items</span>
          <span className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>{totalQuantity}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Total Amount</span>
          <span className="text-2xl font-bold" style={{ color: 'var(--color-accent-primary)' }}>£{finalTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="space-y-4 pt-4">
        <button
          onClick={onCheckout}
          className="w-full text-white py-4 rounded-xl font-bold transition duration-300 text-lg transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
          style={{
            backgroundColor: 'var(--color-accent-primary)',
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = 'var(--color-accent-light)')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = 'var(--color-accent-primary)')}
        >
          <FaCheck /> Proceed to Checkout
        </button>

        <button
          onClick={onClearCart}
          className="w-full py-4 rounded-xl font-bold transition duration-300 text-lg"
          style={{
            borderColor: 'var(--color-accent-primary)',
            color: 'var(--color-accent-primary)',
            borderWidth: '2px',
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = 'var(--color-bg-section)')
          }
          onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
        >
          Clear Cart
        </button>
      </div>

      {/* Trust Badges */}
      {/* <div className="bg-gray-50 p-4 rounded-xl space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <FaCheck className="text-gray-400" />
          <span>Secure checkout</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <FaTruck className="text-gray-400" />
          <span>Fast 2-4 day shipping</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <FaCheck className="text-gray-400" />
          <span>30-day returns</span>
        </div>
      </div> */}
    </div>
  );
};

export default CartSummary;
