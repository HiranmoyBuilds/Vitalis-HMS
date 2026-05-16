import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, TestTube, Activity, FlaskConical, Calendar, User, Search, Filter, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API_URL from '../../config';
import PageTransition from '../../components/layout/PageTransition';
import EmptyState from '../../components/ui/EmptyState';
import { toast } from 'sonner';
import { generateRecordPDF } from '../../utils/pdfGenerator';

const PatientRecords = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRecords = async () => {
    try {
      const res = await fetch(`${API_URL}/api/records/my`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setRecords(data);
      }
    } catch (err) {
      console.error('Failed to fetch records:', err);
      toast.error('Failed to load your medical records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const filteredRecords = records.filter(record => 
    record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.doctor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white transition-colors tracking-tight">Clinical History</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 transition-colors font-medium">Your complete medical archive, prescriptions, and lab results.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all w-full sm:w-64 shadow-sm"
              />
            </div>
            <button className="p-2.5 bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl text-slate-500 hover:text-primary-600 transition-colors shadow-sm">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4 bg-white dark:bg-dark-800 rounded-3xl border border-slate-100 dark:border-dark-700 shadow-sm">
                <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
                <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-[10px]">Retrieving Clinical Data...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="bg-white dark:bg-dark-800 rounded-3xl border border-slate-100 dark:border-dark-700 shadow-sm overflow-hidden">
                 <EmptyState 
                   icon={FileText}
                   title={searchTerm ? "No matches found" : "No Medical Records"}
                   description={searchTerm ? `No results for "${searchTerm}". Try a different search term.` : "Your physician hasn't uploaded any records yet. They will appear here once ready."}
                   action={searchTerm ? { label: "Clear Search", onClick: () => setSearchTerm('') } : null}
                 />
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRecords.map((record) => (
                  <div key={record._id} className="bg-white dark:bg-dark-800 p-6 rounded-3xl border border-slate-100 dark:border-dark-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-primary-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex flex-col sm:flex-row justify-between gap-6">
                      <div className="flex gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-dark-900 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500">
                          <FileText className="w-7 h-7" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-2 py-0.5 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-[10px] font-black uppercase tracking-widest">
                              {record.type}
                            </span>
                            <span className="text-slate-300 dark:text-dark-600">•</span>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-bold">
                              <Calendar className="w-3 h-3" />
                              {new Date(record.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </div>
                          <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors leading-tight">{record.diagnosis}</h3>
                          <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm leading-relaxed font-medium line-clamp-2 group-hover:line-clamp-none transition-all duration-500">{record.notes}</p>
                          
                          {record.prescription && (
                            <div className="mt-5 p-4 bg-primary-50/30 dark:bg-primary-900/10 rounded-2xl border border-primary-100/50 dark:border-primary-900/20 relative group/rx">
                              <div className="absolute -top-2 left-4 px-2 bg-white dark:bg-dark-800 text-[9px] font-black text-primary-600 uppercase tracking-widest border border-primary-100 dark:border-primary-900/30 rounded">Prescription</div>
                              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{record.prescription}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex sm:flex-col justify-between items-end gap-4 shrink-0">
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Attending Physician</p>
                          <div className="flex items-center gap-2 justify-end">
                            <span className="text-sm font-black text-slate-900 dark:text-white">{record.doctor}</span>
                            <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-dark-700 flex items-center justify-center font-bold text-[10px] text-slate-500">{record.doctor[0]}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => generateRecordPDF(record, user)}
                            className="p-3 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-dark-900 rounded-xl transition-all border border-transparent hover:border-primary-100 dark:hover:border-primary-900/30 shadow-sm" 
                            title="Download Document"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 dark:bg-dark-800 rounded-3xl p-8 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary-600/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
              <h3 className="font-black text-2xl mb-4 leading-tight relative z-10">Certified <br/>Documentation</h3>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed relative z-10 font-medium">Need a physically signed copy of your records? Our administrative team can prepare a certified medical dossier.</p>
              <button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-primary-600/30 hover:scale-105 active:scale-95 relative z-10">Request Dossier</button>
            </div>
            
            <div className="bg-white dark:bg-dark-800 rounded-3xl p-6 border border-slate-100 dark:border-dark-700 shadow-sm">
              <h4 className="font-black text-slate-900 dark:text-white mb-6 uppercase tracking-widest text-xs">Vital Insights</h4>
              <div className="space-y-5">
                <div className="flex items-center justify-between group cursor-help">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl transition-transform group-hover:rotate-12"><TestTube className="w-5 h-5" /></div>
                    <span className="text-sm text-slate-600 dark:text-slate-400 font-bold">Lab Analyses</span>
                  </div>
                  <span className="font-black text-lg dark:text-white">{records.filter(r => r.type === 'Lab Result').length}</span>
                </div>
                <div className="flex items-center justify-between group cursor-help">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl transition-transform group-hover:rotate-12"><Activity className="w-5 h-5" /></div>
                    <span className="text-sm text-slate-600 dark:text-slate-400 font-bold">Clinical Entries</span>
                  </div>
                  <span className="font-black text-lg dark:text-white">{records.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default PatientRecords;
