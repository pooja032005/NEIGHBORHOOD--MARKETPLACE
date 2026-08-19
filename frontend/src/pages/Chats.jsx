import React, { useEffect, useMemo, useState } from 'react';
import ChatList from '../components/ChatList';
import ChatButton from '../components/ChatButton';
import client from '../api/api';
import '../styles/chat.css';

export default function ChatsPage(){
  const [sellers, setSellers] = useState([]);
  const [loadingSellers, setLoadingSellers] = useState(false);
  const [searchSeller, setSearchSeller] = useState('');
  const [sellerFilter, setSellerFilter] = useState('All Sellers');
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

  const filteredSellers = useMemo(() => sellers.filter(seller => {
    const query = searchSeller.trim().toLowerCase();
    return !query || [seller.name, seller.email].some(value =>
      String(value || '').toLowerCase().includes(query)
    );
  }), [sellers, searchSeller]);

  return (
    <div className="chats-page">
      <header className="chats-hero">
        <div className="hero-decoration hero-dots" aria-hidden="true" />
        <div className="hero-decoration hero-leaves" aria-hidden="true">❧</div>
        <div className="hero-decoration hero-flight" aria-hidden="true">⌁　✈</div>
        <div className="hero-icon" aria-hidden="true">▣</div>
        <h1>Messages</h1>
        <p>Conversations with sellers, providers, and neighbours</p>
      </header>

      {/* Chat with Sellers Section */}
      {user.role !== 'seller' && (
        <section className="sellers-chat-section">
          <div className="seller-discovery">
            <div className="sellers-chat-header">
              <div className="section-icon" aria-hidden="true">▣</div>
              <div>
                <h2>Chat with Sellers</h2>
                <p>Start a conversation with any seller</p>
              </div>
            </div>

            <div className="sellers-search">
              <span aria-hidden="true">⌕</span>
              <label className="sr-only" htmlFor="seller-search">Search sellers</label>
              <input
                id="seller-search"
                type="search"
                placeholder="Search sellers..."
              value={searchSeller}
              onChange={(e) => setSearchSeller(e.target.value)}
              className="search-input"
              />
            </div>

            <div className="seller-filters" aria-label="Seller filters">
              {['All Sellers', 'Recent', 'Top Rated', 'Nearby', 'Following'].map(filter => (
                <button
                  type="button"
                  key={filter}
                  className={sellerFilter === filter ? 'filter-chip active' : 'filter-chip'}
                  onClick={() => setSellerFilter(filter)}
                >{filter}</button>
              ))}
            </div>

            {loadingSellers ? (
              <p className="loading-text">Loading sellers...</p>
            ) : filteredSellers.length > 0 ? (
              <div className="sellers-grid">
                {filteredSellers.map(seller => (
                  <div key={seller._id} className="seller-chat-card">
                    <div className="seller-card-avatar">{seller.name?.charAt(0)?.toUpperCase() || 'S'}</div>
                    <div className="seller-card-info">
                      <h3 className="seller-card-name">{seller.name}</h3>
                      <p className="seller-card-email">{seller.email}</p>
                    </div>
                    <ChatButton userId={seller._id}>
                      <span className="chat-btn-text">Chat</span>
                    </ChatButton>
                  </div>
                ))}
              </div>
            ) : (
              <div className="seller-empty-state">
                <div className="seller-illustration" aria-hidden="true"><span>▰</span><i>•••</i></div>
                <h3>No sellers found</h3>
                <p>Try searching for a seller or explore recommended ones.</p>
              </div>
            )}
          </div>
          <div className="seller-divider" aria-hidden="true" />
          <div className="seller-panel-art" aria-hidden="true"><span>✦</span><b>⌂</b><em>•</em></div>
        </section>
      )}

      {/* Existing Chat List */}
      <ChatList />
    </div>
  );
}
