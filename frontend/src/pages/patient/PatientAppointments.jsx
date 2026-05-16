import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Search, Filter, Plus, ChevronRight, X, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API_URL from '../../config';
import PageTransition from '../../components/layout/PageTransition';
import EmptyState from '../../components/ui/EmptyState';
import { toast } from 'sonner';

const PatientAppointments = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showBookModal, setShowBookModal] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    doctor: '',
    date: '',
    time: '',
    reason: '',
    type: 'In-Person'
  });

  const doctors = [
    'Dr. Sarah Jenkins (Cardiology)',
    'Dr. Robert Chen (Orthopedics)',
    'Dr. Emily Watson (General Practice)',
    'Dr. Michael Chang (Dermatology)',
    'Dr. Alisha Khan (Pediatrics)'
  ];

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`${API_URL}/api/appointments/my`, {
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
      toast.error('Failed to load your appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowBookModal(false);
        fetchAppointments();
        setFormData({ doctor: '', date: '', time: '', reason: '', type: 'In-Person' });
        toast.success('Appointment requested successfully!');
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to book appointment');
        toast.error(data.message || 'Failed to book appointment');
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError('Connection error. Please try again.');
      toast.error('Connection error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const upcomingAppointments = appointments.filter(a => a.status !== 'Completed' && a.status !== 'Cancelled');
  const pastAppointments = appointments.filter(a => a.status === 'Completed' || a.status === 'Cancelled');

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white transition-colors tracking-tight">Appointments</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 transition-colors font-medium">Manage your clinical visits and consultation history.</p>
          </div>
          <button 
            onClick={() => setShowBookModal(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-2xl font-black transition-all shadow-xl shadow-primary-600/20 flex items-center gap-2 hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Book New Session
          </button>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-3xl shadow-sm border border-slate-100 dark:border-dark-700 overflow-hidden transition-all duration-300">
          <div className="flex border-b border-slate-50 dark:border-dark-700 bg-slate-50/50 dark:bg-dark-800/50 p-1">
            <button 
              className={`flex-1 py-3.5 text-xs font-black uppercase tracking-widest text-center transition-all rounded-2xl ${activeTab === 'upcoming' ? 'text-primary-600 bg-white dark:bg-dark-900 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
              onClick={() => setActiveTab('upcoming')}
            >
              Upcoming ({upcomingAppointments.length})
            </button>
            <button 
              className={`flex-1 py-3.5 text-xs font-black uppercase tracking-widest text-center transition-all rounded-2xl ${activeTab === 'past' ? 'text-primary-600 bg-white dark:bg-dark-900 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
              onClick={() => setActiveTab('past')}
            >
              Consultation History ({pastAppointments.length})
            </button>
          </div>

          <div className="p-4 sm:p-8">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
                <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] animate-pulse">Syncing Calendar...</p>
              </div>
            ) : (activeTab === 'upcoming' ? upcomingAppointments : pastAppointments).length === 0 ? (
              <EmptyState 
                icon={Calendar}
                title={activeTab === 'upcoming' ? "No Upcoming Visits" : "No Past Records"}
                description={activeTab === 'upcoming' ? "You don't have any sessions scheduled. Ready to speak with a specialist?" : "Your consultation history will appear here once you complete a visit."}
                action={activeTab === 'upcoming' ? { label: "Schedule Now", onClick: () => setShowBookModal(true) } : null}
              />
            ) : (
              <div className="space-y-4">
                {(activeTab === 'upcoming' ? upcomingAppointments : pastAppointments).map((apt) => (
                  <div key={apt._id} className="flex flex-col lg:flex-row lg:items-center justify-between p-6 bg-white dark:bg-dark-800 border border-slate-100 dark:border-dark-700 rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-primary-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex flex-col md:flex-row gap-6 md:gap-12 mb-6 lg:mb-0">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-dark-900 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner group-hover:scale-110 transition-transform duration-500">
                          {apt.doctor.split(' ')[1][0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-[10px] font-black uppercase tracking-widest">{apt.type}</span>
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                              apt.status === 'Confirmed' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' :
                              apt.status === 'Scheduled' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
                              'bg-slate-50 dark:bg-dark-700 text-slate-500'
                            }`}>
                              {apt.status}
                            </span>
                          </div>
                          <h4 className="font-black text-slate-900 dark:text-white text-xl group-hover:text-primary-600 transition-colors">{apt.doctor}</h4>
                          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">{apt.reason}</p>
                        </div>
                      </div>
                      
                      <div className="hidden md:block w-px h-12 bg-slate-100 dark:bg-dark-700"></div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-bold">
                          <div className="p-2 bg-slate-50 dark:bg-dark-900 rounded-lg"><Calendar className="w-4 h-4 text-primary-500" /></div>
                          {formatDate(apt.date)}
                        </div>
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-bold">
                          <div className="p-2 bg-slate-50 dark:bg-dark-900 rounded-lg"><Clock className="w-4 h-4 text-primary-500" /></div>
                          {apt.time}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-6 lg:pt-0 border-t lg:border-t-0 border-slate-50 dark:border-dark-700">
                      {activeTab === 'upcoming' ? (
                        <div className="flex gap-2">
                          <button className="px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Reschedule</button>
                          <button className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-100 transition-all">Cancel Session</button>
                        </div>
                      ) : (
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary-100 transition-all border border-primary-100/50 dark:border-primary-900/50">
                          Review Notes <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Book Appointment Modal */}
        {showBookModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-dark-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/10">
              <div className="p-6 sm:p-8 border-b border-slate-50 dark:border-dark-700 flex justify-between items-center bg-slate-50/50 dark:bg-dark-900/50">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Request Session</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-1">Fill in the details to coordinate with our specialists.</p>
                </div>
                <button onClick={() => !submitting && setShowBookModal(false)} className="p-3 hover:bg-white dark:hover:bg-dark-800 rounded-2xl transition-all text-slate-400 hover:text-slate-600 shadow-sm">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleBookAppointment} className="p-6 sm:p-8 space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-2xl flex items-center gap-3 border border-red-100 dark:border-red-900/30 font-bold">
                    <AlertCircle className="w-5 h-5 shrink-0" /> {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Specialist Physician</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    <select 
                      required
                      value={formData.doctor}
                      onChange={(e) => setFormData({...formData, doctor: e.target.value})}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 dark:bg-dark-900 border border-slate-100 dark:border-dark-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all appearance-none font-bold"
                    >
                      <option value="">Select a Doctor...</option>
                      {doctors.map(doc => <option key={doc} value={doc}>{doc}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preferred Date</label>
                    <input 
                      type="date" 
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-4 py-3.5 bg-slate-50/50 dark:bg-dark-900 border border-slate-100 dark:border-dark-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Time Slot</label>
                    <input 
                      type="time" 
                      required
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      className="w-full px-4 py-3.5 bg-slate-50/50 dark:bg-dark-900 border border-slate-100 dark:border-dark-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Consultation Protocol</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['In-Person', 'Video Consult'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({...formData, type})}
                        className={`py-3 px-4 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all ${
                          formData.type === type 
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-600 shadow-sm' 
                          : 'border-slate-100 dark:border-dark-700 text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-700'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clinical Context</label>
                  <textarea 
                    required
                    rows="3"
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    className="w-full px-4 py-3.5 bg-slate-50/50 dark:bg-dark-900 border border-slate-100 dark:border-dark-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none font-medium"
                    placeholder="Briefly describe your symptoms or reason for the visit..."
                  ></textarea>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setShowBookModal(false)}
                    disabled={submitting}
                    className="flex-1 py-4 bg-slate-100 dark:bg-dark-700 text-slate-600 dark:text-slate-300 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-200 dark:hover:bg-dark-600 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-4 bg-slate-900 dark:bg-primary-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-900/20 dark:shadow-primary-600/20 disabled:opacity-70 flex justify-center items-center gap-2"
                  >
                    {submitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>Finalize Request</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default PatientAppointments;
