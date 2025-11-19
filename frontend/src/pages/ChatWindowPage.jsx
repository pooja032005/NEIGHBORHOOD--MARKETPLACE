import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatWindow from '../components/ChatWindow';
import client from '../api/api';
import '../styles/chat.css';

export default function ChatWindowPage(){
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [chat, setChat] = useState(null);

  useEffect(()=>{
    const load = async () => {
      try{
        const res = await client.get('/chat');
        const found = (res.data || []).find(c => c._id === chatId);
        setChat(found || null);
      }catch(err){ console.error(err); }
    };
    load();
  }, [chatId]);

  const otherName = (() => {
    if (!chat) return 'Conversation';
    const meId = JSON.parse(localStorage.getItem('user') || '{}').id || JSON.parse(localStorage.getItem('user') || '{}')._id;
    const other = chat.participants.find(p => p._id !== meId) || {};
    return other.name || 'Conversation';
  })();
  const [isMobileFloating, setIsMobileFloating] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [pos, setPos] = useState({ x: 20, y: 80 });
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, origX: 0, origY: 0 });

  useEffect(() => {
    const onResize = () => setIsMobileFloating(window.innerWidth <= 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const onPointerDown = (e) => {
    dragRef.current.dragging = true;
    dragRef.current.startX = e.clientX || (e.touches && e.touches[0].clientX);
    dragRef.current.startY = e.clientY || (e.touches && e.touches[0].clientY);
    dragRef.current.origX = pos.x;
    dragRef.current.origY = pos.y;
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  };

  const onPointerMove = (e) => {
    if (!dragRef.current.dragging) return;
    const cx = e.clientX || (e.touches && e.touches[0].clientX);
    const cy = e.clientY || (e.touches && e.touches[0].clientY);
    const dx = cx - dragRef.current.startX;
    const dy = cy - dragRef.current.startY;
    setPos({ x: Math.max(8, dragRef.current.origX + dx), y: Math.max(8, dragRef.current.origY + dy) });
  };

  const onPointerUp = () => {
    dragRef.current.dragging = false;
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
  };

  const floatingStyle = isMobileFloating ? {
    position: 'fixed', right: '20px', bottom: '20px', width: '92%', maxWidth: '420px', zIndex: 1200, transform: `translate(${ - (100 - pos.x) }px, ${-pos.y}px)`
  } : {};

  // NOTE: for simplicity on mobile we render a compact draggable box
  if (isMobileFloating) {
    return (
      <div style={{ position: 'fixed', left: pos.x, top: pos.y, zIndex: 1400 }}>
        <div className="chat-floating-header" onPointerDown={onPointerDown} style={{ cursor: 'grab', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="chat-header-avatar">{otherName.charAt(0).toUpperCase()}</div>
          <div style={{ fontWeight: 700 }}>{otherName}</div>
          <div style={{ marginLeft: 8 }}>
            <button className="btn" onClick={() => setMinimized(!minimized)}>{minimized ? 'Open' : 'Min'}</button>
          </div>
        </div>
        {!minimized && (
          <div style={{ width: 360 }}>
            <ChatWindow chatId={chatId} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="chat-page-container">
      <div className="chat-header">
        <button className="btn-back" onClick={() => navigate('/chats')}>←</button>
        <div className="chat-header-info">
          <div className="chat-header-avatar">{otherName.charAt(0).toUpperCase()}</div>
          <div>
            <div className="chat-header-name">{otherName}</div>
            <div className="chat-header-sub">Online recently</div>
          </div>
        </div>
      </div>

      <div className="chat-window-wrap">
        <ChatWindow chatId={chatId} />
      </div>
    </div>
  );
}
