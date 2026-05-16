import React, { useState, useEffect } from 'react';
import DataGrid from '../../components/ui/DataGrid';
import Modal from '../../components/ui/Modal';
import { UserPlus, Mail, Phone, Award, Clock, Loader2, AlertCircle, ShieldCheck, ArrowRight, Activity, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API_URL from '../../config';
import PageTransition from '../../components/layout/PageTransition';
import { toast } from 'sonner';

const AdminDoctors = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchStaff = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/staff`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (res.ok) setStaff(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to sync medical registry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const formData = new FormData(e.target);
    
    const newUser = {
      name: formData.get('name'),
      email: formData.get('email'),
      password: 'password123', // Default password
      role: formData.get('role').toLowerCase()
    };

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchStaff();
        toast.success(`Staff registered: ${newUser.name}`, {
          description: 'Temporary password: password123'
        });
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to add staff');
        toast.error(data.message || 'Failed to add staff');
      }
    } catch (err) {
      setError('Connection error');
      toast.error('Connection error');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'doctor': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400';
      case 'nurse': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400';
      case 'staff': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const columns = [
    { 
      key: 'name', 
      header: 'Medical Practitioner',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center font-black shadow-lg shadow-primary-600/20 group-hover:scale-110 transition-transform duration-500">
            {row.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-slate-100 tracking-tight">{row.name}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{row.email}</div>
          </div>
        </div>
      )
    },
    { 
      key: 'role', 
      header: 'Specialization',
      render: (row) => (
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getRoleColor(row.role)}`}>
          {row.role}
        </span>
      )
    },
    { 
      key: 'createdAt', 
      header: 'System Enrolment',
      render: (row) => (
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
          <Clock className="w-3.5 h-3.5" />
          {new Date(row.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      )
    }
  ];

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white transition-colors tracking-tight">Staff Registry</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 transition-colors font-medium">Manage hospital personnel and administrative hierarchies.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-black transition-all shadow-xl shadow-emerald-600/20 flex items-center gap-2 hover:scale-105 active:scale-95"
          >
            <UserPlus className="w-5 h-5" />
            <span>Enrol Practitioner</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <div className="bg-white dark:bg-dark-800 p-6 rounded-3xl border border-slate-100 dark:border-dark-700 shadow-sm group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-8 -mt-8"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl transition-transform group-hover:scale-110 duration-500">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Doctors</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{staff.filter(s => s.role === 'doctor').length}</p>
                </div>
              </div>
           </div>
           
           <div className="bg-white dark:bg-dark-800 p-6 rounded-3xl border border-slate-100 dark:border-dark-700 shadow-sm group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-8 -mt-8"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl transition-transform group-hover:scale-110 duration-500">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nursing Staff</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{staff.filter(s => s.role === 'nurse').length}</p>
                </div>
              </div>
           </div>

           <div className="bg-white dark:bg-dark-800 p-6 rounded-3xl border border-slate-100 dark:border-dark-700 shadow-sm group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full -mr-8 -mt-8"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-2xl transition-transform group-hover:scale-110 duration-500">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Personnel</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{staff.length}</p>
                </div>
              </div>
           </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-3xl shadow-sm border border-slate-100 dark:border-dark-700 overflow-hidden transition-all duration-300">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
              <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] animate-pulse">Syncing Medical Roster...</p>
            </div>
          ) : (
            <DataGrid columns={columns} data={staff} searchPlaceholder="Search registry by name, email or role..." />
          )}
        </div>

        <Modal 
          isOpen={isModalOpen} 
          onClose={() => !submitting && setIsModalOpen(false)} 
          title="Practitioner Enrolment"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleAddStaff} className="p-2 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-2xl flex items-center gap-3 border border-red-100 dark:border-red-900/30 font-bold">
                <AlertCircle className="w-5 h-5 shrink-0" /> {error}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Name</label>
              <input name="name" type="text" required placeholder="Dr. John Doe" className="w-full px-4 py-3.5 bg-slate-50/50 dark:bg-dark-900 border border-slate-100 dark:border-dark-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold" />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Corporate Email</label>
              <input name="email" type="email" required placeholder="john@vitalis.com" className="w-full px-4 py-3.5 bg-slate-50/50 dark:bg-dark-900 border border-slate-100 dark:border-dark-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold" />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hierarchy Role</label>
              <select name="role" required className="w-full px-4 py-3.5 bg-slate-50/50 dark:bg-dark-900 border border-slate-100 dark:border-dark-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none font-bold">
                <option>Doctor</option>
                <option>Nurse</option>
                <option>Staff</option>
              </select>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
               <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs mb-1">
                 <ShieldCheck className="w-4 h-4" />
                 Secure Enrolment
               </div>
               <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/60 font-medium">New accounts are provisioned with a temporary passkey: <span className="font-black">password123</span></p>
            </div>

            <div className="pt-4 flex gap-4">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-4 text-slate-500 font-bold hover:text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={submitting}
                className="flex-1 py-4 bg-slate-900 dark:bg-primary-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-900/20 flex justify-center items-center gap-2"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Commit Entry</span> <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </PageTransition>
  );
};

export default AdminDoctors;
