import React from 'react';
import ChatList from '../components/ChatList';
import '../styles/chat.css';

export default function ChatsPage(){
  return (
    <div className="chats-page">
      <header className="chats-hero">
        <h2>Messages</h2>
        <p>Conversations with sellers, providers, and neighbours</p>
      </header>
      <ChatList />
    </div>
  );
}
