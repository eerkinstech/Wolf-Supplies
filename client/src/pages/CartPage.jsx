import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateCartItem, clearCart, syncCart, clearServerCart } from '../redux/slices/cartSlice';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import CartItem from '../components/Cart/CartItem';
import CartSummary from '../components/Cart/CartSummary';
import RelatedProducts from '../components/Products/RelatedProducts/RelatedProducts';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { items, totalPrice, totalQuantity } = useSelector((state) => state.cart);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const handleRemove = (id) => {
    (async () => {
      try {
        const newItems = items.filter((item) => item._id !== id);
        dispatch(removeFromCart(id));
        toast.success('Item removed from cart');
        if (token) {
          try {
            await dispatch(syncCart(newItems)).unwrap();
          } catch (err) {
            // fallback to manual persist
            await persistCart(newItems);
          }
        }
      } catch (err) {
      }
    })();
  };

  // persist removal to backend
  const persistCart = async (newItems) => {
    const API = import.meta.env.VITE_API_URL || '';
    if (!token) return;
    try {
      await fetch(`${API}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items: newItems }),
      });
    } catch (err) {
    }
  };

  const handleUpdateQuantity = (id, quantity) => {
    if (quantity < 1) return;
    dispatch(updateCartItem({ id, quantity }));
    // persist update
    const newItems = items.map((i) => (i._id === id ? { ...i, quantity } : i));
    if (token) dispatch(syncCart(newItems));
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    // Navigate to checkout page with coupon info
    navigate('/checkout', { state: { appliedCoupon, discountAmount } });
  };

  const handleApplyCoupon = async (couponCode) => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    try {
      const API = import.meta.env.VITE_API_URL || '';

      // Extract product IDs from cart items
      const productIds = items.map(item => item.product);

      const response = await fetch(`${API}/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode,
          orderTotal: totalPrice,
          cartItems: items,
          productIds: productIds // Send all product IDs in cart
        })
      });

      if (!response.ok) {
        throw new Error('Invalid or expired coupon');
      }

      const coupon = await response.json();

      // The API returns either:
      // 1. Full coupon object with discountValue property, OR
      // 2. Response object with coupon property containing both discountValue and discount
      const couponData = coupon.coupon || coupon;

      // Use the pre-calculated discount from server if available, otherwise calculate
      let finalDiscount = couponData.discount || 0;

      if (!finalDiscount) {
        // Fallback: calculate discount if not provided by server
        const discountValue = parseFloat(couponData.discountValue) || 0;
        let calculatedDiscount = 0;

        if (couponData.discountType === 'percentage') {
          calculatedDiscount = (totalPrice * discountValue) / 100;
        } else {
          calculatedDiscount = discountValue;
        }

        finalDiscount = Math.min(Math.max(0, calculatedDiscount), totalPrice);
      }

      setAppliedCoupon(couponData);
      setDiscountAmount(finalDiscount);
      toast.success(`Coupon applied! You saved £${finalDiscount.toFixed(2)}`);
    } catch (error) {
      toast.error(error.message);
      setAppliedCoupon(null);
      setDiscountAmount(0);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    toast.success('Coupon removed');
  };

  // Shipping is free for every order and there is no tax
  const shippingCost = 0;
  const taxCost = 0;
  // Calculate final total: subtotal - discount
  const finalTotal = Math.max(0, (totalPrice || 0) - (discountAmount || 0));

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <i className="fas fa-shopping-cart text-4xl text-[var(--color-accent-primary)]"></i>
            <h1 className="text-5xl md:text-6xl font-bold text-[var(--color-text-primary)]">Shopping Cart</h1>
          </div>
          <p className="text-xl text-[var(--color-text-light)]">
            {items.length === 0 ? 'Your cart is empty' : `You have ${totalQuantity} item${totalQuantity !== 1 ? 's' : ''} in your cart`}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24 bg-[var(--color-bg-secondary)] rounded-3xl shadow-lg border-2 border-[var(--color-border-light)]">
            <i className="fas fa-shopping-cart text-8xl text-[var(--color-text-muted)] mx-auto mb-6 block"></i>
            <p className="text-3xl font-bold text-[var(--color-text-primary)] mb-4">Your cart is empty</p>
            <p className="text-xl text-[var(--color-text-light)] mb-12">Add some items to your cart to get started!</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-3 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-light)] text-white px-10 py-4 rounded-lg font-bold text-lg transition duration-300 shadow-lg"
            >
              <i className="fas fa-arrow-left"></i> Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[var(--color-bg-primary)] rounded-2xl shadow-lg overflow-hidden border border-[var(--color-border-light)]">
                {items.map((item, idx) => (
                  <CartItem
                    key={item._id}
                    item={item}
                    onRemove={(id) => { handleRemove(id); }}
                    onUpdateQuantity={(id, qty) => { handleUpdateQuantity(id, qty); }}
                    index={idx}
                    isLast={idx === items.length - 1}
                  />
                ))}
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <CartSummary
                totalPrice={totalPrice}
                totalQuantity={totalQuantity}
                onCheckout={handleCheckout}
                onClearCart={async () => {
                  dispatch(clearCart());
                  setAppliedCoupon(null);
                  setDiscountAmount(0);
                  toast.success('Cart cleared');
                  if (token) {
                    dispatch(clearServerCart());
                  }
                }}
                shippingCost={shippingCost}
                taxCost={taxCost}
                finalTotal={totalPrice - discountAmount}
                appliedCoupon={appliedCoupon}
                discountAmount={discountAmount}
                onApplyCoupon={handleApplyCoupon}
                onRemoveCoupon={handleRemoveCoupon}
              />
            </div>
          </div>
        )}

        {/* Related Products - Show random category */}
        {items.length > 0 && (
          <div className="mt-20">
            <RelatedProducts
              currentProductId=""
              currentCategory={items[0]?.category || 'Electronics'}
              limit={4}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
