import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaShoppingBag, FaShoppingCart } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const MobileBottomMenu = () => {
    const cartItems = useSelector((state) => state.cart.items);
    const cartCount = cartItems.length;

    return (
        <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-gray-200 shadow-lg z-40">
            <div className="flex items-center justify-around h-20">
                {/* Home Link */}
                <Link
                    to="/"
                    className="flex flex-col items-center justify-center py-2 px-4 hover:bg-gray-100 transition duration-300 flex-1 h-full"
                >
                    <FaHome className="text-2xl text-gray-700 mb-1" />
                    <span className="text-xs font-semibold text-gray-700">Home</span>
                </Link>

                {/* Shop Link */}
                <Link
                    to="/products"
                    className="flex flex-col items-center justify-center py-2 px-4 hover:bg-gray-100 transition duration-300 flex-1 h-full"
                >
                    <FaShoppingBag className="text-2xl text-gray-700 mb-1" />
                    <span className="text-xs font-semibold text-gray-700">Shop</span>
                </Link>

                {/* Cart Link */}
                <Link
                    to="/cart"
                    className="flex flex-col items-center justify-center py-2 px-4 hover:bg-gray-100 transition duration-300 flex-1 h-full relative"
                >
                    <FaShoppingCart className="text-2xl text-gray-700 mb-1" />
                    <span className="text-xs font-semibold text-gray-700">Cart</span>
                    {cartCount > 0 && (
                        <span className="absolute top-1 right-2 bg-gray-700 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {cartCount}
                        </span>
                    )}
                </Link>
            </div>

        </div>
    );
};

export default MobileBottomMenu;
