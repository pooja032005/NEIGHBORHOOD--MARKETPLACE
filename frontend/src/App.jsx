import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ItemCreate from './pages/ItemCreate';
import ItemList from './pages/ItemList';
import ItemDetail from './pages/ItemDetail';
import ServiceCreate from './pages/ServiceCreate';
import ServiceList from './pages/ServiceList';
import ServiceDetail from './pages/ServiceDetail';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import ProfileEdit from './pages/ProfileEdit';
import ChatPage from './pages/ChatPage';
import ChatsPage from './pages/Chats';
import ChatWindowPage from './pages/ChatWindowPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import ManageUsers from './pages/admin/ManageUsers';
import ManageItems from './pages/admin/ManageItems';
import ManageServices from './pages/admin/ManageServices';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminStats from './pages/admin/AdminStats';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import CategoryPage from "./pages/CategoryPage";
import Checkout from './pages/Checkout';
import CartPage from './pages/CartPage';
import Address from './pages/Address';
import Payment from './pages/Payment';
import OrderSuccess from './pages/OrderSuccess';
import HomeV2 from './pages/HomeV2';
import SellerDashboard from './pages/SellerDashboard';
import SellerAddProduct from './pages/SellerAddProduct';
import SellerProducts from './pages/SellerProducts';
import SellerProductEdit from './pages/SellerProductEdit';
import SellerOrders from './pages/SellerOrders';
import BuyerDashboard from './pages/BuyerDashboard';
import OrderDetail from './pages/OrderDetail';

function App() {
  return (
    <>
      <Navbar />
      <Toast />

      <main style={{ padding: 20 }}>
        <Routes>
          <Route path="/" element={<HomeV2 />} />
          <Route path="/home" element={<Home />} />

          {/* Items */}
          <Route path="/items" element={<ItemList />} />
          <Route path="/items/create" element={<ItemCreate />} />
          <Route path="/items/:id" element={<ItemDetail />} />

          {/* Services */}
          <Route path="/services" element={<ServiceList />} />
          <Route path="/services/create" element={<ServiceCreate />} />
          <Route path="/services/:id" element={<ServiceDetail />} />

          {/* Cart & Checkout */}
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/address" element={<Address />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/order-success" element={<OrderSuccess />} />

          {/* Categories */}
          <Route path="/category/:name" element={<CategoryPage />} />

          {/* Chat */}
          <Route path="/chats" element={<ChatsPage />} />
          <Route path="/chat/:chatId" element={<ChatWindowPage />} />
          <Route path="/chat/:room" element={<ChatPage />} />

          {/* User */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<ProfileEdit />} />
          <Route path="/edit-profile" element={<EditProfile />} />

          {/* Orders */}
          <Route path="/orders/:id" element={<OrderDetail />} />

          {/* Seller Dashboards */}
          <Route path="/seller/dashboard" element={<SellerDashboard />} />
          <Route path="/seller/add-product" element={<SellerAddProduct />} />
          <Route path="/seller/products" element={<SellerProducts />} />
          <Route path="/seller/products/:id/edit" element={<SellerProductEdit />} />
          <Route path="/seller/orders" element={<SellerOrders />} />

          {/* Buyer Dashboards */}
          <Route path="/buyer/dashboard" element={<BuyerDashboard />} />

          {/* Home V2 (Amazon-style) */}
          <Route path="/home-v2" element={<HomeV2 />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/register" element={<Register />} />

          {/* Admin - Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminProtectedRoute>
                <ManageUsers />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/items"
            element={
              <AdminProtectedRoute>
                <ManageItems />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/services"
            element={
              <AdminProtectedRoute>
                <ManageServices />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <AdminProtectedRoute>
                <AdminAnalytics />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/stats"
            element={
              <AdminProtectedRoute>
                <AdminStats />
              </AdminProtectedRoute>
            }
          />
          {/* Legacy admin route */}
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />
        </Routes>
      </main>
    </>
  );
}

export default App;
