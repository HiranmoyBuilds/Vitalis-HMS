import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Clock, Search, ShieldCheck, User, Loader2, Calendar } from 'lucide-react';
import PageTransition from '../../components/layout/PageTransition';
import { useAuth } from '../../context/AuthContext';
import socket from '../../utils/socket';
import API_URL from '../../config';
import { toast } from 'sonner';

const AdminMessages = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [contactsLoading, setContactsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchContacts = async (silent = false) => {
    if (!silent) setContactsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/messages/contacts/list`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setContacts(data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to sync active support tickets.');
    } finally {
      if (!silent) setContactsLoading(false);
    }
  };

  const fetchChatLog = async (contactId) => {
    setMessagesLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/messages/${contactId}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(data);
        
        // After opening, mark messages as read and silently update unread count badges in contacts list
        setContacts(prev => prev.map(c => c._id === contactId ? { ...c, unreadCount: 0 } : c));
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to sync patient transcripts.');
    } finally {
      setMessagesLoading(false);
    }
  };

  // Initial Load & Socket Connection
  useEffect(() => {
    if (user) {
      fetchContacts();

      socket.connect();
      socket.emit('join', user._id);

      return () => {
        socket.off('receiveMessage');
      };
    }
  }, [user]);

  // Handle incoming live message socket events
  useEffect(() => {
    if (user) {
      socket.on('receiveMessage', (message) => {
        const senderId = message.sender?._id || message.sender;
        // If message is from the patient we are currently viewing, append to thread
        if (selectedContact && senderId === selectedContact._id) {
          setMessages(prev => [...prev, message]);
          // Mark as read immediately on backend since thread is open
          fetch(`${API_URL}/api/messages/${selectedContact._id}`, {
            headers: { 'Authorization': `Bearer ${user.token}` }
          });
        }
        
        // Refresh contacts inbox to show last message preview & unread badges in real-time
        fetchContacts(true);
      });

      return () => {
        socket.off('receiveMessage');
      };
    }
  }, [user, selectedContact]);

  useEffect(() => {
    if (selectedContact) {
      fetchChatLog(selectedContact._id);
    }
  }, [selectedContact]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedContact) return;

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
          receiverId: selectedContact._id,
          content
        })
      });

      const messageData = await res.json();

      if (res.ok) {
        setMessages(prev => [...prev, messageData]);
        
        // Instantly sync preview in sidebar contacts
        fetchContacts(true);
      } else {
        toast.error(messageData.message || 'Failed to dispatch reply.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit message.');
    } finally {
      setSending(false);
    }
  };

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageTransition>
      <div className="h-[calc(100vh-12rem)] flex bg-white dark:bg-dark-800 rounded-3xl border border-slate-100 dark:border-dark-700 overflow-hidden shadow-sm transition-colors duration-300">
        
        {/* Left Pane - Active Patients */}
        <div className="w-full md:w-80 lg:w-96 border-r border-slate-100 dark:border-dark-700 flex flex-col shrink-0">
          {/* Search Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-dark-700 space-y-3 shrink-0">
            <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Active Threads</h2>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient roster..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-100 dark:border-dark-700 bg-slate-50/50 dark:bg-dark-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-semibold text-xs"
              />
            </div>
          </div>

          {/* Active Contact List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-50 dark:divide-dark-700/50">
            {contactsLoading ? (
              <div className="h-40 flex flex-col items-center justify-center gap-2 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="text-[10px] font-black uppercase tracking-wider">Syncing Support Inbox...</span>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p className="text-xs font-semibold leading-relaxed">No active inquiries match your query.</p>
              </div>
            ) : (
              filteredContacts.map((contact) => {
                const isSelected = selectedContact?._id === contact._id;
                const hasUnread = contact.unreadCount > 0;
                
                return (
                  <div
                    key={contact._id}
                    onClick={() => setSelectedContact(contact)}
                    className={`p-4 sm:p-5 flex gap-3.5 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-dark-900/40 relative ${
                      isSelected ? 'bg-slate-50 dark:bg-dark-900/60' : ''
                    }`}
                  >
                    {/* Active Highlight line */}
                    {isSelected && (
                      <div className="absolute top-0 bottom-0 left-0 w-1 bg-emerald-600"></div>
                    )}

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-dark-900 text-slate-600 dark:text-slate-300 flex items-center justify-center font-black text-xs shrink-0 shadow-inner">
                      {contact.name.split(' ').map(n => n[0]).join('')}
                    </div>

                    {/* Patient Card Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs truncate tracking-tight font-black ${
                          hasUnread ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                        }`}>
                          {contact.name}
                        </p>
                        
                        {contact.lastMessage && (
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0">
                            {new Date(contact.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>

                      <p className={`text-[10px] mt-1 truncate ${
                        hasUnread 
                          ? 'text-slate-900 dark:text-white font-extrabold' 
                          : 'text-slate-400 dark:text-slate-500 font-medium'
                      }`}>
                        {contact.lastMessage ? contact.lastMessage.content : 'No message log.'}
                      </p>
                    </div>

                    {/* Unread Counter Badge */}
                    {hasUnread && (
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-[9px] flex items-center justify-center shrink-0 shadow-sm shadow-emerald-600/20">
                        {contact.unreadCount}
                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane - Chat Window */}
        <div className="hidden md:flex flex-1 flex-col bg-slate-50/10 dark:bg-dark-900/10">
          {!selectedContact ? (
            // Empty State
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center max-w-sm mx-auto p-8">
              <div className="w-16 h-16 bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-dark-700 rounded-3xl flex items-center justify-center text-slate-300 dark:text-dark-600 shadow-inner">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white tracking-tight">Executive Live Chat</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1.5 leading-relaxed">
                  Select an active patient thread from the roster to begin secure consultation support.
                </p>
              </div>
            </div>
          ) : (
            // Chat Active Panel
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              
              {/* Active Header */}
              <div className="h-20 border-b border-slate-100 dark:border-dark-700 px-6 sm:px-8 flex items-center justify-between bg-white dark:bg-dark-800 shrink-0">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-dark-900 text-slate-600 dark:text-slate-300 flex items-center justify-center font-black text-xs shadow-inner">
                    {selectedContact.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white leading-none tracking-tight">{selectedContact.name}</h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1.5 leading-none">{selectedContact.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  HIPAA Secure Session
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar bg-slate-50/20 dark:bg-dark-900/10">
                {messagesLoading ? (
                  <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Syncing transcripts...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                    <MessageSquare className="w-6 h-6" />
                    <span className="text-xs font-semibold">No transaction records. Send a message below to start chatting.</span>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {messages.map((message) => {
                      const senderId = message.sender?._id || message.sender;
                      const isMe = senderId === user._id;
                      return (
                        <div key={message._id} className={`flex gap-3 max-w-[80%] ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                          
                          {/* Avatar */}
                          <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center font-black text-xs shadow-sm ${
                            isMe 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-slate-200 dark:bg-dark-700 text-slate-600 dark:text-slate-300'
                          }`}>
                            {isMe ? 'AD' : 'PT'}
                          </div>

                          <div className="space-y-1.5">
                            {/* Bubble */}
                            <div className={`p-4 rounded-3xl text-sm font-semibold leading-relaxed shadow-sm ${
                              isMe 
                                ? 'bg-emerald-600 text-white rounded-tr-none' 
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-dark-600'
                            }`}>
                              <p className="whitespace-pre-wrap">{message.content}</p>
                            </div>

                            {/* Time */}
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

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-4 sm:p-5 border-t border-slate-100 dark:border-dark-700 bg-white dark:bg-dark-800 flex items-center gap-4 shrink-0">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Send secure reply to ${selectedContact.name}...`}
                  className="flex-1 px-5 py-3.5 rounded-2xl border border-slate-100 dark:border-dark-700 bg-slate-50/50 dark:bg-dark-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-semibold text-sm"
                  required
                  disabled={messagesLoading}
                />
                <button
                  type="submit"
                  disabled={sending || messagesLoading || !inputText.trim()}
                  className="w-12 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20 hover:scale-[1.05] active:scale-95 transition-all outline-none shrink-0 disabled:opacity-50"
                >
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4.5 h-4.5" />}
                </button>
              </form>

            </div>
          )}
        </div>

      </div>
    </PageTransition>
  );
};

export default AdminMessages;
