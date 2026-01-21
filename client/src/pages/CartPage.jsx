import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateCartItem, clearCart, syncCart, clearServerCart } from '../redux/slices/cartSlice';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';
import CartItem from '../components/Cart/CartItem';
import CartSummary from '../components/Cart/CartSummary';
import RelatedProducts from '../components/Products/RelatedProducts/RelatedProducts';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { items, totalPrice, totalQuantity } = useSelector((state) => state.cart);

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
            console.error('syncCart failed on remove:', err);
            // fallback to manual persist
            await persistCart(newItems);
          }
        }
      } catch (err) {
        console.error('handleRemove error', err);
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
      console.error('Failed to persist cart', err);
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
    // Navigate to checkout page
    navigate('/checkout');
  };

  // Shipping is free for every order and there is no tax
  const shippingCost = 0;
  const taxCost = 0;
  const finalTotal = totalPrice;

  return (
    <div className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <FaShoppingCart className="text-4xl text-gray-400" />
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900">Shopping Cart</h1>
          </div>
          <p className="text-xl text-gray-600">
            {items.length === 0 ? 'Your cart is empty' : `You have ${totalQuantity} item${totalQuantity !== 1 ? 's' : ''} in your cart`}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl shadow-lg border-2 border-gray-100">
            <FaShoppingCart className="text-8xl text-gray-300 mx-auto mb-6" />
            <p className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</p>
            <p className="text-xl text-gray-600 mb-12">Add some items to your cart to get started!</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-gray-700 to-black hover:from-gray-900 hover:to-grey-700 text-white px-10 py-4 rounded-lg font-bold text-lg transition duration-300 transform hover:scale-105 shadow-lg"
            >
              <FaArrowLeft /> Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
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
                  toast.success('Cart cleared');
                  if (token) {
                    dispatch(clearServerCart());
                  }
                }}
                shippingCost={shippingCost}
                taxCost={taxCost}
                finalTotal={finalTotal}
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
