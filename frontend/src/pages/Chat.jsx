import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Send, Sparkles, Leaf, Trash2, Loader2 } from 'lucide-react';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';

export default function Chat() {
  const { showToast } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatHistory = async () => {
    try {
      setPageLoading(true);
      const data = await api.getChatHistory();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching chat history:', error.message);
    } finally {
      setPageLoading(false);
    }
  };

  const handleSend = async (e, customMsg) => {
    if (e) e.preventDefault();
    const text = customMsg || input;
    if (!text.trim() || loading) return;

    const userMsg = { _id: Date.now().toString(), sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.sendChatMessage(text);
      setMessages((prev) => [...prev, res.aiResponse]);
    } catch (error) {
      showToast(error.message || 'Chat service encountered an error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (window.confirm('Are you sure you want to clear your conversation history? This cannot be undone.')) {
      try {
        setLoading(true);
        await api.clearChatHistory();
        setMessages([]);
        showToast('Chat history cleared.');
      } catch (error) {
        showToast(error.message || 'Failed to clear chat history', 'error');
      } finally {
        setLoading(false);
      }
    };
  };

  if (pageLoading) {
    return <LoadingSkeleton type="chat" />;
  }

  return (
    <div className="glass-panel rounded-2xl flex flex-col h-[calc(100vh-120px)] overflow-hidden shadow-2xl border border-gray-900">
      {/* Chat header */}
      <div className="p-4 border-b border-gray-900 bg-gray-950/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/15 p-2 rounded-full text-emerald-400">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">EcoBot</h4>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
              <span>Context Aware Assistant</span>
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleClear}
            className="p-2 text-gray-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all cursor-pointer"
            title="Clear Chat History"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto space-y-4">
            <Leaf className="h-10 w-10 text-emerald-500/30 animate-float" />
            <h4 className="font-bold text-white text-sm">Ask EcoBot Anything</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Ask about carbon footprint values, custom eco calculations, diet modifications, or sustainable shopping options.
            </p>
            <div className="w-full space-y-2 pt-2">
              {[
                { label: '🍔 Impact of meat-eating habits?', text: 'What is the environmental impact of eating meat daily?' },
                { label: '🚲 Cycling vs riding a scooter?', text: 'Is cycling better than using a scooter?' },
                { label: '💡 How to reduce home energy?', text: 'How can I reduce my home energy footprint?' }
              ].map((q) => (
                <button
                  key={q.text}
                  onClick={(e) => handleSend(e, q.text)}
                  className="w-full text-left p-3 rounded-xl border border-gray-900 hover:border-emerald-800 text-xs text-gray-400 hover:text-white hover:bg-emerald-500/5 transition-all cursor-pointer"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg._id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-tr-none'
                  : 'bg-gray-900 border border-gray-850 text-gray-200 rounded-tl-none font-medium'
              }`}>
                {msg.text}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-900 border border-gray-850 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-gray-500 flex items-center gap-2">
              <Loader2 className="animate-spin h-4 w-4 text-emerald-400" />
              <span>EcoBot is typing...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef}></div>
      </div>

      {/* Input form */}
      <form onSubmit={(e) => handleSend(e)} className="p-3 border-t border-gray-900 bg-gray-950/20 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
          placeholder="Ask EcoBot a sustainability question..."
        />
        <button
          type="submit"
          className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all cursor-pointer"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
