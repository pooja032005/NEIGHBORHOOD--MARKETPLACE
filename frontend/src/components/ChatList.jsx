import React, { useEffect, useState } from 'react';
import '../styles/chat.css';
import client from '../api/api';
import { useNavigate } from 'react-router-dom';

export default function ChatList(){
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="chat-list">
      <h2>Your Conversations</h2>
      <button onClick={load} className="btn">Refresh</button>
      {loading && <p>Loading...</p>}
      {!loading && chats.length === 0 && <p>No conversations yet.</p>}
      <ul>
        {chats.map(chat => {
          const meId = JSON.parse(localStorage.getItem('user')||'{}').id || JSON.parse(localStorage.getItem('user')||'{}')._id;
          const other = (chat.participants || []).find(p => p._id !== meId) || { name: 'Conversation' };
          return (
            <li key={chat._id} className="chat-list-item" onClick={() => navigate(`/chat/${chat._id}`)}>
              <div className="avatar">{other?.name?.charAt(0)?.toUpperCase()||'U'}</div>
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
    </div>
  );
}
