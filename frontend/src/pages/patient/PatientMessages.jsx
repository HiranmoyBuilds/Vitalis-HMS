import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, ShieldCheck, Heart, User, Clock, Loader2, ArrowRight } from 'lucide-react';
import PageTransition from '../../components/layout/PageTransition';
import { useAuth } from '../../context/AuthContext';
import socket from '../../utils/socket';
import API_URL from '../../config';
import { toast } from 'sonner';

const PatientMessages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/api/messages/admin`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to sync support chat history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchChatHistory();

      // Connect to Socket.io and join personal channel
      socket.connect();
      socket.emit('join', user._id);

      // Listen for incoming support messages
      socket.on('receiveMessage', (message) => {
        // Ensure we only capture messages targeted to us from the admin
        if (message.sender._id !== user._id) {
          setMessages(prev => [...prev, message]);
        }
      });

      return () => {
        socket.off('receiveMessage');
      };
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setSending(true);
    const content = inputText.trim();
    setInputText('');

    try {
      const res = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          receiverId: 'admin',
          content
        })
      });

      const messageData = await res.json();

      if (res.ok) {
        setMessages(prev => [...prev, messageData]);
        
        // Broadcast the message in real-time via Socket.io
        socket.emit('sendMessage', messageData);
      } else {
        toast.error(messageData.message || 'Failed to dispatch message.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Connection error sending message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <PageTransition>
      <div className="h-[calc(100vh-12rem)] flex flex-col bg-white dark:bg-dark-800 rounded-3xl border border-slate-100 dark:border-dark-700 overflow-hidden shadow-sm transition-colors duration-300">
        
        {/* Support Room Header */}
        <div className="h-20 border-b border-slate-100 dark:border-dark-700 px-6 sm:px-8 flex items-center justify-between bg-slate-50/50 dark:bg-dark-800/50 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center shadow-inner relative">
              <MessageSquare className="w-5.5 h-5.5" />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-dark-800 animate-ping"></span>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-dark-800"></span>
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white leading-none tracking-tight">Clinical Support Desk</h2>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Administration Support • Online</p>
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            HIPAA Compliant Session
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar bg-slate-50/30 dark:bg-dark-900/10">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
              <p className="text-xs font-bold uppercase tracking-wider">Syncing support archives...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-center max-w-sm mx-auto">
              <div className="w-16 h-16 bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-dark-700 rounded-3xl flex items-center justify-center text-slate-300 dark:text-dark-600 shadow-inner">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white tracking-tight">Support Consultation</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1.5 leading-relaxed">
                  Welcome to Vitalis support. Write a message below to securely consult with the administration.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => {
                const isMe = message.sender._id === user._id;
                return (
                  <div key={message._id} className={`flex gap-3 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                    
                    {/* User Avatar */}
                    <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center font-black text-xs shadow-sm ${
                      isMe 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-slate-200 dark:bg-dark-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      {isMe ? 'ME' : 'AD'}
                    </div>

                    <div className="space-y-1.5">
                      {/* Message Bubble */}
                      <div className={`p-4 rounded-3xl text-sm font-semibold leading-relaxed shadow-sm ${
                        isMe 
                          ? 'bg-primary-600 text-white rounded-tr-none' 
                          : 'bg-white dark:bg-dark-700 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-dark-600'
                      }`}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>

                      {/* Timestamp */}
                      <div className={`flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest ${
                        isMe ? 'justify-end' : 'justify-start'
                      }`}>
                        <Clock className="w-3 h-3" />
                        <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Footer */}
        <form onSubmit={handleSendMessage} className="p-4 sm:p-6 border-t border-slate-100 dark:border-dark-700 bg-white dark:bg-dark-800 flex items-center gap-4 shrink-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a secure message to support desk..."
            className="flex-1 px-5 py-4 rounded-2xl border border-slate-100 dark:border-dark-700 bg-slate-50/50 dark:bg-dark-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all font-semibold text-sm"
            required
            disabled={loading}
          />
          <button
            type="submit"
            disabled={sending || loading || !inputText.trim()}
            className="w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary-600/20 hover:scale-[1.05] active:scale-95 transition-all outline-none shrink-0 disabled:opacity-50"
          >
            {sending ? <Loader2 className="w-5.5 h-5.5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>

      </div>
    </PageTransition>
  );
};

export default PatientMessages;
