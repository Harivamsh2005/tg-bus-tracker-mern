import React, { useState } from 'react';
import { HelpCircle, Send, MessageSquare, X, Search } from 'lucide-react';
import { FAQ_DATA } from '../data/tgData';

export default function SupportAndChatbot() {
  const [searchQuery, setSearchQuery] = useState('');
  const [contact, setContact] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  // Floating Chatbot State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Namaste! I am TGSRTC Smart Assistant. Ask me about routes, promo codes (GET100/FIRSTBUS), 75% refunds, or Digital Bus Passes!' }
  ]);

  const highlightText = (text, query) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} style={{ background: '#f59e0b', color: '#000', padding: '0 3px', borderRadius: 3 }}>{part}</mark>
      ) : (
        part
      )
    );
  };

  const filteredFaqs = FAQ_DATA.filter(
    f => f.q.toLowerCase().includes(searchQuery.toLowerCase()) || f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contact.email.includes('@') || contact.message.length < 10) {
      return alert('Please enter a valid email and at least 10 characters in your message.');
    }
    setSubmitted(true);
    setContact({ name: '', email: '', message: '' });
  };

  const handleChatSend = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const q = chatInput.toLowerCase();
    let reply = 'You can track 26+ Telangana stations live on the Map tab or book seats under Smart Ticket Booking.';
    if (q.includes('promo') || q.includes('discount') || q.includes('offer')) {
      reply = 'Use GET100 for ₹100 OFF, FIRSTBUS for 15% OFF, or FESTIVE20 for 20% OFF!';
    } else if (q.includes('cancel') || q.includes('refund')) {
      reply = 'Cancelling an upcoming ticket in My Bookings automatically refunds 75% of the fare.';
    } else if (q.includes('pass') || q.includes('student')) {
      reply = 'Open the Digital Bus Pass Portal to apply for Student (₹150/mo) or General (₹850/mo) passes and download an ID-Card PDF.';
    }
    setMessages([...messages, { from: 'user', text: chatInput }, { from: 'bot', text: reply }]);
    setChatInput('');
  };

  return (
    <>
      <div className="grid-2">
        {/* Live Searchable FAQs with Keyword Highlighting */}
        <div className="card">
          <div className="card-title">
            <span><HelpCircle size={18} style={{ verticalAlign: 'middle' }} /> Live Searchable FAQs</span>
          </div>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <div style={{ position: 'relative' }}>
              <input
                style={{ width: '100%', paddingLeft: 36 }}
                placeholder="Search refund, promo, pass, GPS..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredFaqs.map((item, idx) => (
              <div key={idx} className="bus-item" style={{ cursor: 'default' }}>
                <strong style={{ color: '#60a5fa' }}>{highlightText(item.q, searchQuery)}</strong>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: 6, lineHeight: 1.5 }}>
                  {highlightText(item.a, searchQuery)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support Form */}
        <div className="card">
          <div className="card-title">Contact 24/7 Telangana Transit Support</div>
          {submitted && (
            <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', padding: 12, borderRadius: 10, marginBottom: 14, color: '#34d399' }}>
              ✅ Support ticket logged! Our Warangal/Hyderabad command desk will reply shortly.
            </div>
          )}
          <form onSubmit={handleContactSubmit}>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label>Your Name *</label>
              <input required value={contact.name} onChange={e => setContact({ ...contact, name: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label>Email Address *</label>
              <input type="email" required value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label>Issue / Query (min 10 chars) *</label>
              <textarea
                rows={4}
                required
                style={{ background: '#0f172a', border: '1px solid #334155', color: '#f8fafc', padding: 10, borderRadius: 8 }}
                value={contact.message}
                onChange={e => setContact({ ...contact, message: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              <Send size={15} /> Submit Support Request
            </button>
          </form>
        </div>
      </div>

      {/* FLOATING SMART ASSISTANT CHATBOT */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9998 }}>
        {chatOpen ? (
          <div className="card" style={{ width: 330, marginBottom: 0, border: '1px solid #3b82f6', boxShadow: '0 10px 30px rgba(0,0,0,0.7)' }}>
            <div className="card-title" style={{ marginBottom: 10 }}>
              <span>🤖 TG-Assist Chatbot</span>
              <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }} onClick={() => setChatOpen(false)}><X size={18} /></button>
            </div>
            <div style={{ height: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10, paddingRight: 4 }}>
              {messages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: m.from === 'user' ? 'flex-end' : 'flex-start',
                    background: m.from === 'user' ? '#2563eb' : '#1e293b',
                    padding: '8px 12px',
                    borderRadius: 10,
                    fontSize: '0.82rem',
                    maxWidth: '85%'
                  }}
                >
                  {m.text}
                </div>
              ))}
            </div>
            <form onSubmit={handleChatSend} style={{ display: 'flex', gap: 6 }}>
              <input style={{ flex: 1 }} placeholder="Ask anything..." value={chatInput} onChange={e => setChatInput(e.target.value)} />
              <button type="submit" className="btn btn-primary" style={{ padding: '8px 12px' }}><Send size={14} /></button>
            </form>
          </div>
        ) : (
          <button className="btn btn-primary" style={{ borderRadius: 999, padding: '14px 20px', boxShadow: '0 6px 20px rgba(37,99,235,0.6)' }} onClick={() => setChatOpen(true)}>
            <MessageSquare size={18} /> Smart Assistant
          </button>
        )}
      </div>
    </>
  );
}