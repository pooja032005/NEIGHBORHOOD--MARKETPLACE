import React from 'react';
import '../styles/chat.css';

export default function ChatBubble({ message, mine }){
  const time = new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  const sending = message.sending || (typeof message._id === 'string' && message._id.startsWith('temp-'));

  return (
    <div className={`chat-bubble ${mine ? 'mine' : 'their'} ${sending ? 'sending' : ''}`} aria-live="polite">
      <div className="chat-text">
        {message.text}
        {message.media && (
          <div className="chat-image-wrap">
            <img src={message.media} alt="attachment" className="chat-image" />
          </div>
        )}
        {!message.text && !message.media && (message.media ? '📷 Image' : '')}
      </div>
      <div className="chat-meta">
        <span className="chat-time">{time}</span>
        {mine && (
          <span className="chat-seen">{message.read ? '✓✓' : '✓'}</span>
        )}
      </div>
    </div>
  );
}
