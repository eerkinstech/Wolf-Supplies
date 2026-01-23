import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/Admin/AdminLayout/AdminLayout';
import { FaBox, FaDollarSign, FaShoppingCart, FaUsers, FaChartLine, FaArrowUp, FaArrowDown, FaEuroSign, FaPoundSign } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '../../redux/slices/productSlice';
import { fetchCategories } from '../../redux/slices/categorySlice';
import { fetchOrders } from '../../redux/slices/orderSlice';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [stats, setStats] = useState({ products: 0, categories: 0, totalValue: 0, orders: 0, revenue: 0 });
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const { products } = useSelector((state) => state.product);
  const { categories } = useSelector((state) => state.category);
  const { orders = [] } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
    dispatch(fetchOrders());
  }, [dispatch]);

  useEffect(() => {
    if (products) {
      // Inventory value calculation: sum every variant price (one per variant)
      // and simple product price (one per product). This reflects the
      // aggregated catalog value by price, not stock-weighted valuation.
      const totalValue = products.reduce((sum, p) => {
        if (p.variantCombinations && p.variantCombinations.length > 0) {
          const variantsSum = p.variantCombinations.reduce((vsum, v) => {
            const price = (v && v.price) ? v.price : (p.price || 0);
            return vsum + (price || 0);
          }, 0);
          return sum + variantsSum;
        }
        const price = p.price || 0;
        return sum + (price || 0);
      }, 0);

      // If a date range is set, filter orders to that range for orders/revenue stats.
      // Use local yyyy-mm-dd comparison to avoid timezone issues when comparing Date objects.
      const toYMD = (d) => {
        if (!d) return null;
        const dt = new Date(d);
        if (isNaN(dt)) return null;
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, '0');
        const day = String(dt.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      };

      const startY = toYMD(dateFrom);
      const endY = toYMD(dateTo);

      const filteredOrders = (orders || []).filter((o) => {
        if (!startY && !endY) return true;
        const createdY = toYMD(o.createdAt);
        if (!createdY) return false;
        if (startY && endY) return createdY >= startY && createdY <= endY;
        if (startY) return createdY >= startY;
        if (endY) return createdY <= endY;
        return true;
      });

      const totalRevenue = (filteredOrders || []).reduce((r, o) => r + (o.totalPrice || 0), 0);

      setStats({
        products: products.length,
        categories: categories?.length || 0,
        totalValue: totalValue.toFixed(2),
        orders: (filteredOrders || []).length,
        revenue: totalRevenue.toFixed(2),
      });
    }
  }, [products, categories, orders, dateFrom, dateTo]);

  const StatCard = ({ icon: Icon, label, value, trend, trendUp, color }) => (
    <div className="rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border-light)', borderWidth: '1px' }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold uppercase opacity-90" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
          <p className="text-lg font-bold mt-2" style={{ color: 'var(--color-text-primary)' }}>{value}</p>
          {trend && (
            <p className={`text-sm mt-2 flex items-center gap-1`} style={{ color: trendUp ? 'var(--color-text-secondary)' : '#dc2626' }}>
              {trendUp ? <FaArrowUp /> : <FaArrowDown />}
              {trend}
            </p>
          )}
        </div>
        <Icon className="text-4xl" style={{ color: 'var(--color-accent-primary)' }} />
      </div>
    </div>
  );

  return (
    <AdminLayout activeTab="dashboard">
      <div className="p-8" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Dashboard</h1>
          <p style={{ color: 'var(--color-text-light)' }}>Welcome back! Here's your store overview.</p>
        </div>

        {/* Date filter */}
        <div className="flex items-center gap-3 mb-6">
          <label className="text-sm" style={{ color: 'var(--color-text-light)' }}>From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 rounded-md"
            style={{ borderColor: 'var(--color-border-light)', borderWidth: '1px' }}
          />
          <label className="text-sm" style={{ color: 'var(--color-text-light)' }}>To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 rounded-md"
            style={{ borderColor: 'var(--color-border-light)', borderWidth: '1px' }}
          />
          <button
            onClick={() => {
              // effect depends on dateFrom/dateTo, so updating state is enough
              // we keep the button for UX but no-op since state already set by inputs
            }}
            className="text-white px-4 py-2 rounded-md ml-2"
            style={{ backgroundColor: 'var(--color-accent-primary)' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-accent-light)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-accent-primary)'}
          >
            Apply
          </button>
          <button
            onClick={() => {
              setDateFrom('');
              setDateTo('');
            }}
            className="px-3 py-2 rounded-md ml-2"
            style={{ backgroundColor: 'var(--color-bg-section)', color: 'var(--color-text-primary)' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-border-light)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-bg-section)'}
          >
            Reset
          </button>
          {(dateFrom || dateTo) && (
            <div className="text-xs ml-4" style={{ color: 'var(--color-text-primary)' }}>
              Showing stats for {dateFrom || 'start'} — {dateTo || 'now'}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={FaBox}
            label="Total Products"
            value={stats.products}
            trend="Active in store"
            trendUp={true}
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            icon={FaPoundSign}
            label="Inventory Value"
            value={`£${stats.totalValue}`}
            trend="Stock valuation"
            trendUp={true}
            color="from-gray-500 to-black-400"

          />
          <StatCard
            icon={FaShoppingCart}
            label="Total Orders"
            value={stats.orders}
            trend="Since start"
            trendUp={false}
            color="from-purple-500 to-purple-600"
          />
          <StatCard
            icon={FaChartLine}
            label="Revenue"
            value={`£${stats.revenue}`}
            trend="Gross revenue"
            trendUp={true}
            color="from-indigo-500 to-indigo-600"
          />
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2 rounded-xl shadow-lg p-6" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
              <FaChartLine style={{ color: 'var(--color-accent-primary)' }} />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/admin/products')}
                className="text-white py-3 px-4 rounded-lg font-semibold transition duration-300"
                style={{ backgroundColor: 'var(--color-accent-primary)' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-accent-light)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-accent-primary)'}
              >
                📦 Add New Product
              </button>
              <button
                onClick={() => navigate('/admin/orders')}
                className="text-white py-3 px-4 rounded-lg font-semibold transition duration-300"
                style={{ backgroundColor: 'var(--color-accent-primary)' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-accent-light)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-accent-primary)'}
              >
                📋 Manage Orders
              </button>
              <button
                onClick={() => navigate('/admin/categories')}
                className="text-white py-3 px-4 rounded-lg font-semibold transition duration-300"
                style={{ backgroundColor: 'var(--color-accent-primary)' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-accent-light)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-accent-primary)'}
              >
                🏷️ Manage Categories
              </button>
              <button
                onClick={() => navigate('/admin/analytics')}
                className="text-white py-3 px-4 rounded-lg font-semibold transition duration-300"
                style={{ backgroundColor: 'var(--color-accent-primary)' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-accent-light)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-accent-primary)'}
              >
                📊 View Analytics
              </button>
            </div>
          </div>

          {/* System Status */}
          <div className="rounded-xl shadow-lg p-6" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
            <h2 className="text-lg font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>System Status</h2>
            <div className="space-y-4">
              {[
                { label: 'Database', status: 'Online', color: 'var(--color-accent-primary)' },
                { label: 'API Server', status: 'Online', color: 'var(--color-accent-primary)' },
                { label: 'Backend', status: 'Running', color: 'var(--color-accent-primary)' },
                { label: 'Frontend', status: 'Active', color: 'var(--color-accent-primary)' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-text-light)' }}>{item.label}</span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--color-bg-section)', color: 'var(--color-accent-primary)' }}>
                    ✓ {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Panels: Recent Orders & Low Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 rounded-xl shadow-lg p-6" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Recent Orders</h2>
            {orders && orders.length > 0 ? (
              (() => {
                // show the filtered recent orders if a date range is active, otherwise recent orders
                const toYMD = (d) => {
                  if (!d) return null;
                  const dt = new Date(d);
                  if (isNaN(dt)) return null;
                  const y = dt.getFullYear();
                  const m = String(dt.getMonth() + 1).padStart(2, '0');
                  const day = String(dt.getDate()).padStart(2, '0');
                  return `${y}-${m}-${day}`;
                };
                const startY = toYMD(dateFrom);
                const endY = toYMD(dateTo);
                const filteredOrders = (orders || []).filter((o) => {
                  if (!startY && !endY) return true;
                  const createdY = toYMD(o.createdAt);
                  if (!createdY) return false;
                  if (startY && endY) return createdY >= startY && createdY <= endY;
                  if (startY) return createdY >= startY;
                  if (endY) return createdY <= endY;
                  return true;
                });
                const list = (startY || endY) ? filteredOrders : orders;
                return (
                  <ul className="space-y-3">
                    {list
                      .slice()
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .slice(0, 6)
                      .map((o) => (
                        <li key={o._id} className="flex items-center justify-between py-3" style={{ borderColor: 'var(--color-border-light)', borderBottomWidth: '1px' }}>
                          <div>
                            <div className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Order #{o._id.slice(-6)}</div>
                            <div className="text-xs" style={{ color: 'var(--color-text-light)' }}>{o.user?.email || o.user || '—'}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold" style={{ color: 'var(--color-accent-primary)' }}>£{(o.totalPrice || 0).toFixed(2)}</div>
                            <div className="text-xs" style={{ color: 'var(--color-text-light)' }}>{new Date(o.createdAt).toLocaleDateString()}</div>
                          </div>
                        </li>
                      ))}
                  </ul>
                );
              })()
            ) : (
              <p style={{ color: 'var(--color-text-primary)' }}>No orders yet.</p>
            )}
          </div>

          <div className="rounded-xl shadow-lg p-6" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Low Stock</h2>
            {products && products.length > 0 ? (
              <ul className="space-y-3">
                {products
                  .filter((p) => {
                    const baseStock = p.countInStock || p.stock || 0;
                    const hasLowVariant = p.variantCombinations && p.variantCombinations.some((v) => (v.stock || v.countInStock || baseStock) < 10);
                    return (baseStock < 20) || hasLowVariant;
                  })
                  .slice(0, 8)
                  .map((p) => (
                    <li key={p._id} className="flex items-center justify-between py-3" style={{ borderColor: 'var(--color-border-light)', borderBottomWidth: '1px' }}>
                      <div className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{p.name}</div>
                      <div className="text-xs" style={{ color: 'var(--color-text-light)' }}>Stock: {p.countInStock ?? p.stock ?? (p.variantCombinations?.[0]?.stock ?? '—')}</div>
                    </li>
                  ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--color-text-primary)' }}>No products available.</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
