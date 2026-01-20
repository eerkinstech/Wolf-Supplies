import React from 'react';
import AdminSidebar from '../../components/Admin/AdminSidebar/AdminSidebar';
import ProductManagement from '../../components/Admin/ProductManagement/ProductManagement';

const AdminProductsPage = () => {
  return (
    <div className="bg-gray-100 min-h-screen">
      <AdminSidebar activeTab="products" />
      <div className="ml-64 overflow-auto min-h-screen">
        <ProductManagement />
      </div>
    </div>
  );
};

export default AdminProductsPage;
