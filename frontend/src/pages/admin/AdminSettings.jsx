import React, { useState, useEffect } from 'react';
import { Settings, ShieldAlert, ShieldCheck, Heart, UserCheck, Activity, Key, Sliders, Check, Palette } from 'lucide-react';
import PageTransition from '../../components/layout/PageTransition';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const AdminSettings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('hospital');
  
  // Hospital Profile State
  const [hospitalName, setHospitalName] = useState(() => localStorage.getItem('vitalis_hospital_name') || 'Vitalis Medical Center');
  const [hospitalPhone, setHospitalPhone] = useState(() => localStorage.getItem('vitalis_hospital_phone') || '+1 (555) 019-2834');
  const [hospitalEmail, setHospitalEmail] = useState(() => localStorage.getItem('vitalis_hospital_email') || 'executive@vitalis.com');
  const [hospitalAddress, setHospitalAddress] = useState(() => localStorage.getItem('vitalis_hospital_address') || '742 Evergreen Terrace, Springfield');
  const [hospitalWebsite, setHospitalWebsite] = useState(() => localStorage.getItem('vitalis_hospital_website') || 'https://vitalis-hms.com');

  // Security Settings State
  const [sessionTimeout, setSessionTimeout] = useState(() => localStorage.getItem('vitalis_session_timeout') || '30');
  const [complexPassword, setComplexPassword] = useState(() => localStorage.getItem('vitalis_complex_password') === 'true');
  const [auditLogEnabled, setAuditLogEnabled] = useState(() => localStorage.getItem('vitalis_audit_logs') === 'true');
  const [hipaaEnforced, setHipaaEnforced] = useState(() => localStorage.getItem('vitalis_hipaa_enforced') === 'true');

  // Accent Theme Settings
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('vitalis_accent_color') || 'emerald');

  const handleSaveHospital = (e) => {
    e.preventDefault();
    localStorage.setItem('vitalis_hospital_name', hospitalName);
    localStorage.setItem('vitalis_hospital_phone', hospitalPhone);
    localStorage.setItem('vitalis_hospital_email', hospitalEmail);
    localStorage.setItem('vitalis_hospital_address', hospitalAddress);
    localStorage.setItem('vitalis_hospital_website', hospitalWebsite);
    toast.success('Hospital Profile Saved', {
      description: 'Your changes will be printed on all outbound clinical billing statements.',
    });
  };

  const handleSaveSecurity = (e) => {
    e.preventDefault();
    localStorage.setItem('vitalis_session_timeout', sessionTimeout);
    localStorage.setItem('vitalis_complex_password', complexPassword);
    localStorage.setItem('vitalis_audit_logs', auditLogEnabled);
    localStorage.setItem('vitalis_hipaa_enforced', hipaaEnforced);
    toast.success('HIPAA Controls & Security Updated', {
      description: 'System-wide audit policies have been re-enforced.',
    });
  };

  const handleSaveTheme = (color) => {
    setAccentColor(color);
    localStorage.setItem('vitalis_accent_color', color);
    toast.success('Accent Theme Refreshed', {
      description: `Hospital workspace transitioned to ${color.toUpperCase()} interface accent.`,
    });
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white transition-colors tracking-tight">System Control</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 transition-colors font-medium">Configure global clinical metadata, security policies, and application layout options.</p>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 dark:border-dark-700 gap-6 overflow-x-auto pb-px">
          {[
            { id: 'hospital', label: 'Hospital Profile', icon: Heart },
            { id: 'security', label: 'Security & HIPAA', icon: ShieldAlert },
            { id: 'theme', label: 'Interface Accents', icon: Palette },
            { id: 'roster', label: 'User Roster', icon: UserCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 pb-4 px-1 text-sm font-black transition-all border-b-2 relative shrink-0 -mb-px outline-none ${
                  isActive 
                    ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-500' 
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-dark-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-dark-700 transition-colors duration-300">
          
          {/* Hospital tab */}
          {activeTab === 'hospital' && (
            <form onSubmit={handleSaveHospital} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Hospital Brand Name</label>
                  <input
                    type="text"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-100 dark:border-dark-700 bg-slate-50/50 dark:bg-dark-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-semibold text-sm"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Administration Helpline</label>
                  <input
                    type="text"
                    value={hospitalPhone}
                    onChange={(e) => setHospitalPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-100 dark:border-dark-700 bg-slate-50/50 dark:bg-dark-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-semibold text-sm"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Clinical Contact Email</label>
                  <input
                    type="email"
                    value={hospitalEmail}
                    onChange={(e) => setHospitalEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-100 dark:border-dark-700 bg-slate-50/50 dark:bg-dark-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-semibold text-sm"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Secure Brand URL</label>
                  <input
                    type="url"
                    value={hospitalWebsite}
                    onChange={(e) => setHospitalWebsite(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-100 dark:border-dark-700 bg-slate-50/50 dark:bg-dark-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-semibold text-sm"
                    required
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Registered Physical Address</label>
                  <input
                    type="text"
                    value={hospitalAddress}
                    onChange={(e) => setHospitalAddress(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-100 dark:border-dark-700 bg-slate-50/50 dark:bg-dark-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-semibold text-sm"
                    required
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100 dark:border-dark-700">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all outline-none"
                >
                  Commit Brand Changes
                </button>
              </div>
            </form>
          )}

          {/* Security & HIPAA tab */}
          {activeTab === 'security' && (
            <form onSubmit={handleSaveSecurity} className="space-y-6">
              <div className="space-y-6">
                {/* HIPAA Enforced */}
                <div className="flex items-start justify-between p-4 bg-slate-50 dark:bg-dark-900 rounded-2xl border border-slate-100 dark:border-dark-700 transition-colors">
                  <div className="space-y-0.5 max-w-[80%]">
                    <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">HIPAA Privacy Enforcement</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">Require active role verification for clinical records, patient files, and outbound data transactions.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={hipaaEnforced}
                    onChange={(e) => setHipaaEnforced(e.target.checked)}
                    className="w-10 h-6 bg-slate-200 dark:bg-dark-700 rounded-full appearance-none checked:bg-emerald-600 dark:checked:bg-emerald-500 relative before:content-[''] before:absolute before:h-4 before:w-4 before:bg-white before:rounded-full before:top-1 before:left-1 checked:before:left-5 before:transition-all cursor-pointer transition-colors duration-300 outline-none shadow-sm border border-slate-300 dark:border-dark-600"
                  />
                </div>

                {/* complex passwords */}
                <div className="flex items-start justify-between p-4 bg-slate-50 dark:bg-dark-900 rounded-2xl border border-slate-100 dark:border-dark-700 transition-colors">
                  <div className="space-y-0.5 max-w-[80%]">
                    <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Enforce Complex Alphanumeric Passwords</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">Require new doctor/staff registrations to have a minimum of 8 characters, containing capital letters, numbers, and symbols.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={complexPassword}
                    onChange={(e) => setComplexPassword(e.target.checked)}
                    className="w-10 h-6 bg-slate-200 dark:bg-dark-700 rounded-full appearance-none checked:bg-emerald-600 dark:checked:bg-emerald-500 relative before:content-[''] before:absolute before:h-4 before:w-4 before:bg-white before:rounded-full before:top-1 before:left-1 checked:before:left-5 before:transition-all cursor-pointer transition-colors duration-300 outline-none shadow-sm border border-slate-300 dark:border-dark-600"
                  />
                </div>

                {/* Audit Logs */}
                <div className="flex items-start justify-between p-4 bg-slate-50 dark:bg-dark-900 rounded-2xl border border-slate-100 dark:border-dark-700 transition-colors">
                  <div className="space-y-0.5 max-w-[80%]">
                    <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">System Audit Log Logs</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">Record all session registrations, patient edits, invoice updates, and document download requests for legal safety.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={auditLogEnabled}
                    onChange={(e) => setAuditLogEnabled(e.target.checked)}
                    className="w-10 h-6 bg-slate-200 dark:bg-dark-700 rounded-full appearance-none checked:bg-emerald-600 dark:checked:bg-emerald-500 relative before:content-[''] before:absolute before:h-4 before:w-4 before:bg-white before:rounded-full before:top-1 before:left-1 checked:before:left-5 before:transition-all cursor-pointer transition-colors duration-300 outline-none shadow-sm border border-slate-300 dark:border-dark-600"
                  />
                </div>

                {/* Timeout */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Idle Session Lockout</label>
                  <select
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-100 dark:border-dark-700 bg-slate-50/50 dark:bg-dark-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-semibold text-sm"
                  >
                    <option value="15">Lock screen after 15 minutes of inactivity</option>
                    <option value="30">Lock screen after 30 minutes of inactivity</option>
                    <option value="60">Lock screen after 1 hour of inactivity</option>
                    <option value="off">Never lock idle sessions automatically (Not HIPAA Recommended)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-dark-700">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all outline-none"
                >
                  Save Compliance Rules
                </button>
              </div>
            </form>
          )}

          {/* Theme Tab */}
          {activeTab === 'theme' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Hospital Interface Theme Accent</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">Customize the primary branding theme accent utilized throughout the Admin dashboard workspace.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {[
                  { id: 'emerald', label: 'Emerald Health', color: 'bg-emerald-600 text-emerald-600' },
                  { id: 'blue', label: 'Vibrant Marine', color: 'bg-blue-600 text-blue-600' },
                  { id: 'indigo', label: 'Royal Violet', color: 'bg-indigo-600 text-indigo-600' },
                  { id: 'purple', label: 'Purple Medical', color: 'bg-purple-600 text-purple-600' },
                  { id: 'rose', label: 'Rose Clinical', color: 'bg-rose-600 text-rose-600' }
                ].map((colorObj) => {
                  const isSelected = accentColor === colorObj.id;
                  return (
                    <button
                      key={colorObj.id}
                      onClick={() => handleSaveTheme(colorObj.id)}
                      className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all outline-none hover:scale-[1.02] active:scale-95 ${
                        isSelected 
                          ? 'border-slate-800 dark:border-white/50 bg-slate-50 dark:bg-dark-900 shadow-md' 
                          : 'border-slate-100 dark:border-dark-700 hover:bg-slate-50/50 dark:hover:bg-dark-900/50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl ${colorObj.color.split(' ')[0]} flex items-center justify-center text-white shadow-lg`}>
                        {isSelected && <Check className="w-5 h-5" />}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">{colorObj.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* User Roster Tab */}
          {activeTab === 'roster' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Active User Credentials</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">Roster of credentials initialized in this HMS demonstration platform.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-dark-700 text-slate-400 font-black uppercase tracking-widest text-[10px]">
                      <th className="pb-4">Name</th>
                      <th className="pb-4">Identity Details</th>
                      <th className="pb-4">System Role</th>
                      <th className="pb-4">Security Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-dark-700">
                    {[
                      { name: 'System Admin', email: 'admin@vitalis.com', role: 'admin', level: 'Root Admin' },
                      { name: 'Mark Roberts', email: 'patient@vitalis.com', role: 'patient', level: 'Patient' }
                    ].map((member, i) => (
                      <tr key={i} className="group hover:bg-slate-50 dark:hover:bg-dark-700/50 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{member.name}</p>
                              <p className="text-[10px] text-slate-400 font-medium">Session Active</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 font-semibold text-slate-600 dark:text-slate-300">{member.email}</td>
                        <td className="py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight ${
                            member.role === 'admin' 
                              ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400' 
                              : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                          }`}>
                            {member.role}
                          </span>
                        </td>
                        <td className="py-4 font-bold text-slate-500 dark:text-slate-400 text-xs">{member.level}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default AdminSettings;
