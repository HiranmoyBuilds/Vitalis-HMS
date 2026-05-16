import React, { useState, useEffect } from 'react';
import DataGrid from '../../components/ui/DataGrid';
import Modal from '../../components/ui/Modal';
import { Calendar as CalendarIcon, Clock, Plus, Video, MapPin, CheckCircle, XCircle, Loader2, ArrowRight, Activity, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API_URL from '../../config';
import PageTransition from '../../components/layout/PageTransition';
import { toast } from 'sonner';

const AdminAppointments = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`${API_URL}/api/appointments`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setAppointments(data);
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
      toast.error('Failed to sync appointment database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`${API_URL}/api/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        fetchAppointments();
        toast.success(`Appointment status updated to ${newStatus}`);
      }
    } catch (err) {
      console.error('Update failed:', err);
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Confirmed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400';
      case 'Scheduled': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400';
      case 'Completed': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
      case 'Cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const columns = [
    { 
      key: 'date', 
      header: 'Schedule',
      render: (row) => (
        <div className="flex flex-col gap-1">
          <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CalendarIcon className="w-3.5 h-3.5 text-primary-500" />
            {new Date(row.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            {row.time}
          </div>
        </div>
      )
    },
    { 
      key: 'patient', 
      header: 'Patient Information',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-dark-900 flex items-center justify-center font-black text-xs shadow-inner">
            {row.patient?.name ? row.patient.name[0] : '?'}
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-slate-100 tracking-tight">{row.patient?.name || 'Anonymous'}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{row.patient?.email || 'N/A'}</div>
          </div>
        </div>
      )
    },
    { 
      key: 'doctor', 
      header: 'Clinical Assignment',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100 tracking-tight">{row.doctor}</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-primary-600/70 dark:text-primary-400/70 flex items-center gap-1.5 mt-0.5">
            {row.type === 'Video Consult' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
            {row.type} Consult
          </div>
        </div>
      )
    },
    { 
      key: 'status', 
      header: 'Current Phase',
      render: (row) => (
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getStatusColor(row.status)}`}>
          {row.status}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Operational Control',
      render: (row) => (
        <div className="flex items-center gap-2">
          {updatingId === row._id ? (
            <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
          ) : (
            <div className="flex items-center gap-1">
              {row.status === 'Scheduled' && (
                <button 
                  onClick={() => handleStatusUpdate(row._id, 'Confirmed')}
                  className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 transition-all border border-emerald-100/50 dark:border-emerald-900/50"
                  title="Confirm"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
              )}
              {row.status === 'Confirmed' && (
                <button 
                  onClick={() => handleStatusUpdate(row._id, 'Completed')}
                  className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 transition-all border border-blue-100/50 dark:border-blue-900/50"
                  title="Complete"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
              )}
              {(row.status === 'Scheduled' || row.status === 'Confirmed') && (
                <button 
                  onClick={() => handleStatusUpdate(row._id, 'Cancelled')}
                  className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 transition-all border border-red-100/50 dark:border-red-900/50"
                  title="Cancel"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      )
    }
  ];

  const handleBooking = (e) => {
    e.preventDefault();
    setIsModalOpen(false);
    toast.success('Manual booking feature coming soon');
  };

  const filteredAppointments = appointments.filter(a => {
    if (activeTab === 'upcoming') return a.status === 'Scheduled' || a.status === 'Confirmed';
    if (activeTab === 'past') return a.status === 'Completed' || a.status === 'Cancelled';
    return true;
  });

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white transition-colors tracking-tight">Clinical Scheduler</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 transition-colors font-medium">Coordinate patient bookings and physician allocations.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-2xl font-black transition-all shadow-xl shadow-primary-600/20 flex items-center gap-2 hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Force Booking</span>
          </button>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-3xl shadow-sm border border-slate-100 dark:border-dark-700 p-1.5 flex gap-1.5 w-max transition-all">
          {['upcoming', 'past', 'all'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${activeTab === tab ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-900'}`}
            >
              {tab === 'past' ? 'Completed & History' : tab}
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-3xl shadow-sm border border-slate-100 dark:border-dark-700 overflow-hidden transition-all duration-300">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
              <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] animate-pulse">Syncing Scheduler...</p>
            </div>
          ) : (
            <DataGrid columns={columns} data={filteredAppointments} searchPlaceholder="Search patients, doctors, or timestamps..." />
          )}
        </div>

        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          title="Manual Session Override"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleBooking} className="p-2 space-y-6">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Patient Search</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input name="patientName" type="text" required placeholder="Search by name or ID..." className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 dark:bg-dark-900 border border-slate-100 dark:border-dark-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold" />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Specialist</label>
              <select name="doctor" className="w-full px-4 py-3.5 bg-slate-50/50 dark:bg-dark-900 border border-slate-100 dark:border-dark-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none font-bold">
                <option>Dr. Sarah Jenkins (Cardiology)</option>
                <option>Dr. Michael Chen (Neurology)</option>
                <option>Dr. Emily Davis (General)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Date</label>
                <input name="date" type="date" required className="w-full px-4 py-3.5 bg-slate-50/50 dark:bg-dark-900 border border-slate-100 dark:border-dark-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Time Slot</label>
                <input name="time" type="time" required className="w-full px-4 py-3.5 bg-slate-50/50 dark:bg-dark-900 border border-slate-100 dark:border-dark-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clinical Protocol</label>
              <select name="type" className="w-full px-4 py-3.5 bg-slate-50/50 dark:bg-dark-900 border border-slate-100 dark:border-dark-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none font-bold">
                <option>In-person</option>
                <option>Video Consult</option>
              </select>
            </div>
            
            <div className="pt-4 flex gap-4">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-4 text-slate-500 font-bold hover:text-slate-700 transition-colors"
              >
                Discard
              </button>
              <button 
                type="submit"
                className="flex-1 py-4 bg-slate-900 dark:bg-primary-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-900/20 dark:shadow-primary-600/20 flex justify-center items-center gap-2"
              >
                <span>Commit Schedule</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </PageTransition>
  );
};

export default AdminAppointments;
