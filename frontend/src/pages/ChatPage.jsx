import React from 'react';
import Chat from '../components/Chat';
import { useParams } from 'react-router-dom';

export default function ChatPage(){
  const { room } = useParams();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return (
    <div>
      <h2>Chat</h2>
      <p className="muted">Room: {room}</p>
      <Chat room={room} user={user} />
    </div>
  );
}
