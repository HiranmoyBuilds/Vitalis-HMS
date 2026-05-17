import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home,
  CalendarDays,
  FileText,
  CreditCard,
  Video,
  MessageSquare,
  Stethoscope,
  ChevronRight,
  ShieldCheck,
  Activity,
  Heart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PatientSidebar = ({ isOpen, setIsOpen }) => {
  const { user } = useAuth();
  
  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const menuItems = [
    { name: 'Dashboard', icon: Home, path: '/patient' },
    { name: 'Appointments', icon: CalendarDays, path: '/patient/appointments' },
    { name: 'Health Records', icon: FileText, path: '/patient/records' },
    { name: 'Virtual Clinic', icon: Video, path: '/patient/telemedicine' },
    { name: 'Billing & Payments', icon: CreditCard, path: '/patient/billing' },
    { name: 'Communication', icon: MessageSquare, path: '/patient/messages' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)} 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside className={`w-80 bg-slate-900 text-slate-400 h-screen flex flex-col border-r border-white/5 fixed inset-y-0 left-0 lg:sticky z-50 transition-all duration-300 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Brand Header */}
        <div className="h-24 flex items-center px-8 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/20 rotate-3">
               <Heart className="w-6 h-6 text-white fill-current" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tighter leading-none">VITALIS</h1>
              <p className="text-[9px] font-black text-primary-500 uppercase tracking-[0.2em] mt-1">Patient Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-10 px-6 space-y-8">
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 mb-4">Main Navigation</p>
            <ul className="space-y-1.5">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    end={item.path === '/patient'}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                    `flex items-center justify-between group px-5 py-4 rounded-2xl transition-all duration-300 ${
                      isActive 
                        ? 'bg-primary-600 text-white shadow-2xl shadow-primary-600/30 font-black' 
                        : 'hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-4">
                    <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 duration-300`} />
                    <span className="text-sm tracking-tight">{item.name}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1`} />
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Support Section */}
        <div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 mb-4">Clinical Support</p>
          <div className="px-4">
             <div className="bg-slate-800/40 border border-white/5 p-5 rounded-3xl group cursor-pointer hover:bg-slate-800 transition-all">
                <div className="flex items-center gap-3 mb-3">
                   <div className="w-8 h-8 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center">
                      <Stethoscope className="w-4 h-4" />
                   </div>
                   <span className="text-xs font-black text-white uppercase tracking-widest">Emergency</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-4">Need immediate medical assistance? Connect with our response team.</p>
                <button className="w-full py-2 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">Connect Now</button>
             </div>
          </div>
        </div>
      </nav>

      {/* Footer / Profile */}
      <div className="p-8 mt-auto">
        <div className="bg-white/5 p-4 rounded-[2rem] border border-white/5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center text-sm font-black shadow-lg shadow-primary-600/30">
                {getInitials(user?.name)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-black text-white truncate leading-none mb-1">{user?.name || 'Mark Roberts'}</p>
              <div className="flex items-center gap-1.5">
                 <ShieldCheck className="w-3 h-3 text-primary-500" />
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Verified Account</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
};

export default PatientSidebar;
