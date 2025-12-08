import React, { useEffect, useState } from 'react';
import ChatList from '../components/ChatList';
import ChatButton from '../components/ChatButton';
import client from '../api/api';
import '../styles/chat.css';

export default function ChatsPage(){
  const [sellers, setSellers] = useState([]);
  const [loadingSellers, setLoadingSellers] = useState(false);
  const [searchSeller, setSearchSeller] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      setLoadingSellers(true);
      const token = localStorage.getItem('token');
      const res = await client.get('/users/sellers', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setSellers(res.data || []);
    } catch (err) {
      console.error('Error fetching sellers:', err);
    } finally {
      setLoadingSellers(false);
    }
  };

  const filteredSellers = sellers.filter(seller =>
    seller.name.toLowerCase().includes(searchSeller.toLowerCase()) ||
    seller.email.toLowerCase().includes(searchSeller.toLowerCase())
  );

  return (
    <div className="chats-page">
      <header className="chats-hero">
        <h2>Messages</h2>
        <p>Conversations with sellers, providers, and neighbours</p>
      </header>

      {/* Chat with Sellers Section */}
      {user.role !== 'seller' && (
        <section className="sellers-chat-section">
          <div className="sellers-chat-header">
            <h3>🏪 Chat with Sellers</h3>
            <p>Start a conversation with any seller</p>
          </div>
          
          <div className="sellers-search">
            <input 
              type="text" 
              placeholder="🔍 Search sellers..." 
              value={searchSeller}
              onChange={(e) => setSearchSeller(e.target.value)}
              className="search-input"
            />
          </div>

          {loadingSellers ? (
            <p className="loading-text">Loading sellers...</p>
          ) : filteredSellers.length === 0 ? (
            <p className="no-data-text">No sellers found</p>
          ) : (
            <div className="sellers-grid">
              {filteredSellers.map(seller => (
                <div key={seller._id} className="seller-chat-card">
                  <div className="seller-card-avatar">
                    {seller.name?.charAt(0)?.toUpperCase() || 'S'}
                  </div>
                  <div className="seller-card-info">
                    <h4 className="seller-card-name">{seller.name}</h4>
                    <p className="seller-card-email">{seller.email}</p>
                    {seller.phone && <p className="seller-card-phone">📞 {seller.phone}</p>}
                  </div>
                  <ChatButton userId={seller._id}>
                    <span className="chat-btn-text">💬 Chat</span>
                  </ChatButton>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Existing Chat List */}
      <ChatList />
    </div>
  );
}
