import React from 'react';
import AdminSidebar from '../../components/Admin/AdminSidebar/AdminSidebar';

const AdminAnalyticsPage = () => {
  return (
    <div className="bg-gray-100 min-h-screen">
      <AdminSidebar activeTab="analytics" />
      <div className="ml-64 overflow-auto min-h-screen">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-4">View sales, revenue, and performance metrics</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-900 text-sm font-semibold uppercase">Total Sales</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">$12,345</p>
              <p className="text-gray-400 text-sm mt-2">↑ 12% from last month</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-900 text-sm font-semibold uppercase">Total Orders</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">234</p>
              <p className="text-gray-400 text-sm mt-2">↑ 8% from last month</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-900 text-sm font-semibold uppercase">Total Customers</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">1,234</p>
              <p className="text-gray-400 text-sm mt-2">↑ 15% from last month</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-900 text-sm font-semibold uppercase">Avg. Order Value</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">$52.75</p>
              <p className="text-red-600 text-sm mt-2">↓ 3% from last month</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Orders</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-gray-400 pl-4">
                  <p className="text-sm font-semibold text-gray-900">Order #1001</p>
                  <p className="text-sm text-gray-900">$234.50 • Delivered</p>
                </div>
                <div className="border-l-4 border-gray-800 pl-4">
                  <p className="text-sm font-semibold text-gray-900">Order #1002</p>
                  <p className="text-sm text-gray-900">$156.20 • Processing</p>
                </div>
                <div className="border-l-4 border-yellow-600 pl-4">
                  <p className="text-sm font-semibold text-gray-900">Order #1003</p>
                  <p className="text-sm text-gray-900">$89.99 • Pending</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Top Products</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold text-gray-900">Premium Wireless Headphones</p>
                  <span className="text-sm text-gray-900">45 sold</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold text-gray-900">Mechanical Keyboard RGB</p>
                  <span className="text-sm text-gray-900">38 sold</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold text-gray-900">Office Chair</p>
                  <span className="text-sm text-gray-900">24 sold</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
