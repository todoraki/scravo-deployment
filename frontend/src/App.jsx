import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/Layout/MainLayout';
import RoleSelection from './pages/RoleSelection/RoleSelection';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Marketplace from './pages/Marketplace/Marketplace';
import ListingDetail from './pages/ListingDetail/ListingDetail';
import CreateListing from './pages/CreateListing/CreateListing';
import MyListings from './pages/MyListings/MyListings';
import CreateOrder from './pages/CreateOrder/CreateOrder';
import MyOrders from './pages/MyOrders/MyOrders';
import Offers from './pages/Offers/Offers';
import Settings from './pages/Settings/Settings';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminListings from './pages/Admin/AdminListings';
import AdminOrders from './pages/Admin/AdminOrders';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<RoleSelection />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Marketplace />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/listing/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ListingDetail />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-listing"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CreateListing />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-listings"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <MyListings />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-order"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CreateOrder />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-orders"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <MyOrders />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/offers"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Offers />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Settings />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AdminUsers />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/listings"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AdminListings />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AdminOrders />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;