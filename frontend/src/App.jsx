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
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import CategoryPage from "./pages/CategoryPage";
import Checkout from './pages/Checkout';
import CartPage from './pages/CartPage';
import Address from './pages/Address';
import Payment from './pages/Payment';
import OrderSuccess from './pages/OrderSuccess';

function App() {
  return (
    <>
      <Navbar />
      <Toast />

      <main style={{ padding: 20 }}>
        <Routes>
          <Route path="/" element={<Home />} />

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

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
