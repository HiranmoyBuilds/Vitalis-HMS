import React, { useState } from 'react';
import { Video, Mic, MicOff, VideoOff, PhoneOff, MessageSquare, Settings, ShieldCheck, User, ArrowRight, Loader2, Maximize2, MoreHorizontal } from 'lucide-react';
import PageTransition from '../../components/layout/PageTransition';
import { toast } from 'sonner';

const PatientTelemedicine = () => {
  const [inCall, setInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleJoin = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setInCall(true);
      setIsConnecting(false);
      toast.success('Connected to Secure Waiting Room');
    }, 1500);
  };

  if (!inCall) {
    return (
      <PageTransition>
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 max-w-4xl mx-auto">
          <div className="w-24 h-24 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-3xl flex items-center justify-center mb-8 shadow-inner animate-in zoom-in duration-700">
            <Video className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Virtual Consultation</h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-lg mb-10 font-medium text-lg">
            High-fidelity encrypted telemedicine session with your healthcare provider.
          </p>
          
          <div className="bg-white dark:bg-dark-800 p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-dark-700 w-full max-w-md mb-10 transition-all hover:shadow-primary-600/5 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-16 -mt-16"></div>
            <div className="flex items-center gap-5 mb-8 relative z-10">
              <div className="w-20 h-20 bg-slate-50 dark:bg-dark-900 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner group-hover:scale-105 transition-transform duration-500">
                SJ
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-1">Scheduled Provider</p>
                <h3 className="font-black text-2xl text-slate-900 dark:text-white tracking-tight">Dr. Sarah Jenkins</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">Chief of Cardiology</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-dark-900 rounded-2xl mb-8 border border-slate-100 dark:border-dark-700">
               <div className="flex items-center gap-3">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                 <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Provider Online</span>
               </div>
               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">10:00 AM Session</span>
            </div>
            
            <button 
              onClick={handleJoin}
              disabled={isConnecting}
              className="w-full bg-slate-900 dark:bg-primary-600 hover:bg-slate-800 dark:hover:bg-primary-700 text-white py-5 rounded-2xl font-black text-lg shadow-2xl shadow-slate-900/20 dark:shadow-primary-600/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {isConnecting ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Join Secure Consultation <ArrowRight className="w-5 h-5" /></>}
            </button>
          </div>
          
          <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-100 dark:border-emerald-900/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              End-to-End Encrypted
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-dark-700 rounded-full">
              <Settings className="w-3.5 h-3.5" />
              AV Diagnostics Ready
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="h-[82vh] flex flex-col lg:flex-row gap-6">
        {/* Video Area */}
        <div className="flex-1 bg-slate-950 dark:bg-black rounded-[2.5rem] overflow-hidden relative shadow-2xl flex flex-col border border-white/5">
          {/* Main Remote Video Placeholder */}
          <div className="flex-1 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-slate-900 dark:bg-dark-950 flex items-center justify-center">
               <div className="text-center group">
                  <div className="w-28 h-28 bg-slate-800 dark:bg-dark-900 rounded-3xl mx-auto mb-6 flex items-center justify-center text-primary-500 shadow-2xl group-hover:scale-105 transition-transform duration-700 animate-pulse">
                    <Video className="w-12 h-12" />
                  </div>
                  <h3 className="text-white font-black text-xl tracking-tight mb-2">Establishing Secure Connection</h3>
                  <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Awaiting Dr. Jenkins...</p>
               </div>
            </div>
            
            {/* HUD Overlays */}
            <div className="absolute top-8 left-8 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Live HD • 1080p</span>
            </div>

            <div className="absolute top-8 right-8 flex items-center gap-2">
              <button className="p-2.5 bg-black/40 backdrop-blur-md text-white rounded-xl border border-white/10 hover:bg-white/10 transition-all shadow-lg">
                <Maximize2 className="w-4 h-4" />
              </button>
              <button className="p-2.5 bg-black/40 backdrop-blur-md text-white rounded-xl border border-white/10 hover:bg-white/10 transition-all shadow-lg">
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {/* Picture-in-Picture Self View */}
            <div className="absolute bottom-10 right-10 w-44 h-64 bg-slate-800 rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl z-10 flex items-center justify-center group cursor-move hover:scale-105 transition-all">
               {isVideoOff ? (
                 <div className="text-slate-600 flex flex-col items-center gap-2">
                   <VideoOff className="w-10 h-10" />
                   <span className="text-[10px] font-black uppercase">Camera Off</span>
                 </div>
               ) : (
                 <div className="relative w-full h-full bg-slate-700 flex items-center justify-center">
                    <User className="w-12 h-12 text-slate-600" />
                    <div className="absolute bottom-4 left-4 right-4 text-center">
                       <span className="text-[9px] font-black text-white/50 uppercase tracking-widest bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm">Self Preview</span>
                    </div>
                 </div>
               )}
            </div>
          </div>

          {/* Controls Bar */}
          <div className="bg-slate-900/80 backdrop-blur-xl p-6 flex items-center justify-between border-t border-white/5 px-10 z-20">
            <div className="hidden sm:flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white">
                 <MoreHorizontal className="w-5 h-5" />
               </div>
            </div>

            <div className="flex items-center justify-center gap-6">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-xl ${isMuted ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'}`}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
              
              <button 
                onClick={() => setInCall(false)}
                className="w-20 h-16 rounded-[2rem] bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-2xl shadow-red-600/40 transition-all hover:scale-110 active:scale-90"
              >
                <PhoneOff className="w-8 h-8" />
              </button>

              <button 
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-xl ${isVideoOff ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'}`}
              >
                {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-3">
               <div className="p-3 bg-primary-600 rounded-xl text-white shadow-lg shadow-primary-600/20">
                 <MessageSquare className="w-5 h-5" />
               </div>
            </div>
          </div>
        </div>

        {/* Chat / Sidebar Area */}
        <div className="w-full lg:w-96 bg-white dark:bg-dark-800 rounded-[2.5rem] border border-slate-100 dark:border-dark-700 flex flex-col overflow-hidden transition-all duration-300 shadow-xl">
          <div className="p-6 border-b border-slate-50 dark:border-dark-700 bg-slate-50/50 dark:bg-dark-900/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-primary-600 rounded-xl text-white">
                 <MessageSquare className="w-4 h-4" />
               </div>
               <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-[10px]">Session Feed</h3>
            </div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            <div className="text-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-dark-900 px-3 py-1.5 rounded-full">Encrypted stream initialized • 09:55 AM</span>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="bg-slate-50 dark:bg-dark-900 p-4 rounded-3xl rounded-tl-lg w-[90%] border border-slate-100 dark:border-dark-700 shadow-sm">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">Hello, Dr. Jenkins will join your secure room in approximately 2 minutes. Please ensure your vitals are ready if available.</p>
                <div className="flex items-center gap-2 mt-3">
                   <div className="w-4 h-4 rounded-full bg-primary-600 flex items-center justify-center text-[8px] font-bold text-white">V</div>
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Vitalis Agent • 09:56 AM</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-dark-800 border-t border-slate-50 dark:border-dark-700">
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Secure message..." 
                className="w-full pl-6 pr-14 py-4 bg-slate-50/50 dark:bg-dark-900 border border-slate-100 dark:border-dark-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-600/20 hover:scale-105 active:scale-95 transition-all">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default PatientTelemedicine;
