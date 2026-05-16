import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Activity, Heart, Shield, Clock, Phone, Mail, MapPin, Award, ThumbsUp, Users, Send, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';
import logo from '../assets/logo.png';

// --- Subcomponents ---

const Carousel = ({ onBookClick }) => {
  const slides = [
    {
      image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop",
      quote: "Compassionate Care, Advanced Medicine.",
      sub: "Leading the way in modern healthcare solutions."
    },
    {
      image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=2000&auto=format&fit=crop",
      quote: "Your Health is Our Priority.",
      sub: "World-class facilities at your fingertips."
    },
    {
      image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2000&auto=format&fit=crop",
      quote: "Expert Specialists, 24/7.",
      sub: "We are always here when you need us most."
    }
  ];
  
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative h-[600px] md:h-[700px] w-full overflow-hidden group">
      {slides.map((slide, index) => (
        <div 
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          <div className="absolute inset-0 bg-slate-900/40 z-10"></div>
          <img src={slide.image} alt="Hospital" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">{slide.quote}</h2>
            <p className="text-lg md:text-2xl text-slate-100 drop-shadow-md mb-8">{slide.sub}</p>
            <button 
              onClick={onBookClick}
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-xl shadow-primary-600/30 hover:scale-105 active:scale-95"
            >
              Book Appointment Now
            </button>
          </div>
        </div>
      ))}
      <button 
        onClick={() => setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>
      <button 
        onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronRight className="w-8 h-8" />
      </button>
    </div>
  );
};

const Facilities = () => {
  const facilities = [
    { icon: Activity, title: 'Pathology Lab', desc: 'State-of-the-art diagnostic testing.' },
    { icon: Heart, title: 'Cardiology', desc: 'Comprehensive heart care.' },
    { icon: Clock, title: '24/7 Emergency', desc: 'Round-the-clock emergency services.' },
    { icon: Shield, title: 'Dental Care', desc: 'Advanced dental and orthodontic treatments.' },
    { icon: Users, title: 'General Care', desc: 'Primary healthcare for all ages.' },
    { icon: MapPin, title: 'Eye Care', desc: 'Specialized ophthalmology department.' }
  ];

  return (
    <section id="facilities" className="py-20 bg-gradient-to-b from-slate-50 to-primary-50 dark:from-dark-900 dark:to-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Our Facilities</h2>
          <div className="w-20 h-1 bg-primary-600 mx-auto mt-4 rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {facilities.map((fac, idx) => (
            <div key={idx} className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-dark-700 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
              <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-xl flex items-center justify-center mb-6">
                <fac.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{fac.title}</h3>
              <p className="text-slate-600 dark:text-slate-400">{fac.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Main Home Component ---

const Home = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleBookClick = () => {
    if (user) {
      if (user.role === 'patient') {
        navigate('/patient');
      } else {
        navigate('/admin');
      }
    } else {
      navigate('/login/patient');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50 dark:from-dark-900 dark:via-dark-900 dark:to-primary-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-dark-900/80 backdrop-blur-lg border-b border-slate-200/50 dark:border-dark-700/50 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Vitalis <span className="text-primary-600">🤍</span> Hospital
              </span>
            </div>
            
            <div className="hidden lg:flex space-x-8">
              <a href="#home" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">Home</a>
              <a href="#about" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">About</a>
              <a href="#facilities" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">Facilities</a>
              <a href="#doctors" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">Doctors</a>
              <a href="#contact" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">Contact</a>
            </div>

            <div className="flex items-center space-x-3 sm:space-x-4">
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-600 dark:text-slate-300 transition-colors"
                title="Toggle Theme"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              {!user ? (
                <>
                  <Link 
                    to="/login/admin" 
                    className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors text-sm sm:text-base hidden sm:block"
                  >
                    Admin
                  </Link>
                  <Link 
                    to="/login/patient" 
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-medium transition-colors shadow-sm shadow-primary-600/20 text-sm sm:text-base"
                  >
                    Login
                  </Link>
                </>
              ) : (
                <Link 
                  to={user.role === 'admin' ? '/admin' : '/patient'}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-medium transition-colors shadow-sm shadow-primary-600/20 text-sm sm:text-base flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div id="home" className="pt-20">
        <Carousel onBookClick={handleBookClick} />
        
        <Facilities />

        {/* Summary Section */}
        <section id="about" className="py-20 bg-white dark:bg-dark-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              <div className="lg:w-1/2">
                <img 
                  src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=1000&auto=format&fit=crop" 
                  alt="Hospital Interior" 
                  className="rounded-2xl shadow-xl w-full object-cover h-[400px]"
                />
              </div>
              <div className="lg:w-1/2 space-y-6">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">A Legacy of Excellence in Healthcare</h2>
                <div className="w-20 h-1 bg-primary-600 rounded-full"></div>
                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                  Founded in 1995, Vitalis Hospital has grown from a small community clinic into a premier multi-specialty healthcare institution. We specialize in cardiology, orthopedics, and comprehensive emergency care.
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-6">
                  Our mission is to provide affordable, world-class medical services to our community. With our new digital patient portal, managing your health has never been easier.
                </p>
                <button 
                  onClick={handleBookClick}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-md hover:shadow-lg shadow-primary-600/20"
                >
                  Book an Appointment
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-20 bg-slate-50 dark:bg-dark-900 border-y border-slate-200 dark:border-dark-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Why Choose Vitalis</h2>
              <div className="w-20 h-1 bg-primary-600 mx-auto mt-4 rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-dark-800 p-8 rounded-2xl text-center shadow-sm border border-slate-200 dark:border-dark-700">
                <Award className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Award Winning</h3>
                <p className="text-slate-600 dark:text-slate-400">Recognized nationally for excellence in patient safety and clinical outcomes.</p>
              </div>
              <div className="bg-white dark:bg-dark-800 p-8 rounded-2xl text-center shadow-sm border border-slate-200 dark:border-dark-700">
                <Shield className="w-12 h-12 text-primary-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">JCI Accredited</h3>
                <p className="text-slate-600 dark:text-slate-400">Strictly adhering to global healthcare standards and rigorous quality protocols.</p>
              </div>
              <div className="bg-white dark:bg-dark-800 p-8 rounded-2xl text-center shadow-sm border border-slate-200 dark:border-dark-700">
                <ThumbsUp className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Exceptional Experience</h3>
                <p className="text-slate-600 dark:text-slate-400">Over 50,000+ satisfied patients per year trusting us with their families.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Feedback Section */}
        <section className="py-20 bg-white dark:bg-dark-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Patient Feedback</h2>
              <div className="w-20 h-1 bg-primary-600 mx-auto mt-4 rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-50 dark:bg-dark-900 p-8 rounded-2xl border border-slate-200 dark:border-dark-700 relative">
                <div className="text-4xl text-primary-200 dark:text-primary-900/50 absolute top-4 left-4 font-serif">"</div>
                <p className="text-slate-600 dark:text-slate-400 italic mb-6 relative z-10 text-lg">
                  "The doctors and nurses at Vitalis were incredibly attentive during my surgery recovery. The facility was spotless, and the new patient portal made checking my lab results a breeze."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center font-bold text-primary-600">JD</div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">John Doe</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Cardiology Patient</p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-dark-900 p-8 rounded-2xl border border-slate-200 dark:border-dark-700 relative">
                <div className="text-4xl text-primary-200 dark:text-primary-900/50 absolute top-4 left-4 font-serif">"</div>
                <p className="text-slate-600 dark:text-slate-400 italic mb-6 relative z-10 text-lg">
                  "I was rushed to the ER in the middle of the night. The 24/7 emergency staff were incredibly fast, professional, and saved my life. I cannot thank this hospital enough."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center font-bold text-primary-600">MS</div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Maria Smith</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Emergency Care</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section id="contact" className="py-20 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 blur-[120px] rounded-full pointer-events-none"></div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black tracking-tight">Send Us a Message</h2>
              <p className="text-slate-400 mt-4 font-medium">Have a question or feedback? We'd love to hear from you.</p>
            </div>
            
            <form 
              className="bg-slate-800/50 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] border border-white/5 shadow-2xl" 
              onSubmit={async (e) => {
                e.preventDefault();
                const btn = e.target.querySelector('button');
                const originalText = btn.innerHTML;
                const formData = new FormData(e.target);
                const payload = {
                  name: formData.get('name'),
                  email: formData.get('email'),
                  message: formData.get('message')
                };

                btn.disabled = true;
                btn.innerHTML = '<div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Transmitting...';
                
                try {
                  const res = await fetch(`${API_URL}/api/notifications/public-contact`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                  });

                  if (res.ok) {
                    toast.success("Message Transmitted Successfully", {
                      description: "Our administrative team has been notified of your inquiry.",
                    });
                    e.target.reset();
                  } else {
                    const data = await res.json();
                    toast.error(data.message || "Transmission Failed");
                  }
                } catch (err) {
                  toast.error("Network Latency Detected", {
                    description: "Please verify your connection and try again."
                  });
                } finally {
                  btn.disabled = false;
                  btn.innerHTML = originalText;
                }
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Your Full Name</label>
                  <input name="name" required type="text" className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-bold placeholder:text-slate-700" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Security-Verified Email</label>
                  <input name="email" required type="email" className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-bold placeholder:text-slate-700" placeholder="john@example.com" />
                </div>
              </div>
              <div className="mb-8 space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Message Detail</label>
                <textarea name="message" required rows="5" className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium resize-none placeholder:text-slate-700" placeholder="Describe your inquiry or feedback..."></textarea>
              </div>
              <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black uppercase tracking-widest text-[11px] py-5 rounded-2xl transition-all shadow-2xl shadow-primary-600/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 disabled:opacity-70">
                <Send className="w-4 h-4" />
                Transmit Message
              </button>
              
              <div className="mt-8 flex items-center justify-center gap-6 opacity-40">
                 <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-primary-400" />
                    <span className="text-[9px] font-black uppercase tracking-widest">End-to-End Encrypted</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-primary-400" />
                    <span className="text-[9px] font-black uppercase tracking-widest">24h Response Target</span>
                 </div>
              </div>
            </form>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-950 py-12 border-t border-slate-800 text-slate-400 text-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  Vitalis 🤍 Hospital
                </span>
              </div>
              <p className="mb-4">Providing world-class healthcare with compassion and advanced technology since 1995.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#home" className="hover:text-primary-400 transition-colors">Home</a></li>
                <li><a href="#about" className="hover:text-primary-400 transition-colors">About Us</a></li>
                <li><a href="#facilities" className="hover:text-primary-400 transition-colors">Facilities</a></li>
                <li><Link to="/login/patient" className="hover:text-primary-400 transition-colors">Patient Portal</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 uppercase tracking-wider">Contact</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary-500 shrink-0" />
                  <span>123 Health Avenue, Medical District, NY 10001</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary-500 shrink-0" />
                  <span>1-800-VITALIS (848-2547)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary-500 shrink-0" />
                  <span>info@vitalis.com</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 uppercase tracking-wider">Emergency</h4>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
                <Phone className="w-8 h-8 text-red-500 mx-auto mb-2 animate-pulse" />
                <p className="text-red-400 font-bold text-lg">24/7 Hotline</p>
                <p className="text-white text-xl font-black tracking-wider">911</p>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-center">
            <p>&copy; {new Date().getFullYear()} Vitalis Hospital System. All rights reserved.</p>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default Home;
