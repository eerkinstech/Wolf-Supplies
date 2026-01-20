import React from 'react';
import AdminSidebar from '../../components/Admin/AdminSidebar/AdminSidebar';
import OrderManagement from '../../components/Admin/OrderManagement/OrderManagement';

const AdminOrdersPage = () => {
  return (
    <div className="bg-gray-100 min-h-screen">
      <AdminSidebar activeTab="orders" />
      <div className="ml-64 overflow-auto min-h-screen">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600 mt-4">Manage all customer orders and track shipments</p>
          <OrderManagement />
        </div>
      </div>
    </div>
  );
};

export default AdminOrdersPage;
