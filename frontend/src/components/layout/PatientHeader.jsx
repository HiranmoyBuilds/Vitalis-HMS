import React, { useState, useRef, useEffect } from 'react';
import { Bell, Menu, Moon, Sun, User, Settings, LogOut, History, Clock, CheckCircle, FileText, Info, AlertTriangle, ShieldCheck, ChevronDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import socket from '../../utils/socket';
import API_URL from '../../config';
import { toast } from 'sonner';

const PatientHeader = ({ toggleSidebar }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (res.ok) setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      socket.connect();
      socket.emit('join', user._id);

      socket.on('newNotification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        toast.info(notification.title, {
          description: notification.message,
          action: {
            label: 'View',
            onClick: () => navigate('/patient/notifications')
          }
        });
      });

      return () => {
        socket.off('newNotification');
        socket.disconnect();
      };
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully');
    navigate('/login/patient');
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`${API_URL}/api/notifications/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getIcon = (type) => {
    switch(type) {
      case 'Appointment': return Clock;
      case 'Billing': return CheckCircle;
      case 'MedicalRecord': return FileText;
      default: return AlertTriangle;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="h-20 bg-white/80 dark:bg-dark-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-dark-700 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40 transition-all duration-300">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-800 lg:hidden text-slate-600 dark:text-slate-300 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block">
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Vitalis <span className="text-primary-600">🤍</span> <span className="font-bold text-slate-400">Patient</span>
          </h2>
        </div>
      </div>
      
      <div className="flex items-center gap-3 sm:gap-6">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/30">
          <ShieldCheck className="w-3.5 h-3.5" />
          Secure Session
        </div>

        <button 
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-slate-50 dark:bg-dark-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-700 transition-all shadow-sm"
          title="Toggle Theme"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2.5 rounded-xl bg-slate-50 dark:bg-dark-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-700 transition-all shadow-sm"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-3 h-3 bg-primary-600 rounded-full border-2 border-white dark:border-dark-800 animate-bounce"></span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-4 w-96 bg-white dark:bg-dark-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-dark-700 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 z-50">
              <div className="p-6 border-b border-slate-100 dark:border-dark-700 flex justify-between items-center bg-slate-50/50 dark:bg-dark-800/50">
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-[10px]">Notifications</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">You have {unreadCount} unread updates.</p>
                </div>
                {unreadCount > 0 && (
                  <button className="text-[10px] font-black text-primary-600 uppercase hover:underline">Mark all read</button>
                )}
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-12 text-center flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-dark-700 rounded-full flex items-center justify-center text-slate-300">
                      <Bell className="w-6 h-6" />
                    </div>
                    <p className="text-slate-400 text-sm font-bold">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const Icon = getIcon(n.type);
                    return (
                      <div 
                        key={n._id} 
                        onClick={() => markAsRead(n._id)}
                        className={`p-5 hover:bg-slate-50 dark:hover:bg-dark-700/50 cursor-pointer border-b border-slate-50 dark:border-dark-700/50 last:border-0 transition-colors relative group ${!n.isRead ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''}`}
                      >
                        <div className="flex gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${!n.isRead ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'bg-slate-100 dark:bg-dark-700 text-slate-400'}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <p className={`text-sm ${!n.isRead ? 'font-black text-slate-900 dark:text-white' : 'font-bold text-slate-700 dark:text-slate-300'}`}>{n.title}</p>
                              {!n.isRead && <div className="w-2 h-2 bg-primary-600 rounded-full"></div>}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">{n.message}</p>
                            <p className="text-[9px] text-slate-400 mt-2 font-black uppercase tracking-widest">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="p-4 bg-slate-50 dark:bg-dark-800/80 border-t border-slate-100 dark:border-dark-700 text-center">
                <button className="text-xs font-black text-slate-500 hover:text-primary-600 transition-colors uppercase tracking-widest">View All Notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1 pr-4 rounded-2xl bg-slate-50 dark:bg-dark-800 hover:bg-slate-100 dark:hover:bg-dark-700 transition-all border border-slate-100 dark:border-dark-700 shadow-sm group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center text-sm font-black shadow-lg shadow-primary-600/30 group-hover:scale-105 transition-transform">
              {getInitials(user?.name)}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-black text-slate-900 dark:text-white leading-none">{user?.name?.split(' ')[0]}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Patient</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-4 w-64 bg-white dark:bg-dark-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-dark-700 py-3 animate-in fade-in slide-in-from-top-4 duration-300 z-50 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50 dark:border-dark-700 bg-slate-50/50 dark:bg-dark-800/50">
                <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{user?.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest mt-1">{user?.email}</p>
              </div>
              <div className="p-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 rounded-2xl transition-all">
                  <User className="w-4 h-4" /> My Health Profile
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 rounded-2xl transition-all">
                  <Settings className="w-4 h-4" /> Account Settings
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 rounded-2xl transition-all">
                  <History className="w-4 h-4" /> Visit Records
                </button>
              </div>
              <div className="h-px bg-slate-100 dark:bg-dark-700 my-2 mx-4"></div>
              <div className="p-2">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-black text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all uppercase tracking-widest text-[10px]"
                >
                  <LogOut className="w-4 h-4" /> Secure Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default PatientHeader;
