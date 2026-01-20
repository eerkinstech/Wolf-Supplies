import React from 'react';
import AdminSidebar from '../../components/Admin/AdminSidebar/AdminSidebar';
import ReviewManagement from '../../components/Admin/ReviewManagement/ReviewManagement';

const AdminReviewsPage = () => {
  return (
    <div className="bg-gray-100 min-h-screen">
      <AdminSidebar activeTab="reviews" />
      <div className="ml-64 overflow-auto min-h-screen">
        <ReviewManagement />
      </div>
    </div>
  );
};

export default AdminReviewsPage;
