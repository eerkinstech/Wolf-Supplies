import React, { useEffect, useState } from 'react'
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
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import ChatButton from './components/ChatButton/ChatButton'
import Homepage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CategoriesPage from './pages/CategoriesPage'
import CategoryDetailPage from './pages/CategoryDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import WishlistPage from './pages/WishlistPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AboutUsPage from './pages/AboutUsPage'
import ContactUsPage from './pages/ContactUsPage'
import OrderDetailPage from './pages/OrderDetailPage'
import OrderLookupPage from './pages/OrderLookupPage'
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
import AdminChatPage from './pages/admin/AdminChatPage'
import AdminCouponsPage from './pages/admin/AdminCouponsPage'
import PaymentOptionsPage from './pages/PaymentOptionsPage'

// Route Protection Components
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import AdminRoute from './components/AdminRoute/AdminRoute'
import { ElementorBuilder, useElementorBuilder } from './components/ElementorBuilder'

import { Toaster } from 'react-hot-toast'

const AppContent = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { isEditing: isElementorEditing } = useElementorBuilder();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthPage = location.pathname === '/admin/login';

  // Initialize guest ID and fetch cart/wishlist on app load
  useEffect(() => {
    const initializeApp = async () => {
      // Install enhanced fetch to capture X-Guest-ID headers
      installEnhancedFetch();

      // Restore guestId from localStorage (will be synced with server cookie)
      const restoredId = restoreGuestId();
// Delay to ensure guestId cookie is established with first request
      // This ensures server has time to set the httpOnly cookie before we fetch wishlist
      await new Promise(resolve => setTimeout(resolve, 300));

      // Fetch cart and wishlist
dispatch(fetchCart());
      dispatch(fetchWishlist());
    };

    initializeApp();
  }, [dispatch]);

  // Scroll to top whenever location changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  // Auto-sync cart and wishlist whenever items change
  useCartSync();
  useWishlistSync();

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