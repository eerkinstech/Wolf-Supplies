import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserOrders } from '../redux/slices/orderSlice';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import UserMessages from '../components/Account/UserMessages';
import { Link } from 'react-router-dom';

const AccountPageContent = () => {
    const dispatch = useDispatch();
    const { orders, loading, error } = useSelector((state) => state.order);

    useEffect(() => {
        dispatch(fetchUserOrders());
    }, [dispatch]);

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold mb-6">My Account</h1>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Order History</h2>
                {loading && <p className="text-gray-600">Loading orders...</p>}
                {error && <p className="text-red-600">{error}</p>}
                {!loading && orders && orders.length === 0 && (
                    <div className="bg-gray-100 border-l-4 border-gray-400 p-4 rounded">
                        <p className="text-gray-700">You have not placed any orders yet.</p>
                        <Link to="/products" className="text-gray-400 font-semibold">Start shopping</Link>
                    </div>
                )}

                {!loading && orders && orders.length > 0 && (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white border rounded-lg p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                    <p className="text-sm text-gray-900">Order ID: <span className="font-mono">{order.orderId || order._id}</span></p>
                                    <p className="font-semibold text-gray-900">{new Date(order.createdAt).toLocaleString()}</p>
                                    <p className="text-gray-600">Items: {order.orderItems ? order.orderItems.length : 0}</p>
                                    {/* show variant details inline */}
                                    {order.orderItems && order.orderItems.length > 0 && (
                                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                                            {order.orderItems.map((it, idx) => {
                                                const parts = [];
                                                if (it.selectedSize) parts.push(`Size: ${it.selectedSize}`);
                                                if (it.selectedColor) parts.push(`Color: ${it.selectedColor}`);
                                                if (it.selectedVariants && typeof it.selectedVariants === 'object') {
                                                    Object.entries(it.selectedVariants).forEach(([k, v]) => { if (v) parts.push(`${k}: ${v}`); });
                                                }
                                                if (it.variantId) parts.push(`VariantId: ${it.variantId}`);
                                                return (
                                                    <div key={it._id || idx} className="flex items-center gap-3">
                                                        <div className="font-medium">{it.name}</div>
                                                        <div className="text-xs text-gray-900">{parts.join(' / ')}</div>
                                                        <div className="ml-2 text-xs">x{it.qty || it.quantity || 1}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-gray-900">{order.totalPrice ? `£${order.totalPrice.toFixed(2)}` : ''}</p>
                                    <div className="mt-2 flex items-center gap-2 justify-end">
                                        {order.isPaid && (
                                            <span className={`px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700`}>
                                                Paid
                                            </span>
                                        )}
                                        <span className={`px-3 py-1 rounded-full text-sm ${order.status === 'completed' ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-700'}`}>
                                            {order.status === 'completed' ? 'Fulfilled' : 'Unfulfilled'}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-sm ${order.isDelivered ? 'bg-gray-200 text-gray-800' : (order.status === 'shipped' ? 'bg-gray-100 text-gray-700' : 'bg-gray-50 text-gray-600')}`}>
                                            {order.isDelivered ? 'Delivered' : (order.status === 'shipped' ? 'Shipped' : 'No Status')}
                                        </span>
                                    </div>
                                    <div className="mt-3">
                                        <Link to={`/order/${order._id}`} className="text-sm text-gray-400 font-semibold">View details</Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* User Messages Section */}
            <UserMessages />

        </div>
    );
};

const AccountPage = () => (
    <ProtectedRoute>
        <AccountPageContent />
    </ProtectedRoute>
);

export default AccountPage;
