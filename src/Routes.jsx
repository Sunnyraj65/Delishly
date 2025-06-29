import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import { AuthProvider } from "contexts/AuthContext";
import ProtectedRoute from "components/ProtectedRoute";
import ErrorBoundary from "components/ErrorBoundary";

// Page imports
import Homepage from "pages/homepage";
import ProductSelection from "pages/product-selection";
import CustomizationCuttingOptions from "pages/customization-cutting-options";
import ShoppingCartCheckout from "pages/shopping-cart-checkout";
import OrderTrackingStatus from "pages/order-tracking-status";
import UserAccountProfile from "pages/user-account-profile";
import CustomerProtected from "components/CustomerProtected";

// Admin pages
import AdminLogin from "pages/admin/Login";
import AdminLayout from "pages/admin/Layout";
import AdminCategories from "pages/admin/Categories";
import Products from "pages/admin/Products";
import NotFound from "pages/NotFound";

const Routes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <ScrollToTop />
          <RouterRoutes>
            <Route path="/" element={<Homepage />} />
            <Route path="/homepage" element={<Homepage />} />
            <Route path="/product-selection" element={<ProductSelection />} />
            <Route path="/customization-cutting-options" element={<CustomizationCuttingOptions />} />
            <Route path="/shopping-cart-checkout" element={<ShoppingCartCheckout />} />
            <Route path="/order-tracking-status" element={<OrderTrackingStatus />} />
            <Route path="/user-account-profile" element={<CustomerProtected><UserAccountProfile /></CustomerProtected>} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route path="categories" element={<AdminCategories />} />
              <Route path="products" element={<Products />} />
            </Route>
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Routes;