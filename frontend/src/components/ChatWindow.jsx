import React, { useEffect, useRef, useState } from 'react';
import client from '../api/api';
import '../styles/chat.css';
import ChatBubble from './ChatBubble';

// Auto-generated buyer questions
const QUICK_QUESTIONS = [
  "Is this item still available?",
  "What is the current condition of the item?",
  "Can you provide more photos?",
  "Is the price negotiable?",
  "What is your best offer?",
  "Where is the item located?",
  "Can you deliver it?",
  "What are the delivery charges?",
  "When can I pick it up?",
  "Has this item been used? For how long?",
  "Are there any defects or issues?",
  "Do you have the original box/receipt?",
  "Why are you selling this?",
  "Can I see it in person before buying?",
  "What payment methods do you accept?",
];

// Seller quick reply templates - matching buyer questions
const SELLER_QUICK_REPLIES = [
  "Yes, this item is still available! Feel free to ask any questions you have.",
  "The item is in excellent condition with minimal signs of use. Well-maintained and fully functional.",
  "Sure! I can provide more photos from any angle. Please let me know what you'd like to see.",
  "Yes, the price is negotiable. I'm open to reasonable offers. What's your budget?",
  "My best price would be [amount]. This includes everything shown in the photos.",
  "I'm located in [Your Neighborhood/Area]. The item is available for viewing at my place.",
  "Yes, I can arrange delivery within the city. Delivery charges depend on your location.",
  "Delivery charges are ₹[amount] for nearby areas. For farther locations, we can discuss rates.",
  "You can pick it up anytime from [Time] to [Time]. Just let me know when you'd like to come.",
  "This item has been gently used for [duration]. It's been well-cared for and works perfectly.",
  "No defects or issues at all. The item is in perfect working condition. You can inspect before buying.",
  "Yes, I have the original box, receipt, and all accessories. Everything will be included.",
  "I'm selling this because [I upgraded/moving/no longer need it]. The item works great!",
  "Absolutely! You're welcome to inspect the item in person before making any commitment.",
  "I accept Cash, UPI (Google Pay/PhonePe/Paytm), Bank Transfer, or any method you prefer.",
  "The warranty is still valid until [date]. I'll transfer all documents to you.",
  "Free delivery available within [radius]. For other areas, minimal delivery charges apply.",
  "The item comes with [list accessories]. Everything you need is included in the price.",
  "I can demonstrate the product working when you visit. Full inspection is welcome.",
  "First come, first served. If you're seriously interested, I can hold it for 24 hours with a token amount.",
];

// Auto-reply patterns for sellers (intelligent keyword matching)
const AUTO_REPLIES = {
  "is this item still available": "Yes, this item is still available! Feel free to ask any questions.",
  "still available": "Yes, it's available! Let me know if you'd like to see it.",
  "available": "Yes, this is currently available for purchase.",
  "condition": "The item is in good condition. I can share more details or photos if needed.",
  "more photos": "Sure! I can send you more photos. What specific angles would you like to see?",
  "price negotiable": "There's some room for negotiation depending on your offer. What's your budget?",
  "best offer": "I'm open to reasonable offers. What price did you have in mind?",
  "delivery": "I can discuss delivery options. What's your location?",
  "pick up": "Pick up is available. When would be a convenient time for you?",
  "location": "I'm located in [Your Area]. Where are you based?",
  "payment": "I accept cash, UPI, and bank transfer. What works best for you?",
  "defects": "No major defects. The item is fully functional and well-maintained.",
  "warranty": "I can provide details about any remaining warranty. Let me check.",
  "original box": "I can confirm if I have the original packaging and accessories.",
  "meet": "Yes, we can arrange a meeting to inspect the item. What time works for you?",
};

export default function ChatWindow({ chatId }){
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingTempIds, setSendingTempIds] = useState([]);
  const [showQuickQuestions, setShowQuickQuestions] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showAutoReply, setShowAutoReply] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const bottomRef = useRef();
  const pollRef = useRef();
  const fileInputRef = useRef();

  // Check if current user is a seller
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setIsSeller(user.role === 'seller' || user.role === 'admin');
  }, []);

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

  const send = async (e, customText = null) => {
    e?.preventDefault();
    const messageText = customText || text;
    if (!messageText.trim()) return;
    try{
      // create temporary message to show immediately
      const tempId = 'temp-' + Date.now();
      const meId = JSON.parse(localStorage.getItem('user')||'{}').id || JSON.parse(localStorage.getItem('user')||'{}')._id;
      const tempMsg = { _id: tempId, chatId, sender: meId, receiver: null, text: messageText, media: '', createdAt: new Date().toISOString(), read: false, sending: true };
      setMessages(prev => [...prev, tempMsg]);
      setSendingTempIds(prev => [...prev, tempId]);

      const res = await client.post(`/chat/${chatId}/message`, { text: messageText });
      setText('');
      setShowQuickQuestions(false);
      setShowQuickReplies(false);
      // refresh messages from server
      await loadMessages();
      // remove temp id
      setSendingTempIds(prev => prev.filter(id => id !== tempId));
    }catch(err){ console.error('send', err); }
  };

  // Auto-reply suggestion based on incoming message
  const getAutoReplySuggestion = (incomingText) => {
    const lowerText = incomingText.toLowerCase();
    for (const [key, reply] of Object.entries(AUTO_REPLIES)) {
      if (lowerText.includes(key)) {
        return reply;
      }
    }
    return null;
  };

  // Check if last message needs auto-reply suggestion
  useEffect(() => {
    if (messages.length === 0 || !isSeller) return;
    const lastMsg = messages[messages.length - 1];
    const meId = JSON.parse(localStorage.getItem('user')||'{}').id || JSON.parse(localStorage.getItem('user')||'{}')._id;
    
    // If last message is from other person, check for auto-reply (only for sellers)
    if (lastMsg.sender !== meId && lastMsg.text) {
      const suggestion = getAutoReplySuggestion(lastMsg.text);
      if (suggestion) {
        setShowAutoReply(suggestion);
      } else {
        setShowAutoReply(false);
      }
    } else {
      setShowAutoReply(false);
    }
  }, [messages, isSeller]);

  const handleQuickQuestion = (question) => {
    setText(question);
    setShowQuickQuestions(false);
  };

  const handleQuickReply = (reply) => {
    setText(reply);
    setShowQuickReplies(false);
  };

  const handleAutoReply = (reply) => {
    setText(reply);
    setShowAutoReply(false);
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

      {/* Auto-Reply Suggestion */}
      {showAutoReply && isSeller && (
        <div className="auto-reply-suggestion">
          <div className="auto-reply-header">
            <span>💡 Suggested Reply:</span>
            <button onClick={() => setShowAutoReply(false)} className="close-suggestion">✕</button>
          </div>
          <div className="auto-reply-content">
            <p>{showAutoReply}</p>
            <button onClick={() => handleAutoReply(showAutoReply)} className="use-suggestion-btn">
              ✓ Use this reply
            </button>
          </div>
        </div>
      )}

      {/* Quick Questions Panel for Buyers */}
      {showQuickQuestions && !isSeller && (
        <div className="quick-questions-panel">
          <div className="quick-questions-header">
            <span>❓ Quick Questions</span>
            <button onClick={() => setShowQuickQuestions(false)} className="close-questions">✕</button>
          </div>
          <div className="quick-questions-grid">
            {QUICK_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickQuestion(q)}
                className="quick-question-btn"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Replies Panel for Sellers */}
      {showQuickReplies && isSeller && (
        <div className="quick-questions-panel seller-replies-panel">
          <div className="quick-questions-header">
            <span>💬 Quick Replies</span>
            <button onClick={() => setShowQuickReplies(false)} className="close-questions">✕</button>
          </div>
          <div className="quick-questions-grid">
            {SELLER_QUICK_REPLIES.map((reply, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickReply(reply)}
                className="quick-question-btn seller-reply-btn"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      <form className="chat-input" onSubmit={send}>
        {/* Show different button based on user role */}
        {!isSeller ? (
          <button 
            type="button" 
            onClick={() => setShowQuickQuestions(!showQuickQuestions)} 
            className="quick-questions-toggle"
            title="Quick Questions"
          >
            ❓
          </button>
        ) : (
          <button 
            type="button" 
            onClick={() => setShowQuickReplies(!showQuickReplies)} 
            className="quick-questions-toggle seller-replies-toggle"
            title="Quick Replies"
          >
            💬
          </button>
        )}
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
