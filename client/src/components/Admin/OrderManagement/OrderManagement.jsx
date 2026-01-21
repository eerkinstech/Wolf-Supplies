import React, { useEffect, useState } from 'react';
import { FaFile, FaSpinner, FaSync } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../../../redux/slices/orderSlice';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || '';

const OrderManagement = () => {
  const dispatch = useDispatch();
  const { orders = [], loading } = useSelector((state) => state.order);
  const [localOrders, setLocalOrders] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [modalOrder, setModalOrder] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  useEffect(() => {
    const list = orders || [];
    setLocalOrders(list);
    // remove any selected ids that no longer exist
    setSelectedIds(prev => prev.filter(id => list.some(o => o._id === id)));
    // update selectAll flag based on current selections
    setSelectAll(prevSelected => list.length > 0 && prevSelected.length === list.length);
  }, [orders]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update order');
      toast.success(`Order status updated to ${newStatus}`);
      dispatch(fetchOrders());
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handlePaymentToggle = async (orderId, makePaid) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/api/orders/${orderId}/payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPaid: makePaid, paidAt: makePaid ? Date.now() : null }),
      });
      if (!response.ok) throw new Error('Failed to update payment status');
      toast.success(`Payment marked as ${makePaid ? 'Paid' : 'Unpaid'}`);
      dispatch(fetchOrders());
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleFulfilledToggle = async (orderId, fulfilled) => {
    try {
      const token = localStorage.getItem('token');
      const newStatus = fulfilled ? 'completed' : 'pending';
      const response = await fetch(`${API}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update fulfilled status');
      toast.success(`Order ${fulfilled ? 'fulfilled' : 'marked unfulfilled'}`);
      dispatch(fetchOrders());
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeliveryUpdate = async (orderId, deliveryKey) => {
    try {
      const token = localStorage.getItem('token');
      if (!deliveryKey) {
        // Clear delivered flag and reset status to no-status
        const res1 = await fetch(`${API}/api/orders/${orderId}/delivery`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isDelivered: false }),
        });
        if (!res1.ok) throw new Error('Failed to clear delivery flag');
        // also reset status to empty (no status)
        const res2 = await fetch(`${API}/api/orders/${orderId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          // backend expects a valid status; use 'pending' to represent No Status
          body: JSON.stringify({ status: 'pending' }),
        });
        if (!res2.ok) throw new Error('Failed to clear order status');
        toast.success('Delivery status cleared');
      } else if (deliveryKey === 'shipped') {
        // set status to shipped
        const res = await fetch(`${API}/api/orders/${orderId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: 'shipped' }),
        });
        if (!res.ok) throw new Error('Failed to mark shipped');
        toast.success('Order marked as shipped');
      } else if (deliveryKey === 'delivered') {
        // mark delivered; keep status as completed/delivered if needed
        const res = await fetch(`${API}/api/orders/${orderId}/delivery`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isDelivered: true, deliveredAt: Date.now() }),
        });
        if (!res.ok) throw new Error('Failed to mark delivered');
        // Optionally set status to completed for delivered orders
        await fetch(`${API}/api/orders/${orderId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: 'completed' }),
        });
        toast.success('Order marked as delivered');
      }
      dispatch(fetchOrders());
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-gray-200 text-gray-800',
      shipped: 'bg-purple-100 text-purple-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || colors.pending;
  };

  return (
    <div>
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="text-4xl text-gray-700 animate-spin" />
        </div>
      )}

      {/* Orders Table */}
      {!loading && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Orders ({localOrders.length})</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => dispatch(fetchOrders())}
                className="text-gray-700 hover:text-indigo-800 flex items-center gap-2"
                title="Refresh orders"
              >
                <FaSync /> Refresh
              </button>
              <button
                onClick={async () => {
                  // bulk delete action
                  if (selectedIds.length === 0) return toast('No orders selected');
                  if (!confirm('Delete selected orders that are fulfilled and delivered? This cannot be undone.')) return;
                  setBulkLoading(true);
                  try {
                    const token = localStorage.getItem('token');
                    // delete any selected orders (no restriction)
                    const toDelete = localOrders.filter(o => selectedIds.includes(o._id));
                    if (toDelete.length === 0) {
                      toast('No selected orders to delete');
                      setBulkLoading(false);
                      return;
                    }
                    await Promise.all(toDelete.map(o => fetch(`${API}/api/orders/${o._id}`, {
                      method: 'DELETE',
                      headers: { Authorization: `Bearer ${token}` },
                    })));
                    toast.success(`Deleted ${toDelete.length} orders`);
                    setSelectedIds([]);
                    setSelectAll(false);
                    dispatch(fetchOrders());
                  } catch (err) {
                    toast.error('Bulk delete failed');
                  } finally { setBulkLoading(false); }
                }}
                className="px-3 py-1 bg-red-600 text-white rounded flex items-center gap-2"
                title="Delete selected fulfilled+delivered"
              >
                {bulkLoading ? <FaSpinner className="animate-spin" /> : 'Delete Selected'}
              </button>
            </div>
          </div>
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  <input type="checkbox" checked={selectAll} onChange={(e) => {
                    const checked = e.target.checked;
                    setSelectAll(checked);
                    setSelectedIds(checked ? (localOrders || []).map(o => o._id) : []);
                  }} />
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Order / Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Person</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Total Price</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Fulfilment</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Delivery Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {localOrders && localOrders.length > 0 ? (
                localOrders.map((order) => {
                  const displayId = order.orderId || `ORD-${new Date(order.createdAt).toISOString().slice(0, 10).replace(/-/g, '')}-${order._id?.slice(-6)}`;
                  const shortDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A';
                  const fullDate = order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A';
                  const personName = order.user?.name || order.customerName || 'Guest';
                  const personEmail = order.user?.email || order.customerEmail || '';
                  const total = order.totalPrice ?? order.totalAmount ?? 0;
                  const paymentStatus = order.isPaid ? 'Paid' : 'Pre Payment';
                  const fulfilled = order.status === 'completed';
                  // normalize deliveryStatus values: '' = No Status, 'shipped', 'delivered'
                  const deliveryStatus = order.isDelivered ? 'delivered' : (order.status === 'shipped' ? 'shipped' : '');

                  return (
                    <tr key={order._id} className="hover:bg-gray-50 transition duration-300">
                      <td className="px-4 py-4">
                        <input type="checkbox" checked={selectedIds.includes(order._id)} onChange={(e) => {
                          const checked = e.target.checked;
                          setSelectedIds(prev => checked ? [...prev, order._id] : prev.filter(id => id !== order._id));
                          if (!checked) setSelectAll(false);
                        }} />
                      </td>

                      <td className="px-4 py-4 font-mono text-gray-900 text-sm">{displayId} <br />
                        {fullDate} </td>

                      <td className="px-4 py-4 text-gray-600">
                        <div className="text-sm font-semibold">{personName}</div>
                        <div className="text-xs text-gray-900">{personEmail}</div>
                      </td>
                      <td className="px-4 py-4 text-gray-700 font-bold">£{Number(total).toFixed(2)}</td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleFulfilledToggle(order._id, !fulfilled)}
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${fulfilled ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'}`}
                          title={fulfilled ? 'Fulfilled - click to mark unfulfilled' : 'Unfulfilled - click to mark fulfilled'}
                        >
                          {fulfilled ? 'Fulfilled' : 'Unfulfilled'}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={deliveryStatus}
                          onChange={(e) => handleDeliveryUpdate(order._id, e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">No Status</option>
                          <option value="shipped">shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setModalOrder(order)} className="px-3 py-1 bg-gray-800 text-white rounded text-sm"> <FaFile/> </button>
                        
                        </div>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-600">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* Order detail modal */}
      {modalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white max-w-3xl w-full p-6 rounded shadow-lg overflow-auto max-h-[80vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Order {modalOrder.orderId || modalOrder._id}</h3>
              <button onClick={() => setModalOrder(null)} className="text-sm text-gray-600">Close</button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">Items</h4>
                <div className="mt-2 space-y-3">
                  {modalOrder.orderItems?.map(item => (
                    <div key={item._id || item.product} className="flex items-center gap-3 border-b pb-2">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                      <div className="flex-1">
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-sm text-gray-900">Qty: {item.qty} × £{Number(item.price).toFixed(2)}</div>
                        <div className="text-sm text-gray-900">
                          {item.selectedSize && `Size: ${item.selectedSize} `}
                          {item.selectedColor && `Color: ${item.selectedColor} `}
                        </div>
                      </div>
                      <div className="font-semibold">£{(item.qty * item.price).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold">Shipping Address</h4>
                {modalOrder.shippingAddress ? (
                  <div className="text-sm text-gray-700">
                    <div>{modalOrder.shippingAddress.address}</div>
                    <div>{modalOrder.shippingAddress.city} {modalOrder.shippingAddress.postalCode}</div>
                    <div>{modalOrder.shippingAddress.country}</div>
                  </div>
                ) : <div className="text-sm text-gray-900">No shipping address provided.</div>}
              </div>

              {modalOrder.billingAddress && (
                <div>
                  <h4 className="font-semibold">Billing Address</h4>
                  <div className="text-sm text-gray-700">
                    <div>{modalOrder.billingAddress.address}</div>
                    <div>{modalOrder.billingAddress.city} {modalOrder.billingAddress.postalCode}</div>
                    <div>{modalOrder.billingAddress.country}</div>
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold">Customer</h4>
                <div className="text-sm text-gray-700">{modalOrder.user?.name || modalOrder.customerName}</div>
                <div className="text-sm text-gray-600">{modalOrder.user?.email || modalOrder.customerEmail}</div>
              </div>

              <div>
                <h4 className="font-semibold">Summary</h4>
                <div className="text-sm text-gray-700">Items: £{((modalOrder.itemsPrice ?? modalOrder.orderItems?.reduce((s, it) => s + it.price * it.qty, 0)) || 0).toFixed(2)}</div>
                <div className="text-sm text-gray-700">Shipping: £{(modalOrder.shippingPrice || 0).toFixed(2)}</div>
                <div className="text-sm text-gray-700">Tax: £{(modalOrder.taxPrice || 0).toFixed(2)}</div>
                <div className="text-lg font-semibold mt-2">Total: £{(modalOrder.totalPrice || modalOrder.totalAmount || 0).toFixed(2)}</div>
              </div>

              <div>
                <h4 className="font-semibold">Status</h4>
                <div className="mt-2 flex items-center gap-2">
                  {modalOrder.isPaid && <div className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">Paid</div>}
                  <div className={`px-3 py-1 rounded-full text-sm ${modalOrder.status === 'completed' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'}`}>{modalOrder.status === 'completed' ? 'Fulfilled' : 'Unfulfilled'}</div>
                  <div className={`px-3 py-1 rounded-full text-sm ${modalOrder.isDelivered ? 'bg-gray-100 text-gray-800' : (modalOrder.status === 'shipped' ? 'bg-purple-100 text-purple-800' : 'bg-yellow-100 text-yellow-800')}`}>{modalOrder.isDelivered ? `Delivered` : (modalOrder.status === 'shipped' ? 'Shipped' : 'No Status')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
