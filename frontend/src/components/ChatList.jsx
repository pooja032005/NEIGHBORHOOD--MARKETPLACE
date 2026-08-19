import React, { useEffect, useState } from 'react';
import '../styles/chat.css';
import client from '../api/api';
import { useNavigate } from 'react-router-dom';

export default function ChatList(){
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recent');
  const navigate = useNavigate();

  const load = async () => {
    try{
      setLoading(true);
      const res = await client.get('/chat');
      setChats(res.data || []);
    }catch(err){
      console.error('Error loading chats', err);
    }finally{ setLoading(false); }
  };

  useEffect(()=>{ load(); }, []);

  const sortedChats = [...chats].sort((left, right) => {
    const direction = sortBy === 'oldest' ? 1 : -1;
    return direction * (new Date(left.updatedAt || 0) - new Date(right.updatedAt || 0));
  });

  return (
    <section className="chat-list">
      <div className="conversation-heading">
        <div>
          <div className="conversation-title"><span className="section-icon" aria-hidden="true">▣</span><h2>Your Conversations</h2></div>
          <button onClick={load} className="refresh-btn" type="button">↻ Refresh</button>
        </div>
        <label className="sort-control">Sort by:
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sort conversations">
            <option value="recent">Recent</option>
            <option value="oldest">Oldest</option>
          </select>
        </label>
      </div>
      {loading && <p>Loading...</p>}
      {!loading && chats.length === 0 && (
        <div className="conversation-empty">
          <div className="conversation-illustration" aria-hidden="true"><span>•••</span><b>▰</b></div>
          <h3>No conversations yet</h3>
          <p>Start a conversation with a seller or service provider to see your messages here.</p>
          <button type="button" className="explore-btn" onClick={() => navigate('/items')}>↗ Explore Sellers</button>
        </div>
      )}
      <ul>
        {sortedChats.map(chat => {
          const meId = JSON.parse(localStorage.getItem('user')||'{}').id || JSON.parse(localStorage.getItem('user')||'{}')._id;
          const other = (chat.participants || []).find(p => p._id !== meId) || { name: 'Conversation' };
          return (
            <li key={chat._id} className="chat-list-item" onClick={() => navigate(`/chat/${chat._id}`)}>
              <div className="avatar">{other?.name?.charAt(0)?.toUpperCase()||'U'}<span className="online-dot" aria-label="Online recently" /></div>
              <div className="meta">
                <div className="name">{other?.name || 'Conversation'}</div>
                <div className="last">{chat.lastMessage || 'No messages yet'}</div>
              </div>
              <div className="right">
                <div className="time">{new Date(chat.updatedAt).toLocaleString()}</div>
                {chat.unread > 0 && <div className="badge">{chat.unread}</div>}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
