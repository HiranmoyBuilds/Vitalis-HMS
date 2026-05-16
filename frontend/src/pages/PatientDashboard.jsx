import React, { useState, useEffect } from 'react';
import { CalendarDays, FileText, Activity, Clock, ArrowUpRight, TrendingUp, ShieldCheck, Heart, ArrowRight, Bell, Zap } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import PageTransition from '../components/layout/PageTransition';
import { useAuth } from '../context/AuthContext';

const PatientDashboard = () => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [queueData, setQueueData] = useState({ position: null, waitTime: null });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleQueueUpdate = (data) => {
      setQueueData(data);
      setIsUpdating(true);
      setTimeout(() => setIsUpdating(false), 1500);
    };

    socket.on('queue_update', handleQueueUpdate);

    return () => {
      socket.off('queue_update', handleQueueUpdate);
    };
  }, [socket]);

  return (
    <PageTransition>
      <div className="space-y-10 max-w-7xl mx-auto pb-10">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white transition-colors tracking-tight">
               Hello, <span className="text-primary-600">{user?.name?.split(' ')[0] || 'Patient'}</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Your health summary is updated for today.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 text-[10px] font-black uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4" />
                Medical Identity Verified
             </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[
            { label: 'Next Appointment', value: 'Oct 14, 10:00 AM', sub: 'Dr. Sarah Jenkins', icon: CalendarDays, color: 'blue' },
            { label: 'Clinical Records', value: 'Blood Work', sub: 'Status: Completed', icon: FileText, color: 'emerald', link: true },
            { label: 'Live Queue Position', value: queueData.position !== null ? `Token #${queueData.position}` : 'Awaiting Data', sub: queueData.waitTime !== null ? `Wait: ${queueData.waitTime} mins` : 'Calculating...', icon: Zap, color: 'amber', pulse: true, dynamic: true },
            { label: 'Health Index', value: '98/100', sub: 'Condition: Excellent', icon: Heart, color: 'rose' }
          ].map((stat, i) => (
            <div 
              key={i} 
              className={`bg-white dark:bg-dark-800 p-8 rounded-[2.5rem] shadow-sm border transition-all duration-500 group hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden ${stat.dynamic && isUpdating ? 'border-amber-400 shadow-amber-400/20 ring-4 ring-amber-400/10 scale-[1.02]' : 'border-slate-100 dark:border-dark-700/50'}`}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-500/5 rounded-full -mr-8 -mt-8`}></div>
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className={`p-4 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400 rounded-2xl group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon className={`w-6 h-6 ${stat.pulse ? 'animate-pulse' : ''}`} />
                </div>
                {stat.link && <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500 transition-colors" />}
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">{stat.label}</p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1 relative z-10 tracking-tight">{stat.value}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium relative z-10">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Main Content Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Queue & Appointment Focus */}
           <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-dark-800 rounded-[3rem] p-10 shadow-sm border border-slate-100 dark:border-dark-700/50 transition-all hover:shadow-xl group">
                 <div className="flex items-center justify-between mb-10">
                    <div>
                       <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Upcoming Consultation</h2>
                       <p className="text-slate-500 text-sm font-medium">Real-time status of your next visit.</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-dark-900 rounded-2xl border border-slate-100 dark:border-dark-700">
                       <Bell className="w-5 h-5 text-slate-400" />
                    </div>
                 </div>

                 <div className={`flex flex-col md:flex-row items-center gap-8 p-8 bg-slate-50 dark:bg-dark-900/50 rounded-[2rem] border transition-all duration-700 ${isUpdating ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-900/10' : 'border-slate-100 dark:border-dark-700'}`}>
                    <div className="w-24 h-24 bg-primary-600 rounded-3xl flex flex-col items-center justify-center text-white shadow-2xl shadow-primary-600/30 rotate-3">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Oct</span>
                       <span className="text-3xl font-black leading-none">14</span>
                    </div>
                    
                    <div className="flex-1 text-center md:text-left">
                       <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Dr. Sarah Jenkins</h4>
                       <p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">Chief Cardiologist • 10:00 AM</p>
                       <div className="flex items-center justify-center md:justify-start gap-4 mt-6">
                          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200/50">
                             <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                             {queueData.position !== null ? `Waitlisted (Token #${queueData.position})` : 'Syncing...'}
                          </span>
                       </div>
                    </div>

                    <div className="flex flex-col gap-3 w-full md:w-auto">
                       <button className="w-full px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl hover:scale-105 transition-all">Check In</button>
                       <button className="w-full px-8 py-4 bg-white dark:bg-dark-800 border border-slate-100 dark:border-dark-700 text-slate-500 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-50 transition-all">Reschedule</button>
                    </div>
                 </div>
              </div>
           </div>

           {/* Side Actions / Insights */}
           <div className="space-y-6">
              <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-[3rem] p-10 text-white shadow-2xl shadow-primary-600/20 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                 <h3 className="text-2xl font-black tracking-tight mb-4 relative z-10">Vitalis SecurePay</h3>
                 <p className="text-primary-100 text-sm font-medium leading-relaxed mb-8 relative z-10">You have 1 pending invoice for your laboratory diagnostics.</p>
                 <button className="w-full py-5 bg-white text-primary-600 font-black uppercase tracking-widest text-[10px] rounded-[1.5rem] shadow-xl shadow-black/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 relative z-10">
                    Review & Settle <ArrowRight className="w-4 h-4" />
                 </button>
              </div>

              <div className="bg-white dark:bg-dark-800 rounded-[3rem] p-10 shadow-sm border border-slate-100 dark:border-dark-700/50 group">
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest text-[10px]">Health Insights</h3>
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                 </div>
                 <div className="space-y-6">
                    {[
                       { label: 'Systolic Pressure', value: '120 mmHg', status: 'Normal', color: 'emerald' },
                       { label: 'Heart Rate', value: '72 BPM', status: 'Optimal', color: 'emerald' },
                       { label: 'Blood Glucose', value: '95 mg/dL', status: 'Target', color: 'emerald' }
                    ].map((item, i) => (
                       <div key={i} className="flex items-center justify-between">
                          <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                             <p className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{item.value}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-${item.color}-50 dark:bg-${item.color}-900/20 text-${item.color}-600 dark:text-${item.color}-400 border border-${item.color}-100 dark:border-${item.color}-900/30`}>{item.status}</span>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default PatientDashboard;
