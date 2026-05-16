import React, { useState, useEffect } from 'react';
import DataGrid from '../../components/ui/DataGrid';
import Modal from '../../components/ui/Modal';
import { UserPlus, PlusCircle, FileText, Activity, Users, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API_URL from '../../config';
import PageTransition from '../../components/layout/PageTransition';
import { toast } from 'sonner';

const AdminPatients = () => {
  const { user } = useAuth();
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Record Form State
  const [recordData, setRecordData] = useState({
    type: 'Prescription',
    diagnosis: '',
    prescription: '',
    notes: '',
    doctor: user?.name || 'Admin'
  });

  const fetchPatients = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/patients`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setPatients(data);
      }
    } catch (err) {
      console.error('Failed to fetch patients:', err);
      toast.error('Failed to load patients list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleAddRecord = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          ...recordData,
          patientId: selectedPatient._id
        })
      });

      if (res.ok) {
        setIsRecordModalOpen(false);
        setRecordData({ type: 'Prescription', diagnosis: '', prescription: '', notes: '', doctor: user?.name || 'Admin' });
        toast.success(`Medical record added successfully for ${selectedPatient.name}`);
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to add record');
        toast.error(data.message || 'Failed to add record');
      }
    } catch (err) {
      setError('Connection error');
      toast.error('Connection error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { 
      key: 'name', 
      header: 'Patient Name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-primary-600/20">
            {row.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-slate-100">{row.name}</div>
            <div className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">{row.email}</div>
          </div>
        </div>
      )
    },
    { 
      key: 'role', 
      header: 'Status',
      render: () => (
        <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
          Active
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Clinical Actions',
      render: (row) => (
        <button 
          onClick={() => {
            setSelectedPatient(row);
            setIsRecordModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/40 rounded-xl transition-all text-xs font-black uppercase tracking-tight border border-primary-100/50 dark:border-primary-900/50"
        >
          <PlusCircle className="w-3.5 h-3.5" /> Add Record
        </button>
      )
    }
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white transition-colors tracking-tight">Patient Directory</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 transition-colors font-medium">Manage patient health records and clinical data.</p>
          </div>
          <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
            <Users className="w-6 h-6 text-primary-600" />
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
            <p className="text-slate-500 font-bold text-sm animate-pulse">Syncing patient records...</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-slate-100 dark:border-dark-700 overflow-hidden transition-all duration-300">
            <DataGrid columns={columns} data={patients} searchPlaceholder="Search patients by name or email..." />
          </div>
        )}

        {/* Add Medical Record Modal */}
        <Modal 
          isOpen={isRecordModalOpen} 
          onClose={() => !submitting && setIsRecordModalOpen(false)} 
          title={`Clinical Record for ${selectedPatient?.name}`}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleAddRecord} className="p-2 space-y-5">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl flex items-center gap-2 border border-red-100 dark:border-red-900/30">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Record Type</label>
              <div className="grid grid-cols-2 gap-2">
                {['Prescription', 'Lab Result', 'Imaging', 'Note'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setRecordData({...recordData, type})}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      recordData.type === type 
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-600 shadow-sm' 
                      : 'border-slate-100 dark:border-dark-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-dark-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Diagnosis / Title</label>
              <input 
                type="text" 
                required
                placeholder="e.g., Seasonal Flu, Blood Test Results"
                value={recordData.diagnosis}
                onChange={(e) => setRecordData({...recordData, diagnosis: e.target.value})}
                className="w-full px-4 py-3 border border-slate-100 dark:border-dark-700 rounded-xl bg-slate-50/50 dark:bg-dark-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium" 
              />
            </div>

            {recordData.type === 'Prescription' && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Medication Details</label>
                <input 
                  type="text" 
                  placeholder="e.g., Paracetamol 500mg - 1x3"
                  value={recordData.prescription}
                  onChange={(e) => setRecordData({...recordData, prescription: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-100 dark:border-dark-700 rounded-xl bg-slate-50/50 dark:bg-dark-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium" 
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Clinical Notes</label>
              <textarea 
                rows="4"
                value={recordData.notes}
                onChange={(e) => setRecordData({...recordData, notes: e.target.value})}
                className="w-full px-4 py-3 border border-slate-100 dark:border-dark-700 rounded-xl bg-slate-50/50 dark:bg-dark-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none resize-none transition-all font-medium"
                placeholder="Enter detailed observations or medical advice..."
              ></textarea>
            </div>
            
            <div className="pt-4 flex items-center justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setIsRecordModalOpen(false)}
                className="px-5 py-2.5 text-slate-500 font-bold text-sm hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                Discard
              </button>
              <button 
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-slate-900 dark:bg-primary-600 hover:bg-slate-800 dark:hover:bg-primary-700 text-white font-black text-sm rounded-xl shadow-lg transition-all disabled:opacity-70 flex items-center gap-2 hover:scale-105 active:scale-95"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                <span>Commit Record</span>
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </PageTransition>
  );
};

export default AdminPatients;
