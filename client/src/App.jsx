import React, { useEffect, useState, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { Provider, useDispatch } from 'react-redux'
import store from './redux/store'
import { AuthProvider } from './context/AuthContext'
import { ElementorBuilderProvider } from './context/ElementorBuilderContext'
import { fetchCart } from './redux/slices/cartSlice'
import { fetchWishlist } from './redux/slices/wishlistSlice'
import { useCartSync } from './hooks/useCartSync'
import { useWishlistSync } from './hooks/useWishlistSync'
import { restoreGuestId, saveGuestId } from './utils/guestIdManager'
import { installEnhancedFetch } from './utils/fetchWrapper'
import { initDebugTools } from './utils/guestIdDebug'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import ChatButton from './components/ChatButton/ChatButton'

// Lazy load pages for better performance
const Homepage = React.lazy(() => import('./pages/HomePage'))
const ProductsPage = React.lazy(() => import('./pages/ProductsPage'))
const ProductDetailPage = React.lazy(() => import('./pages/ProductDetailPage'))
const CategoriesPage = React.lazy(() => import('./pages/CategoriesPage'))
const CategoryDetailPage = React.lazy(() => import('./pages/CategoryDetailPage'))
const CartPage = React.lazy(() => import('./pages/CartPage'))
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage'))
const WishlistPage = React.lazy(() => import('./pages/WishlistPage'))
const AdminLoginPage = React.lazy(() => import('./pages/AdminLoginPage'))
const AboutUsPage = React.lazy(() => import('./pages/AboutUsPage'))
const ContactUsPage = React.lazy(() => import('./pages/ContactUsPage'))
const OrderDetailPage = React.lazy(() => import('./pages/OrderDetailPage'))
const OrderLookupPage = React.lazy(() => import('./pages/OrderLookupPage'))
const PoliciesShippingPage = React.lazy(() => import('./pages/policies/ShippingPage'))
const PoliciesReturnsPage = React.lazy(() => import('./pages/policies/ReturnsPage'))
const PoliciesPrivacyPage = React.lazy(() => import('./pages/policies/PrivacyPage'))
const PoliciesTermsPage = React.lazy(() => import('./pages/policies/TermsPage'))
const PoliciesFAQPage = React.lazy(() => import('./pages/policies/FAQPage'))

// Lazy load admin pages (only loaded when needed)
const AdminDashboardPage = React.lazy(() => import('./pages/admin/AdminDashboardPage'))
const AdminProductsPage = React.lazy(() => import('./pages/admin/AdminProductsPage'))
const AdminAddProductPage = React.lazy(() => import('./pages/admin/AdminAddProductPage'))
const AdminReviewsPage = React.lazy(() => import('./pages/admin/AdminReviewsPage'))
const AdminCollectionsPage = React.lazy(() => import('./pages/admin/AdminCollectionsPage'))
const AdminCategoriesPage = React.lazy(() => import('./pages/admin/AdminCategoriesPage'))
const AdminOrdersPage = React.lazy(() => import('./pages/admin/AdminOrdersPage'))
const AdminAnalyticsPage = React.lazy(() => import('./pages/admin/AdminAnalyticsPage'))
const AdminMenuPage = React.lazy(() => import('./pages/admin/AdminMenuPage'))
const AdminChatPage = React.lazy(() => import('./pages/admin/AdminChatPage'))
const AdminCouponsPage = React.lazy(() => import('./pages/admin/AdminCouponsPage'))
const PaymentOptionsPage = React.lazy(() => import('./pages/PaymentOptionsPage'))

// Route Protection Components
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import AdminRoute from './components/AdminRoute/AdminRoute'
import { ElementorBuilder, useElementorBuilder } from './components/ElementorBuilder'

import { Toaster } from 'react-hot-toast'

// Loading fallback component for lazy-loaded routes
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current mx-auto mb-4" style={{ borderColor: 'var(--color-accent-primary)' }}></div>
      <p style={{ color: 'var(--color-text-primary)' }}>Loading...</p>
    </div>
  </div>
)

const AppContent = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { isEditing: isElementorEditing } = useElementorBuilder();
  const [isPageLoading, setIsPageLoading] = useState(false);

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthPage = location.pathname === '/admin/login';

  // Initialize guest ID and fetch cart/wishlist on app load
  useEffect(() => {
    const initializeApp = async () => {
      const API = import.meta.env.VITE_API_URL || '';

      // Install enhanced fetch to capture X-Guest-ID headers
      installEnhancedFetch();

      // Initialize debug tools (mounted as window.__guestIdDebug)
      initDebugTools(API);

      // Restore guestId from localStorage (will be synced with server cookie)
      const restoredId = restoreGuestId();
      console.log('[App] Guest ID initialization complete:', restoredId ? 'Restored' : 'New');

      // Defer non-critical data fetching to avoid blocking initial render
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          // Fetch cart and wishlist when browser is idle
          dispatch(fetchCart());
          dispatch(fetchWishlist());
        }, { timeout: 3000 })
      } else {
        // Fallback for older browsers
        setTimeout(() => {
          dispatch(fetchCart());
          dispatch(fetchWishlist());
        }, 1000)
      }
    };

    initializeApp();
  }, [dispatch]);

  // Prevent page from scrolling to top on route change
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Show loading overlay when route changes
  useEffect(() => {
    setIsPageLoading(true);
    window.scrollTo(0, 0);
  }, [location]);

  // Hide loading after content loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [location]);

  // Auto-sync cart and wishlist whenever items change
  useCartSync();
  useWishlistSync();

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminRoute && !isAuthPage && !isElementorEditing && <Header hideMenu={location.pathname === '/'} />}
      <main className="grow relative">
        {/* Page transition loading overlay */}
        {isPageLoading && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-none">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current mx-auto mb-4" style={{ borderColor: 'var(--color-accent-primary)' }}></div>
              <p style={{ color: 'var(--color-text-primary)' }} className="font-medium">Loading page...</p>
            </div>
          </div>
        )}

        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Homepage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/category/:slug" element={<CategoryDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />

            <Route path="/about" element={<AboutUsPage />} />
            <Route path="/contact" element={<ContactUsPage />} />

            {/* Policy Routes */}
            <Route path="/policies/shipping" element={<PoliciesShippingPage />} />
            <Route path="/policies/returns-refund" element={<PoliciesReturnsPage />} />
            <Route path="/policies/privacy" element={<PoliciesPrivacyPage />} />
            <Route path="/policies/terms" element={<PoliciesTermsPage />} />
            <Route path="/policies/faq" element={<PoliciesFAQPage />} />
            <Route path="/payment-options" element={<PaymentOptionsPage />} />

            {/* Public Routes */}
            <Route path="/order-lookup" element={<OrderLookupPage />} />
            <Route path="/order/:id" element={<OrderDetailPage />} />

            {/* Admin Routes - Protected with Admin Access Check */}
            <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
            <Route path="/admin/products" element={<AdminRoute><AdminProductsPage /></AdminRoute>} />
            <Route path="/admin/categories" element={<AdminRoute><AdminCategoriesPage /></AdminRoute>} />
            <Route path="/admin/collections" element={<AdminRoute><AdminCollectionsPage /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
            <Route path="/admin/reviews" element={<AdminRoute><AdminReviewsPage /></AdminRoute>} />
            <Route path="/admin/analytics" element={<AdminRoute><AdminAnalyticsPage /></AdminRoute>} />
            <Route path="/admin/menu" element={<AdminRoute><AdminMenuPage /></AdminRoute>} />
            <Route path="/admin/chat" element={<AdminRoute><AdminChatPage /></AdminRoute>} />
            <Route path="/admin/coupons" element={<AdminRoute><AdminCouponsPage /></AdminRoute>} />
            <Route path="/admin/products/add" element={<AdminRoute><AdminAddProductPage /></AdminRoute>} />
            <Route path="/admin/products/edit/:id" element={<AdminRoute><AdminAddProductPage /></AdminRoute>} />
          </Routes>
        </Suspense>
      </main>

      {/* ElementorBuilder overlay */}
      <ElementorBuilder />

      {!isAdminRoute && !isAuthPage && !isElementorEditing && <Footer />}
      {!isAdminRoute && !isAuthPage && !isElementorEditing && <ChatButton />}
      <Toaster position="top-right" />
    </div>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <AuthProvider>
        <ElementorBuilderProvider>
          <Router>
            <AppContent />
          </Router>
        </ElementorBuilderProvider>
      </AuthProvider>
    </Provider>
  )
}

export default App