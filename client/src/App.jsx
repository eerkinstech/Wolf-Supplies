import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './redux/store'
import { AuthProvider } from './context/AuthContext'
import { ElementorBuilderProvider } from './context/ElementorBuilderContext'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import Homepage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CategoriesPage from './pages/CategoriesPage'
import CategoryDetailPage from './pages/CategoryDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import WishlistPage from './pages/WishlistPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AuthFlipPage from './pages/AuthFlipPage'
import AboutUsPage from './pages/AboutUsPage'
import ContactUsPage from './pages/ContactUsPage'
import AccountPage from './pages/AccountPage'
import OrderDetailPage from './pages/OrderDetailPage'
import PoliciesShippingPage from './pages/policies/ShippingPage'
import PoliciesReturnsPage from './pages/policies/ReturnsPage'
import PoliciesPrivacyPage from './pages/policies/PrivacyPage'
import PoliciesTermsPage from './pages/policies/TermsPage'
import PoliciesFAQPage from './pages/policies/FAQPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminProductsPage from './pages/admin/AdminProductsPage'
import AdminAddProductPage from './pages/admin/AdminAddProductPage';
import AdminReviewsPage from './pages/admin/AdminReviewsPage';
import AdminCollectionsPage from './pages/admin/AdminCollectionsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage'
import AdminOrdersPage from './pages/admin/AdminOrdersPage'
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage'
import AdminMenuPage from './pages/admin/AdminMenuPage'

// Route Protection Components
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import AdminRoute from './components/AdminRoute/AdminRoute'
import { ElementorBuilder, useElementorBuilder } from './components/ElementorBuilder'

import { Toaster } from 'react-hot-toast'
import RouteTransition from './components/Transition/RouteTransition'

const AppContent = () => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { isEditing: isElementorEditing } = useElementorBuilder();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthPage = location.pathname === '/login' || location.pathname === '/admin/login' || location.pathname === '/register';

  // Show transition overlay when navigating (except on admin/auth pages)
  useEffect(() => {
    if (isAdminRoute || isAuthPage) {
      setIsTransitioning(false);
      return;
    }

    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 400);
    return () => clearTimeout(timer);
  }, [location.pathname, isAdminRoute, isAuthPage]);

  // Scroll to top whenever location changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminRoute && !isAuthPage && !isElementorEditing && <Header hideMenu={location.pathname === '/'} />}
      <main className="grow">
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
          <Route path="/login" element={<AuthFlipPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/register" element={<AuthFlipPage />} />

          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/contact" element={<ContactUsPage />} />

          {/* Policy Routes */}
          <Route path="/policies/shipping" element={<PoliciesShippingPage />} />
          <Route path="/policies/returns-refund" element={<PoliciesReturnsPage />} />
          <Route path="/policies/privacy" element={<PoliciesPrivacyPage />} />
          <Route path="/policies/terms" element={<PoliciesTermsPage />} />
          <Route path="/policies/faq" element={<PoliciesFAQPage />} />

          {/* Protected User Routes */}
          <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
          <Route path="/order/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />

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
          <Route path="/admin/products/add" element={<AdminRoute><AdminAddProductPage /></AdminRoute>} />
          <Route path="/admin/products/edit/:id" element={<AdminRoute><AdminAddProductPage /></AdminRoute>} />
        </Routes>
      </main>

      {/* ElementorBuilder overlay */}
      <ElementorBuilder />

      {/* Transition overlay (shows centered cart + spinner) */}
      <RouteTransition visible={isTransitioning && !isAdminRoute && !isAuthPage && !isElementorEditing} />

      {!isAdminRoute && !isAuthPage && !isElementorEditing && <Footer />}
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