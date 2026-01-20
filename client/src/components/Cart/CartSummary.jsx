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
    <div className="bg-linear-to-br from-gray-100 to-gray-200 rounded-2xl shadow-lg border border-gray-300 p-8 sticky top-24 space-y-8">
      <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
        <FaBox className="text-gray-400" /> Order Summary
      </h2>

      {/* Shipping Info - always free */}
      <div className="bg-linear-to-r from-gray-200 to-gray-300 border-l-4 border-gray-700 p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-2">
          <FaTruck className="text-gray-400 text-xl" />
          <p className="font-bold text-gray-900 text-lg">Free Shipping</p>
        </div>
        <p className="text-sm text-gray-800">Shipping is free for all orders</p>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-4 pb-8 border-b-2 border-gray-200">
        <div className="flex justify-between text-base">
          <span className="text-gray-600 font-medium">Subtotal</span>
          <span className="font-semibold text-gray-900">£{totalPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-base">
          <span className="text-gray-600 font-medium">Shipping</span>
          <span className={`font-semibold ${shippingCost === 0 ? 'text-gray-400' : 'text-gray-900'}`}>
            {shippingCost === 0 ? 'FREE' : `£${shippingCost.toFixed(2)}`}
          </span>
        </div>

      </div>

      {/* Total */}
      <div className="bg-linear-to-r from-gray-200 to-gray-300 p-6 rounded-xl">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600 font-medium">Total Items</span>
          <span className="font-bold text-gray-900 text-lg">{totalQuantity}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-gray-900">Total Amount</span>
          <span className="text-2xl font-bold text-gray-900">£{finalTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="space-y-4 pt-4">
        <button
          onClick={onCheckout}
          className="w-full bg-linear-to-r from-gray-800 to-black hover:from-black hover:to-gray-900 text-white py-4 rounded-xl font-bold transition duration-300 text-lg transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
        >
          <FaCheck /> Proceed to Checkout
        </button>
        {/* 
        <Link
          to="/products"
          className="block w-full border-2 border-gray-400 text-gray-400 hover:bg-gray-50 py-4 rounded-xl font-bold transition duration-300 text-center text-lg"
        >
          Continue Shopping
        </Link> */}

        <button
          onClick={onClearCart}
          className="w-full border-2 border-black text-black hover:bg-gray-100 py-4 rounded-xl font-bold transition duration-300 text-lg"
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
