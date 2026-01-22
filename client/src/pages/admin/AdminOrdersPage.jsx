import React from 'react';
import AdminLayout from '../../components/Admin/AdminLayout/AdminLayout';
import OrderManagement from '../../components/Admin/OrderManagement/OrderManagement';

const AdminOrdersPage = () => {
  return (
    <AdminLayout activeTab="orders">
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
        <p className="text-gray-600 mt-4">Manage all customer orders and track shipments</p>
        <OrderManagement />
      </div>
    </AdminLayout>
  );
};

export default AdminOrdersPage;
