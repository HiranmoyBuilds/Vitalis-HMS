import React, { useState, useEffect } from 'react';
import DataGrid from '../../components/ui/DataGrid';
import Modal from '../../components/ui/Modal';
import { CreditCard, Download, FileText, TrendingUp, DollarSign, ArrowUpRight, Clock, Plus, Loader2, CheckCircle, XCircle, ShieldCheck, ArrowRight, Wallet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API_URL from '../../config';
import PageTransition from '../../components/layout/PageTransition';
import { toast } from 'sonner';
import { generateInvoicePDF } from '../../utils/pdfGenerator';

const AdminBilling = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [patients, setPatients] = useState([]);

  const fetchInvoices = async () => {
    try {
      const res = await fetch(`${API_URL}/api/invoices`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (res.ok) setInvoices(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to sync financial database');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/patients`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (res.ok) setPatients(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchPatients();
  }, []);

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.target);
    const selectedPatientId = formData.get('patientId');
    const selectedPatient = patients.find(p => p._id === selectedPatientId);

    const newInvoice = {
      patientId: selectedPatientId,
      patientName: selectedPatient?.name || 'Unknown',
      amount: Number(formData.get('amount')),
      description: formData.get('description'),
      dueDate: formData.get('dueDate'),
      items: [{ description: formData.get('description'), cost: Number(formData.get('amount')) }]
    };

    try {
      const res = await fetch(`${API_URL}/api/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(newInvoice)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchInvoices();
        toast.success(`Invoice generated for ${newInvoice.patientName}`);
      } else {
        toast.error('Failed to generate invoice');
      }
    } catch (err) {
      console.error(err);
      toast.error('Connection error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/api/invoices/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchInvoices();
        toast.success(`Invoice status set to ${status}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Paid': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400';
      case 'Pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400';
      case 'Cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const columns = [
    { 
      key: 'patientName', 
      header: 'Payee Details',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-dark-900 flex items-center justify-center text-slate-400 shadow-inner group-hover:scale-110 transition-transform duration-500">
             <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-slate-100 tracking-tight">{row.patientName}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">ID: #{row._id.slice(-6).toUpperCase()}</div>
          </div>
        </div>
      )
    },
    { 
      key: 'amount', 
      header: 'Statement Total',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-black text-slate-900 dark:text-white tracking-tight">${row.amount.toLocaleString()}</span>
          <span className="text-[10px] font-medium text-slate-400">{row.description}</span>
        </div>
      )
    },
    { 
      key: 'dueDate', 
      header: 'Payment Deadline',
      render: (row) => (
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
          <Clock className="w-3.5 h-3.5" />
          {new Date(row.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      )
    },
    { 
      key: 'status', 
      header: 'Accounting Status',
      render: (row) => (
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getStatusColor(row.status)}`}>
          {row.status}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Ledger Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.status === 'Pending' && (
            <div className="flex items-center gap-1">
              <button 
                onClick={() => handleUpdateStatus(row._id, 'Paid')}
                className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 transition-all border border-emerald-100/50 dark:border-emerald-900/50 shadow-sm"
                title="Mark as Paid"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleUpdateStatus(row._id, 'Cancelled')}
                className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 transition-all border border-red-100/50 dark:border-red-900/50 shadow-sm"
                title="Cancel Invoice"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          )}
          <button 
            onClick={() => generateInvoicePDF(row, { name: row.patientName, _id: row.patientId, email: 'N/A' })}
            className="p-2 text-slate-400 hover:text-primary-600 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0);
  const pendingAmount = invoices.filter(i => i.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white transition-colors tracking-tight">Financial Ledger</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 transition-colors font-medium">Monitor revenue streams, outstanding collections, and invoicing.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-2xl font-black transition-all shadow-xl shadow-primary-600/20 flex items-center gap-2 hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Generate Statement</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Settled Revenue', value: totalRevenue, icon: TrendingUp, color: 'emerald' },
            { label: 'Outstanding Debt', value: pendingAmount, icon: Clock, color: 'amber' },
            { label: 'Total Issued', value: invoices.length, icon: FileText, color: 'blue', isCount: true }
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-dark-800 p-8 rounded-3xl border border-slate-100 dark:border-dark-700 shadow-sm group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
               <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/5 rounded-full -mr-12 -mt-12`}></div>
               <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className={`p-4 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400 rounded-2xl transition-transform group-hover:scale-110 duration-500 shadow-inner`}>
                    <stat.icon className="w-7 h-7" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500 transition-colors" />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">{stat.label}</p>
               <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1 relative z-10 tracking-tight">
                 {stat.isCount ? stat.value : `$${stat.value.toLocaleString()}`}
               </h3>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-3xl shadow-sm border border-slate-100 dark:border-dark-700 overflow-hidden transition-all duration-300">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
              <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] animate-pulse">Scanning Financial Records...</p>
            </div>
          ) : (
            <DataGrid columns={columns} data={invoices} searchPlaceholder="Filter by patient name or invoice ID..." />
          )}
        </div>

        {/* Create Invoice Modal */}
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => !submitting && setIsModalOpen(false)} 
          title="Invoicing Protocol"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleCreateInvoice} className="p-2 space-y-6">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Account (Patient)</label>
              <select name="patientId" required className="w-full px-4 py-3.5 bg-slate-50/50 dark:bg-dark-900 border border-slate-100 dark:border-dark-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none font-bold">
                <option value="">Select Account...</option>
                {patients.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Billing Amount ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input name="amount" type="number" required placeholder="0.00" className="w-full pl-10 pr-4 py-3.5 bg-slate-50/50 dark:bg-dark-900 border border-slate-100 dark:border-dark-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all font-black" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Deadline</label>
                <input name="dueDate" type="date" required className="w-full px-4 py-3.5 bg-slate-50/50 dark:bg-dark-900 border border-slate-100 dark:border-dark-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Description</label>
              <textarea name="description" rows="3" required className="w-full px-4 py-3.5 bg-slate-50/50 dark:bg-dark-900 border border-slate-100 dark:border-dark-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none resize-none transition-all font-medium" placeholder="Clinical consultation, diagnostic laboratory tests, etc."></textarea>
            </div>

            <div className="p-4 bg-primary-50 dark:bg-primary-900/10 rounded-2xl border border-primary-100 dark:border-primary-900/30">
               <div className="flex items-center gap-2 text-primary-700 dark:text-primary-400 font-bold text-xs mb-1">
                 <ShieldCheck className="w-4 h-4" />
                 Compliance Verification
               </div>
               <p className="text-[10px] text-primary-600/70 dark:text-primary-400/60 font-medium leading-relaxed">Financial transactions are recorded in the central ledger for auditing. Invoices will be visible in the patient portal immediately.</p>
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
                disabled={submitting} 
                className="flex-1 py-4 bg-slate-900 dark:bg-primary-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-900/20 dark:shadow-primary-600/20 flex justify-center items-center gap-2"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Commit Invoicing</span> <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </PageTransition>
  );
};

export default AdminBilling;
