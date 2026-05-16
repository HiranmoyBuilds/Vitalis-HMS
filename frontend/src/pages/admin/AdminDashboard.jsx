import React from 'react';
import { Users, BedDouble, CalendarCheck, Activity, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import PageTransition from '../../components/layout/PageTransition';

const AdminDashboard = () => {
  const metrics = [
    { title: 'Total Patients', value: '1,245', icon: Users, color: 'bg-blue-500', trend: '+12%', isUp: true },
    { title: 'Available Beds', value: '42 / 150', icon: BedDouble, color: 'bg-emerald-500', trend: '85%', isUp: true },
    { title: "Today's Appointments", value: '87', icon: CalendarCheck, color: 'bg-purple-500', trend: '15 remaining', isUp: false },
    { title: 'Active Staff', value: '112', icon: Activity, color: 'bg-orange-500', trend: '3 on leave', isUp: false },
  ];

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white transition-colors tracking-tight">Executive Overview</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 transition-colors font-medium">Welcome back, Dr. Sarah. Vitalis is running at optimal capacity.</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl font-bold shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-dark-700 flex items-center gap-2">
              Generate Report
            </button>
            <button className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg transition-all shadow-primary-600/20 hover:scale-105 active:scale-95 flex items-center gap-2">
              + Register Patient
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-dark-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-50 to-transparent dark:from-white/5 opacity-50 -mr-8 -mt-8 rounded-full"></div>
              
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest mb-1 transition-colors">{metric.title}</p>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white transition-colors tracking-tight">{metric.value}</h3>
                </div>
                <div className={`${metric.color} bg-opacity-10 dark:bg-opacity-20 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
                  <metric.icon className={`w-6 h-6 ${metric.color.replace('bg-', 'text-')}`} />
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-between relative z-10">
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold ${metric.isUp ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-slate-500 bg-slate-50 dark:bg-dark-700'}`}>
                   {metric.isUp ? <TrendingUp className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                   {metric.trend}
                </div>
                <button className="text-slate-400 hover:text-primary-600 transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-dark-700 lg:col-span-2 transition-colors duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Recent Patient Activity</h2>
              <button className="text-sm font-bold text-primary-600 hover:underline">View All Patients</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-dark-700 text-slate-400 font-black uppercase tracking-widest text-[10px]">
                    <th className="pb-4">Patient Name</th>
                    <th className="pb-4">Patient ID</th>
                    <th className="pb-4">Diagnosis</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-dark-700">
                  {[
                    { name: 'John Doe', id: 'PT-10024', diag: 'Hypertension', status: 'Stable', color: 'blue' },
                    { name: 'Alice Cooper', id: 'PT-10025', diag: 'Diabetes', status: 'In Review', color: 'purple' },
                    { name: 'Bob Wilson', id: 'PT-10026', diag: 'Fracture', status: 'Recovering', color: 'emerald' },
                    { name: 'Emma Watson', id: 'PT-10027', diag: 'Fever', status: 'Admitted', color: 'orange' }
                  ].map((row, i) => (
                    <tr key={i} className="group hover:bg-slate-50 dark:hover:bg-dark-700/50 transition-all">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl bg-${row.color}-100 dark:bg-${row.color}-900/30 text-${row.color}-600 dark:text-${row.color}-400 flex items-center justify-center font-black group-hover:scale-110 transition-transform`}>
                            {row.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">{row.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">Joined 2 days ago</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 font-mono text-xs text-slate-500 dark:text-slate-400">{row.id}</td>
                      <td className="py-4 text-slate-600 dark:text-slate-300 font-medium">{row.diag}</td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight ${
                          row.status === 'Stable' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' :
                          row.status === 'Admitted' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400' :
                          'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button className="text-slate-300 hover:text-primary-600 transition-colors p-1.5 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg">
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-dark-700 transition-colors duration-300">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">Today's Schedule</h2>
            <div className="space-y-4">
              {[0, 1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-50 dark:border-dark-700 hover:bg-slate-50 dark:hover:bg-dark-700 transition-all hover:shadow-sm group cursor-pointer">
                  <div className="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 p-2 rounded-xl text-center min-w-[3.5rem] group-hover:scale-105 transition-transform">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Oct</p>
                    <p className="text-xl font-black">1{i+2}</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">Jane Smith</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">10:00 AM • Routine Checkup</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-primary-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              ))}
              <button className="w-full py-3 text-sm font-bold text-slate-500 hover:text-primary-600 transition-colors bg-slate-50 dark:bg-dark-900 rounded-xl mt-4">
                View Full Calendar
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default AdminDashboard;
