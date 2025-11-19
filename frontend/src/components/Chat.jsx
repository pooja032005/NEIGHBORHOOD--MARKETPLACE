import React, { useState } from "react";

export default function Chat() {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);

  const send = () => {
    if (!text.trim()) return;

    // Local-only message (no realtime backend)
    setMessages(prev => [
      ...prev, 
      { sender: "You", text, createdAt: new Date() }
    ]);

    setText("");
  };

  return (
    <div className="chat-wrap" style={{ padding: "20px" }}>
      <h3 style={{ color: "#333" }}>Chat Disabled</h3>
      <p style={{ color: "#777", marginBottom: "20px" }}>
        Real-time chat is turned off.<br />
        Enable Socket.IO to activate messaging.
      </p>

      <div className="messages" style={{ maxHeight: "250px", overflowY: "auto", marginBottom: "15px" }}>
        {messages.map((m, i) => (
          <div 
            key={i} 
            className="message mine"
            style={{
              padding: "10px",
              background: "#f0f0f0",
              marginBottom: "10px",
              borderRadius: "8px"
            }}
          >
            <div><strong>{m.sender}</strong></div>
            <div>{m.text}</div>
            <div style={{ fontSize: "11px", color: "#999" }}>
              {new Date(m.createdAt).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input" style={{ display: "flex", gap: "10px" }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Chat disabled..."
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}
        />
        <button 
          className="btn" 
          onClick={send}
          style={{
            padding: "10px 15px",
            background: "#4a90e2",
            borderRadius: "6px",
            color: "#fff",
            border: "none"
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
