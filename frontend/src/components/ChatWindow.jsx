import React, { useEffect, useRef, useState } from 'react';
import client from '../api/api';
import '../styles/chat.css';
import ChatBubble from './ChatBubble';

export default function ChatWindow({ chatId }){
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingTempIds, setSendingTempIds] = useState([]);
  const bottomRef = useRef();
  const pollRef = useRef();
  const fileInputRef = useRef();

  const loadMessages = async () => {
    try{
      const res = await client.get(`/chat/${chatId}/messages`);
      setMessages(res.data || []);
      // mark read
      await client.patch(`/chat/${chatId}/read`);
    }catch(err){ console.error('loadMessages', err); }
  };

  useEffect(()=>{
    if (!chatId) return;
    setLoading(true);
    loadMessages().finally(()=>setLoading(false));

    pollRef.current = setInterval(loadMessages, 3000);
    return () => clearInterval(pollRef.current);
  }, [chatId]);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try{
      // create temporary message to show immediately
      const tempId = 'temp-' + Date.now();
      const meId = JSON.parse(localStorage.getItem('user')||'{}').id || JSON.parse(localStorage.getItem('user')||'{}')._id;
      const tempMsg = { _id: tempId, chatId, sender: meId, receiver: null, text, media: '', createdAt: new Date().toISOString(), read: false, sending: true };
      setMessages(prev => [...prev, tempMsg]);
      setSendingTempIds(prev => [...prev, tempId]);

      const res = await client.post(`/chat/${chatId}/message`, { text });
      setText('');
      // refresh messages from server
      await loadMessages();
      // remove temp id
      setSendingTempIds(prev => prev.filter(id => id !== tempId));
    }catch(err){ console.error('send', err); }
  };

  // Upload and send an image
  const handleFile = async (file) => {
    if (!file) return;
    try{
      const tempId = 'temp-' + Date.now();
      const meId = JSON.parse(localStorage.getItem('user')||'{}').id || JSON.parse(localStorage.getItem('user')||'{}')._id;
      const objectUrl = URL.createObjectURL(file);
      const tempMsg = { _id: tempId, chatId, sender: meId, receiver: null, text: '', media: objectUrl, createdAt: new Date().toISOString(), read: false, sending: true };
      setMessages(prev => [...prev, tempMsg]);
      setSendingTempIds(prev => [...prev, tempId]);

      const form = new FormData();
      form.append('file', file);
      const up = await client.post(`/chat/${chatId}/upload`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = up.data.url;
      // send message with media url
      await client.post(`/chat/${chatId}/message`, { media: url });
      await loadMessages();
      setSendingTempIds(prev => prev.filter(id => id !== tempId));
    }catch(err){ console.error('upload/send image', err); }
  };

  const onFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) handleFile(f);
    e.target.value = null;
  };

  return (
    <div className="chat-window">
      <div className="messages">
        {loading && <p>Loading messages...</p>}

        {/* Group messages by day */}
        {Object.entries(groupMessagesByDate(messages)).map(([day, msgs]) => (
          <div key={day} className="day-group">
            <div className="date-sep">{day}</div>
            {msgs.map(m => (
              <ChatBubble key={m._id} message={m} mine={m.sender === (JSON.parse(localStorage.getItem('user')||'{}').id || JSON.parse(localStorage.getItem('user')||'{}')._id)} />
            ))}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      <form className="chat-input" onSubmit={send}>
        <input aria-label="Message input" value={text} onChange={e=>setText(e.target.value)} placeholder="Write a message..." />
        <input type="file" ref={fileInputRef} onChange={onFileChange} style={{ display: 'none' }} accept="image/*" />
        <button type="button" onClick={() => fileInputRef.current?.click()} title="Attach image">📎</button>
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

// Helper: group messages by local date string
function groupMessagesByDate(messages){
  const groups = {};
  (messages || []).forEach(m => {
    const d = new Date(m.createdAt);
    const key = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(m);
  });
  return groups;
}
