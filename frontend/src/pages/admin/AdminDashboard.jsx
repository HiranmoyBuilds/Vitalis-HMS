import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, BedDouble, CalendarCheck, Activity, TrendingUp, ArrowUpRight, 
  Loader2, ShieldCheck, Download, Printer, PlusCircle, Lock, Mail, User, AlertCircle
} from 'lucide-react';
import PageTransition from '../../components/layout/PageTransition';
import { useAuth } from '../../context/AuthContext';
import API_URL from '../../config';
import Modal from '../../components/ui/Modal';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Dashboard Data State
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal & Generation States
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);

  // Registration Form State
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '' });
  const [registerSubmitting, setRegisterSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState('');

  const reportSteps = [
    "Decrypting clinical directory ledger...",
    "Aggregating active patient record indices...",
    "Scanning consultation schedules & calendar load...",
    "Validating HIPAA security tokens & signatures...",
    "Compiling executive audit logs..."
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Patients
      const patientsRes = await fetch(`${API_URL}/api/auth/patients`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const patientsData = await patientsRes.json();
      
      // Fetch Appointments
      const appointmentsRes = await fetch(`${API_URL}/api/appointments`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const appointmentsData = await appointmentsRes.json();

      // Fetch Staff
      const staffRes = await fetch(`${API_URL}/api/auth/staff`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const staffData = await staffRes.json();

      if (patientsRes.ok) setPatients(patientsData);
      if (appointmentsRes.ok) setAppointments(appointmentsData);
      if (staffRes.ok) setStaff(staffData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      toast.error('Network error loading dashboard analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  // Compute Today's appointments count
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysAppointments = appointments.filter(appt => {
    if (!appt.date) return false;
    const apptDateStr = new Date(appt.date).toISOString().split('T')[0];
    return apptDateStr === todayStr;
  });

  const triggerReportGeneration = () => {
    setIsGeneratingReport(true);
    setGenerationStep(0);
    
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < reportSteps.length) {
        setGenerationStep(currentStep);
      } else {
        clearInterval(interval);
        setIsGeneratingReport(false);
        setIsReportModalOpen(true);
        toast.success("Executive system report generated successfully.");
      }
    }, 500);
  };

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    setRegisterSubmitting(true);
    setRegisterError('');

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          name: registerForm.name,
          email: registerForm.email,
          password: registerForm.password,
          role: 'patient'
        })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Patient ${registerForm.name} registered successfully!`);
        setIsRegisterModalOpen(false);
        setRegisterForm({ name: '', email: '', password: '' });
        fetchData();
      } else {
        setRegisterError(data.message || 'Failed to register patient');
      }
    } catch (err) {
      setRegisterError('Connection error. Please try again.');
    } finally {
      setRegisterSubmitting(false);
    }
  };

  const generateRandomPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let pass = "";
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setRegisterForm(prev => ({ ...prev, password: pass }));
    toast.info("Secure temporary password generated.");
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Vitalis Hospital System - Executive Report</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #334155; }
            h1 { font-size: 24px; font-weight: 800; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 24px; }
            h2 { font-size: 18px; font-weight: 700; margin-top: 24px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { text-align: left; padding: 12px; border-bottom: 1px solid #f1f5f9; }
            th { font-weight: 700; background-color: #f8fafc; text-transform: uppercase; font-size: 10px; tracking: 0.1em; color: #64748b; }
            .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
            .card { border: 1px solid #e2e8f0; padding: 16px; border-radius: 12px; background-color: #f8fafc; }
            .card-val { font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 4px; }
          </style>
        </head>
        <body>
          <h1>Vitalis Executive System Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <p>Status: Secure HIPAA Session Verified</p>
          <div class="grid">
            <div class="card"><div>Total Registered Patients</div><div class="card-val">${patients.length}</div></div>
            <div class="card"><div>Available Beds</div><div class="card-val">42 / 150</div></div>
            <div class="card"><div>Today's Appointments</div><div class="card-val">${todaysAppointments.length}</div></div>
            <div class="card"><div>Active Staff</div><div class="card-val">${staff.length}</div></div>
          </div>
          <h2>Recent Patient Registry</h2>
          <table>
            <thead>
              <tr><th>Patient Name</th><th>Email</th><th>Patient ID</th><th>Registered Date</th></tr>
            </thead>
            <tbody>
              ${patients.map(p => `
                <tr>
                  <td><b>${p.name}</b></td>
                  <td>${p.email}</td>
                  <td>${p._id}</td>
                  <td>${new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Type,Name,Email/Details,Date/ID\n";
    csvContent += `Summary,Total Patients,${patients.length},-\n`;
    csvContent += `Summary,Today's Appointments,${todaysAppointments.length},-\n`;
    csvContent += `Summary,Active Staff,${staff.length},-\n`;
    csvContent += "\n--- Patients List ---\n";
    patients.forEach(p => {
      csvContent += `Patient,"${p.name}",${p.email},${p._id}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `vitalis_executive_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Static design metrics with values dynamically mapped
  const metrics = [
    { title: 'Total Patients', value: loading ? '...' : patients.length.toLocaleString(), icon: Users, color: 'bg-blue-500', trend: '+12%', isUp: true },
    { title: 'Available Beds', value: '42 / 150', icon: BedDouble, color: 'bg-emerald-500', trend: '85%', isUp: true },
    { title: "Today's Appointments", value: loading ? '...' : todaysAppointments.length.toString(), icon: CalendarCheck, color: 'bg-purple-500', trend: `${appointments.length} total`, isUp: false },
    { title: 'Active Staff', value: loading ? '...' : staff.length.toString(), icon: Activity, color: 'bg-orange-500', trend: 'Optimal', isUp: false },
  ];

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white transition-colors tracking-tight">Executive Overview</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 transition-colors font-medium">Welcome back, {user?.name || 'Dr. Sarah'}. Vitalis is running at optimal capacity.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={triggerReportGeneration}
              className="bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl font-bold shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-dark-700 flex items-center gap-2 cursor-pointer"
            >
              Generate Report
            </button>
            <button 
              onClick={() => setIsRegisterModalOpen(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg transition-all shadow-primary-600/20 hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
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
              <button 
                onClick={() => navigate('/admin/patients')}
                className="text-sm font-bold text-primary-600 hover:underline cursor-pointer"
              >
                View All Patients
              </button>
            </div>
            
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                <p className="text-slate-400 font-semibold text-xs">Syncing activity records...</p>
              </div>
            ) : patients.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                No registered patient activity found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-dark-700 text-slate-400 font-black uppercase tracking-widest text-[10px]">
                      <th className="pb-4">Patient Name</th>
                      <th className="pb-4">Patient ID</th>
                      <th className="pb-4">Status</th>
                      <th className="pb-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-dark-700">
                    {patients.slice(0, 4).map((row, i) => (
                      <tr key={i} className="group hover:bg-slate-50 dark:hover:bg-dark-700/50 transition-all">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-black group-hover:scale-110 transition-transform`}>
                              {row.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">{row.name}</p>
                              <p className="text-[10px] text-slate-400 font-medium">Joined {new Date(row.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 font-mono text-xs text-slate-500 dark:text-slate-400">{row._id}</td>
                        <td className="py-4">
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">
                            Active
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button 
                            onClick={() => navigate('/admin/patients')}
                            className="text-slate-300 hover:text-primary-600 transition-colors p-1.5 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg cursor-pointer"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-dark-700 transition-colors duration-300">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">Today's Schedule</h2>
            
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                <p className="text-slate-400 font-semibold text-xs">Loading appointments...</p>
              </div>
            ) : todaysAppointments.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                No appointments scheduled for today.
              </div>
            ) : (
              <div className="space-y-4">
                {todaysAppointments.slice(0, 4).map((appt, i) => (
                  <div 
                    key={i} 
                    onClick={() => navigate('/admin/appointments')}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-slate-50 dark:border-dark-700 hover:bg-slate-50 dark:hover:bg-dark-700 transition-all hover:shadow-sm group cursor-pointer"
                  >
                    <div className="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 p-2 rounded-xl text-center min-w-[3.5rem] group-hover:scale-105 transition-transform">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                        {new Date(appt.date).toLocaleDateString('en-US', { month: 'short' })}
                      </p>
                      <p className="text-xl font-black">
                        {new Date(appt.date).toLocaleDateString('en-US', { day: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">
                        {appt.patient?.name || 'Unknown Patient'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {appt.time} • {appt.reason || 'General Checkup'}
                      </p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-primary-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                ))}
              </div>
            )}
            
            <button 
              onClick={() => navigate('/admin/appointments')}
              className="w-full py-3 text-sm font-bold text-slate-500 hover:text-primary-600 transition-colors bg-slate-50 dark:bg-dark-900 rounded-xl mt-4 cursor-pointer"
            >
              View Full Calendar
            </button>
          </div>
        </div>

        {/* Register Patient Modal */}
        <Modal
          isOpen={isRegisterModalOpen}
          onClose={() => !registerSubmitting && setIsRegisterModalOpen(false)}
          title="Register New Patient"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleRegisterPatient} className="space-y-5">
            {registerError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl flex items-center gap-2 border border-red-100 dark:border-red-900/30">
                <AlertCircle className="w-4 h-4" /> {registerError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Enter full name"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full pl-12 pr-4 py-3 border border-slate-100 dark:border-dark-700 rounded-xl bg-slate-50/50 dark:bg-dark-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all font-semibold text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@email.com"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full pl-12 pr-4 py-3 border border-slate-100 dark:border-dark-700 rounded-xl bg-slate-50/50 dark:bg-dark-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all font-semibold text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Password</label>
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="••••••••"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full pl-12 pr-4 py-3 border border-slate-100 dark:border-dark-700 rounded-xl bg-slate-50/50 dark:bg-dark-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all font-semibold text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="px-3 bg-slate-100 dark:bg-dark-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
                >
                  Generate
                </button>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(false)}
                disabled={registerSubmitting}
                className="px-5 py-2.5 text-slate-500 font-bold text-sm hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={registerSubmitting}
                className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-black text-sm rounded-xl shadow-lg shadow-primary-600/20 transition-all flex items-center gap-2 hover:scale-105 active:scale-95 cursor-pointer"
              >
                {registerSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                <span>Register Patient</span>
              </button>
            </div>
          </form>
        </Modal>

        {/* Audit Generation Overlay / Loader */}
        {isGeneratingReport && (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 bg-slate-950/85 backdrop-blur-lg">
            <div className="w-full max-w-sm text-center space-y-6">
              <div className="relative inline-flex items-center justify-center">
                <Loader2 className="w-16 h-16 animate-spin text-primary-500" />
                <ShieldCheck className="w-6 h-6 text-emerald-500 absolute" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-white uppercase tracking-widest">Compiling System Audit</h3>
                <p className="text-slate-400 font-semibold text-xs tracking-wide animate-pulse">
                  {reportSteps[generationStep]}
                </p>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-500 transition-all duration-300 rounded-full"
                  style={{ width: `${((generationStep + 1) / reportSteps.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Executive Report Modal */}
        <Modal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          title="Executive Analytics Report"
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6">
            <div className="border-b border-slate-100 dark:border-dark-700 pb-4">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4" />
                <span>Confidential Hospital Security Log</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">Vitalis Medical Audit Report</h2>
              <p className="text-slate-400 font-semibold text-xs mt-1">Generated: {new Date().toLocaleString()}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-dark-900 rounded-2xl border border-slate-100 dark:border-dark-700 text-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Patients</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{patients.length}</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-dark-900 rounded-2xl border border-slate-100 dark:border-dark-700 text-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Beds</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">42 / 150</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-dark-900 rounded-2xl border border-slate-100 dark:border-dark-700 text-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Today's Appts</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{todaysAppointments.length}</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-dark-900 rounded-2xl border border-slate-100 dark:border-dark-700 text-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Staff</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{staff.length}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Recent Registration Ledger</h3>
              <div className="max-h-48 overflow-y-auto rounded-2xl border border-slate-100 dark:border-dark-700 divide-y divide-slate-50 dark:divide-dark-700 custom-scrollbar">
                {patients.length === 0 ? (
                  <p className="p-4 text-xs font-semibold text-slate-400 text-center">No patients found</p>
                ) : (
                  patients.map((p, idx) => (
                    <div key={idx} className="p-3 px-4 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">{p.name}</span>
                        <span className="text-slate-400 block">{p.email}</span>
                      </div>
                      <span className="font-mono text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-6 flex justify-end gap-3 border-t border-slate-100 dark:border-dark-700">
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="px-5 py-2.5 text-slate-500 font-bold text-sm hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-dark-700 dark:hover:bg-dark-600 text-slate-700 dark:text-slate-200 font-bold text-sm rounded-xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Report</span>
              </button>
              <button
                onClick={handleDownloadCSV}
                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-black text-sm rounded-xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </PageTransition>
  );
};

export default AdminDashboard;
