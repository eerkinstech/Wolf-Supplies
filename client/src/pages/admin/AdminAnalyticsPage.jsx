import React from 'react';
import AdminLayout from '../../components/Admin/AdminLayout/AdminLayout';

const AdminAnalyticsPage = () => {
  return (
    <AdminLayout activeTab="analytics">
      <div className="p-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Analytics Dashboard</h1>
        <p className="mt-4" style={{ color: 'var(--color-text-light)' }}>View sales, revenue, and performance metrics</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <div className="rounded-lg shadow p-6" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border-light)', borderWidth: '1px' }}>
            <h3 className="text-sm font-semibold uppercase" style={{ color: 'var(--color-text-secondary)' }}>Total Sales</h3>
            <p className="text-3xl font-bold mt-2" style={{ color: 'var(--color-accent-primary)' }}>£12,345</p>
            <p className="text-sm mt-2" style={{ color: 'var(--color-text-light)' }}>↑ 12% from last month</p>
          </div>

          <div className="rounded-lg shadow p-6" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border-light)', borderWidth: '1px' }}>
            <h3 className="text-sm font-semibold uppercase" style={{ color: 'var(--color-text-secondary)' }}>Total Orders</h3>
            <p className="text-3xl font-bold mt-2" style={{ color: 'var(--color-text-primary)' }}>234</p>
            <p className="text-sm mt-2" style={{ color: 'var(--color-text-light)' }}>↑ 8% from last month</p>
          </div>

          <div className="rounded-lg shadow p-6" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border-light)', borderWidth: '1px' }}>
            <h3 className="text-sm font-semibold uppercase" style={{ color: 'var(--color-text-secondary)' }}>Total Customers</h3>
            <p className="text-3xl font-bold mt-2" style={{ color: 'var(--color-text-primary)' }}>1,234</p>
            <p className="text-sm mt-2" style={{ color: 'var(--color-text-light)' }}>↑ 15% from last month</p>
          </div>

          <div className="rounded-lg shadow p-6" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border-light)', borderWidth: '1px' }}>
            <h3 className="text-sm font-semibold uppercase" style={{ color: 'var(--color-text-secondary)' }}>Avg. Order Value</h3>
            <p className="text-3xl font-bold mt-2" style={{ color: 'var(--color-text-primary)' }}>£52.75</p>
            <p className="text-sm mt-2" style={{ color: '#dc2626' }}>↓ 3% from last month</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="rounded-lg shadow p-6" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border-light)', borderWidth: '1px' }}>
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Recent Orders</h2>
            <div className="space-y-4">
              <div className="pl-4" style={{ borderColor: 'var(--color-accent-primary)', borderLeftWidth: '4px' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Order #1001</p>
                <p className="text-sm" style={{ color: 'var(--color-accent-primary)' }}>£234.50 • Delivered</p>
              </div>
              <div className="pl-4" style={{ borderColor: 'var(--color-text-secondary)', borderLeftWidth: '4px' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Order #1002</p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>£156.20 • Processing</p>
              </div>
              <div className="pl-4" style={{ borderColor: '#f59e0b', borderLeftWidth: '4px' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Order #1003</p>
                <p className="text-sm" style={{ color: '#f59e0b' }}>£89.99 • Pending</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg shadow p-6" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border-light)', borderWidth: '1px' }}>
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Top Products</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Premium Wireless Headphones</p>
                <span className="text-sm" style={{ color: 'var(--color-text-light)' }}>45 sold</span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Mechanical Keyboard RGB</p>
                <span className="text-sm" style={{ color: 'var(--color-text-light)' }}>38 sold</span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Office Chair</p>
                <span className="text-sm" style={{ color: 'var(--color-text-light)' }}>24 sold</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </AdminLayout>
  );
};

export default AdminAnalyticsPage;