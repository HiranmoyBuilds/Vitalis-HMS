import React, { useState, useEffect } from 'react';
import { CreditCard, FileText, Download, CheckCircle, Clock, ArrowRight, Loader2, AlertCircle, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/ui/Modal';
import API_URL from '../../config';
import PageTransition from '../../components/layout/PageTransition';
import { toast } from 'sonner';
import { generateInvoicePDF } from '../../utils/pdfGenerator';

const PatientBilling = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('unpaid');
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchInvoices = async () => {
    try {
      const res = await fetch(`${API_URL}/api/invoices/my`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (res.ok) setInvoices(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handlePay = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment delay
    setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/api/invoices/${selectedInvoice._id}/pay`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({ paymentMethod: 'Credit Card' })
        });
        
        if (res.ok) {
          setIsPayModalOpen(false);
          fetchInvoices();
          toast.success('Payment successful! Thank you for choosing Vitalis.');
        } else {
          toast.error('Payment failed. Please try again.');
        }
      } catch (err) {
        console.error(err);
        toast.error('Connection error. Please check your internet.');
      } finally {
        setIsProcessing(false);
      }
    }, 2000);
  };

  const unpaidInvoices = invoices.filter(inv => inv.status === 'Pending');
  const paidInvoices = invoices.filter(inv => inv.status === 'Paid');
  const totalDue = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
          <p className="text-slate-500 font-medium animate-pulse">Loading billing data...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white transition-colors">Billing & Payments</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 transition-colors">Manage your healthcare expenses and view payment history.</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-100 dark:border-emerald-800 shadow-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Secure Payments</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Balance Card */}
          <div className="lg:col-span-1 bg-slate-900 dark:bg-dark-800 rounded-2xl p-6 text-white shadow-xl shadow-slate-900/10 relative overflow-hidden group border border-white/5">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-600/20 rounded-full blur-3xl group-hover:bg-primary-600/30 transition-colors duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Outstanding</p>
                <div className="p-2 bg-white/10 rounded-lg">
                  <CreditCard className="w-5 h-5 text-primary-400" />
                </div>
              </div>
              <h2 className="text-4xl font-black mb-6 tracking-tight">${totalDue.toFixed(2)}</h2>
              
              <button 
                disabled={totalDue === 0}
                onClick={() => {
                  if(unpaidInvoices.length > 0) {
                    setSelectedInvoice(unpaidInvoices[0]);
                    setIsPayModalOpen(true);
                  }
                }}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${totalDue > 0 ? 'bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-600/30 hover:scale-[1.02] active:scale-95' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
              >
                Pay Now <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-center text-[10px] text-slate-500 mt-4 uppercase font-bold tracking-widest opacity-60">Encrypted by Vitalis SecurePay</p>
            </div>
          </div>

          {/* Invoice List */}
          <div className="lg:col-span-2 bg-white dark:bg-dark-900 rounded-2xl shadow-sm border border-slate-200 dark:border-dark-700 overflow-hidden transition-all flex flex-col">
            <div className="flex border-b border-slate-100 dark:border-dark-700 bg-slate-50/50 dark:bg-dark-800/50 p-1">
              <button 
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all rounded-lg ${activeTab === 'unpaid' ? 'text-primary-600 bg-white dark:bg-dark-900 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                onClick={() => setActiveTab('unpaid')}
              >
                Unpaid ({unpaidInvoices.length})
              </button>
              <button 
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all rounded-lg ${activeTab === 'paid' ? 'text-primary-600 bg-white dark:bg-dark-900 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                onClick={() => setActiveTab('paid')}
              >
                Payment History ({paidInvoices.length})
              </button>
            </div>

            <div className="flex-1 p-4 sm:p-6">
              <div className="space-y-3">
                {(activeTab === 'unpaid' ? unpaidInvoices : paidInvoices).map((inv) => (
                  <div key={inv._id} className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-4 border border-slate-100 dark:border-dark-700 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-800/50 transition-all group hover:shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${inv.status === 'Paid' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'}`}>
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white truncate max-w-[200px] group-hover:text-primary-600 transition-colors">{inv.description}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                          <span className="font-mono bg-slate-100 dark:bg-dark-700 px-1.5 py-0.5 rounded text-[9px]">#{inv._id.slice(-6).toUpperCase()}</span>
                          <span>•</span>
                          <span>{new Date(inv.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-6">
                      <div className="text-right">
                        <p className="text-lg font-black text-slate-900 dark:text-white">${inv.amount.toFixed(2)}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-tight ${inv.status === 'Paid' ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {inv.status === 'Paid' ? `Paid ${new Date(inv.paidAt || inv.updatedAt).toLocaleDateString()}` : `Due ${new Date(inv.dueDate).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {inv.status === 'Pending' && (
                          <button 
                            onClick={() => { setSelectedInvoice(inv); setIsPayModalOpen(true); }}
                            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-lg shadow-md shadow-primary-600/20 transition-all hover:scale-105 active:scale-95"
                          >
                            Pay
                          </button>
                        )}
                        <button 
                          onClick={() => generateInvoicePDF(inv, user)}
                          className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-dark-700 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-dark-600"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {((activeTab === 'unpaid' ? unpaidInvoices : paidInvoices).length === 0) && (
                  <div className="text-center py-16 animate-in fade-in zoom-in duration-500">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-dark-700 shadow-inner">
                      <CheckCircle className="w-8 h-8 text-slate-200 dark:text-dark-700" />
                    </div>
                    <h3 className="text-slate-900 dark:text-white font-bold">All caught up!</h3>
                    <p className="text-slate-400 text-sm font-medium mt-1">No {activeTab} invoices found in your account.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Modal 
          isOpen={isPayModalOpen} 
          onClose={() => !isProcessing && setIsPayModalOpen(false)} 
          title="Secure Checkout"
          maxWidth="max-w-md"
        >
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-dark-900 p-5 rounded-2xl border border-slate-100 dark:border-dark-700">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Billing Summary</span>
                <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 text-[10px] px-2 py-0.5 rounded-full font-bold">INVOICE</span>
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-1">{selectedInvoice?.description}</h4>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-slate-400">$</span>
                <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{selectedInvoice?.amount.toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handlePay} className="space-y-4">
               <div className="space-y-3">
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Payment Method</label>
                 <div className="grid grid-cols-2 gap-3">
                   <button type="button" className="flex items-center gap-3 p-4 border-2 border-primary-600 bg-primary-50/50 dark:bg-primary-900/20 rounded-2xl text-left transition-all">
                     <div className="w-5 h-5 rounded-full border-4 border-primary-600 flex items-center justify-center shrink-0">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                     </div>
                     <span className="text-sm font-bold text-slate-900 dark:text-white">Credit Card</span>
                   </button>
                   <button type="button" className="flex items-center gap-3 p-4 border border-slate-200 dark:border-dark-700 rounded-2xl text-left hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors group">
                     <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-dark-600 flex items-center justify-center shrink-0 group-hover:border-primary-400"></div>
                     <span className="text-sm font-bold text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">PayPal</span>
                   </button>
                 </div>
               </div>

               <div className="pt-4 space-y-4">
                 <div className="flex items-center gap-2 text-[10px] text-slate-500 justify-center font-bold uppercase tracking-tight">
                   <ShieldCheck className="w-4 h-4 text-emerald-500" />
                   <span>End-to-end encrypted transaction</span>
                 </div>
                 
                 <button 
                   type="submit"
                   disabled={isProcessing}
                   className="w-full bg-slate-900 dark:bg-primary-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:scale-100 shadow-slate-900/20 dark:shadow-primary-600/20"
                 >
                   {isProcessing ? (
                     <>
                       <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                       <span>Processing...</span>
                     </>
                   ) : (
                     <span>Pay Now</span>
                   )}
                 </button>
                 
                 <button 
                   type="button" 
                   onClick={() => setIsPayModalOpen(false)}
                   disabled={isProcessing}
                   className="w-full py-2 text-sm text-slate-400 font-bold hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                 >
                   Discard Transaction
                 </button>
               </div>
            </form>
          </div>
        </Modal>
      </div>
    </PageTransition>
  );
};

export default PatientBilling;
