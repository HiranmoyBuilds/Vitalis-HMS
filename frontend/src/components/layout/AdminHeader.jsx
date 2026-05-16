import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, Menu, Moon, Sun, User, Settings, LogOut, Clock, CheckCircle, Info, AlertTriangle, History, ShieldCheck, ChevronDown, Activity } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import socket from '../../utils/socket';
import API_URL from '../../config';
import { toast } from 'sonner';

const Header = () => {
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
      
      // Setup Socket
      socket.connect();
      socket.emit('join', user._id); // Join private room for notifications

      socket.on('newNotification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        toast.info(notification.title, {
          description: notification.message,
          icon: <Bell className="w-4 h-4 text-primary-600" />
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
    toast.success('Administrator signed out');
    navigate('/login/admin');
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
      case 'MedicalRecord': return Info;
      default: return AlertTriangle;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="h-20 bg-white/80 dark:bg-dark-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-dark-700 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40 transition-all duration-300">
      <div className="flex items-center gap-6">
        <button className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-800 md:hidden text-slate-600 dark:text-slate-300">
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative hidden lg:block">
          <Search className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search system records..."
            className="pl-11 pr-4 py-3 w-80 lg:w-[400px] rounded-2xl bg-slate-50 dark:bg-dark-800 border border-slate-100 dark:border-dark-700 focus:ring-2 focus:ring-primary-500 text-sm transition-all outline-none text-slate-900 dark:text-slate-100 font-medium"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-900/30">
          <Activity className="w-3.5 h-3.5" />
          System Active
        </div>

        <button 
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-slate-50 dark:bg-dark-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-700 transition-all shadow-sm"
          title="Toggle Theme"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2.5 rounded-xl bg-slate-50 dark:bg-dark-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-700 transition-all shadow-sm"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-3 h-3 bg-primary-600 rounded-full border-2 border-white dark:border-dark-800 animate-pulse"></span>
            )}
          </button>
          
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-4 w-96 bg-white dark:bg-dark-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-dark-700 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 z-50">
              <div className="p-6 border-b border-slate-100 dark:border-dark-700 flex justify-between items-center bg-slate-50/50 dark:bg-dark-800/50">
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-[10px]">Admin Alerts</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{unreadCount} unread system events.</p>
                </div>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-12 text-center flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-dark-700 rounded-full flex items-center justify-center text-slate-300">
                      <Bell className="w-6 h-6" />
                    </div>
                    <p className="text-slate-400 text-sm font-bold">System log is empty</p>
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
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 pl-4 border-l border-slate-200 dark:border-dark-700 relative" ref={profileRef}>
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight leading-none">{user?.name}</span>
            <span className="text-[9px] text-primary-600 dark:text-primary-400 font-black uppercase tracking-widest mt-1">{user?.role} Access</span>
          </div>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="focus:outline-none group relative"
          >
            <div className="w-11 h-11 rounded-2xl bg-primary-600 text-white flex items-center justify-center text-sm font-black shadow-lg shadow-primary-600/30 group-hover:scale-105 transition-all border-2 border-transparent group-hover:border-primary-100 dark:group-hover:border-primary-900/50">
              {getInitials(user?.name)}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-dark-900 rounded-full shadow-sm"></div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-4 w-64 bg-white dark:bg-dark-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-dark-700 py-3 animate-in fade-in slide-in-from-top-4 duration-300 z-50 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50 dark:border-dark-700 bg-slate-50/50 dark:bg-dark-800/50 sm:hidden">
                <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{user?.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest mt-1">{user?.role}</p>
              </div>
              <div className="p-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 rounded-2xl transition-all">
                  <User className="w-4 h-4" /> Admin Profile
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 rounded-2xl transition-all">
                  <Settings className="w-4 h-4" /> System Control
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 rounded-2xl transition-all">
                  <History className="w-4 h-4" /> Activity Log
                </button>
              </div>
              <div className="h-px bg-slate-100 dark:bg-dark-700 my-2 mx-4"></div>
              <div className="p-2">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-black text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all uppercase tracking-widest text-[10px]"
                >
                  <LogOut className="w-4 h-4" /> Terminate Session
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
