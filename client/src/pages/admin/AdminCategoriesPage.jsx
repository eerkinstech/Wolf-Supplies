import React from 'react';
import AdminSidebar from '../../components/Admin/AdminSidebar/AdminSidebar';
import CategoryManagement from '../../components/Admin/CategoryManagement/CategoryManagement';

const AdminCategoriesPage = () => {
  return (
    <div className="bg-gray-100 min-h-screen">
      <AdminSidebar activeTab="categories" />
      <div className="ml-64 overflow-auto min-h-screen">
        <CategoryManagement />
      </div>
    </div>
  );
};

export default AdminCategoriesPage;
