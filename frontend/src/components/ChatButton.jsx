import React from 'react';
import client from '../api/api';
import { useNavigate } from 'react-router-dom';

export default function ChatButton({ userId, itemId, serviceId, children }){
  const navigate = useNavigate();

  const start = async () => {
    try{
      const res = await client.post('/chat/start', { userId, itemId, serviceId });
      const chatId = res.data.chatId;
      navigate(`/chat/${chatId}`);
    }catch(err){
      console.error('Error starting chat', err);
      alert(err.response?.data?.message || 'Unable to start chat');
    }
  };

  return (
    <button className="chat-btn" onClick={start}>{children || 'Message'}</button>
  );
}
