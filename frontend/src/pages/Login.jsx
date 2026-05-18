import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, User, ArrowRight, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import PageTransition from '../components/layout/PageTransition';

const Login = ({ type = 'patient' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');

  const isAdminLogin = type === 'admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegistering) {
        await register(name, email, password, 'patient');
        toast.success('Account created! You can now sign in.');
        setIsRegistering(false);
        setLoading(false);
        return;
      }

      const user = await login(email, password);
      
      // Ensure they logged in with the correct portal
      if (isAdminLogin && user.role === 'patient') {
        throw new Error('Unauthorized access to Admin portal.');
      }
      if (!isAdminLogin && (user.role === 'admin' || user.role === 'staff' || user.role === 'doctor')) {
         throw new Error('Please use the Admin login portal.');
      }

      toast.success(`Welcome back, ${user.name}!`);
      
      if (user.role === 'admin' || user.role === 'staff' || user.role === 'doctor') {
        navigate('/admin');
      } else {
        navigate('/patient');
      }
    } catch (err) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-primary-50 dark:from-dark-900 dark:via-dark-950 dark:to-primary-950 p-4 transition-colors duration-500 relative">
        {/* Floating Back Button */}
        <button 
          onClick={() => navigate('/')} 
          className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-dark-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-dark-700 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all text-xs font-black uppercase tracking-widest z-50 cursor-pointer"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
          <span>Back to Home</span>
        </button>

        <div className="max-w-md w-full bg-white dark:bg-dark-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-dark-700 transition-all duration-300">
          <div className={`h-2 w-full ${isAdminLogin ? 'bg-blue-600' : 'bg-primary-600'}`}></div>
          
          <div className="p-8 sm:p-10">
            <div className="flex flex-col items-center mb-10 text-center">
              <div 
                onClick={() => navigate('/')}
                className="mb-6 p-4 bg-slate-50 dark:bg-dark-900 rounded-2xl border border-slate-100 dark:border-dark-700 shadow-inner cursor-pointer hover:scale-[1.02] active:scale-95 transition-all"
                title="Go to Homepage"
              >
                <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  Vitalis <span className="text-primary-600 animate-pulse">🤍</span> Hospital
                </span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white transition-colors tracking-tight">
                {isAdminLogin ? 'Admin Gateway' : (isRegistering ? 'Join Vitalis' : 'Patient Portal')}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 transition-colors font-medium">
                {isRegistering ? 'Start your journey to better health management.' : 'Secure access to your medical records and care.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isRegistering && (
                <div className="space-y-1.5 animate-in slide-in-from-top-4 duration-300">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-100 dark:border-dark-700 bg-slate-50/50 dark:bg-dark-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-100 dark:border-dark-700 bg-slate-50/50 dark:bg-dark-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium"
                    placeholder={isAdminLogin ? "admin@vitalis.com" : "patient@vitalis.com"}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-100 dark:border-dark-700 bg-slate-50/50 dark:bg-dark-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full text-white font-black py-4 rounded-2xl transition-all shadow-xl disabled:opacity-70 flex justify-center items-center gap-2 hover:scale-[1.02] active:scale-95 ${isAdminLogin ? 'bg-blue-600 shadow-blue-600/20' : 'bg-primary-600 shadow-primary-600/20'}`}
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <span>{isRegistering ? 'Initialize Account' : 'Secure Sign In'}</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {!isAdminLogin && (
              <div className="mt-8 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {isRegistering ? 'Already have an account?' : "New to Vitalis?"}{' '}
                  <button 
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="text-primary-600 dark:text-primary-400 font-black hover:underline ml-1"
                  >
                    {isRegistering ? 'Sign In' : 'Create Account'}
                  </button>
                </p>
              </div>
            )}

            <div className="mt-10 pt-8 border-t border-slate-50 dark:border-dark-700">
              <div className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Verified Test Credentials</span>
              </div>
              <div className="bg-slate-50 dark:bg-dark-900 p-4 rounded-2xl border border-slate-100 dark:border-dark-700 text-xs text-center transition-all">
                {isAdminLogin ? (
                  <p className="text-slate-500 font-medium leading-relaxed">
                    Use <span className="text-blue-600 font-black">admin@vitalis.com</span> with <span className="text-blue-600 font-black">admin123</span> to access staff features.
                  </p>
                ) : (
                  <p className="text-slate-500 font-medium leading-relaxed">
                    Use <span className="text-primary-600 font-black">patient@vitalis.com</span> with <span className="text-primary-600 font-black">patient123</span> for demo access.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Login;
