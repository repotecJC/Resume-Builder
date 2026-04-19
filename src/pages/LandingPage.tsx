import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = async () => {
    if (user) {
      navigate('/app');
    } else {
      try {
        await signInWithGoogle();
        navigate('/app');
      } catch (err) {
        console.error('Failed to sign in', err);
      }
    }
  };

  const handleLogin = async () => {
    if (user) {
      navigate('/app');
    } else {
      try {
        await signInWithGoogle();
        navigate('/app');
      } catch (err) {
        console.error('Failed to sign in', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f4ed] text-[#1c1c1c] font-sans" style={{ fontFamily: "'Camera Plain Variable', ui-sans-serif, system-ui" }}>
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-[#f7f4ed]/80 backdrop-blur-md border-b border-[#eceae4]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LucideIcons.Box className="w-6 h-6" />
            <span className="text-xl font-semibold tracking-tight">PresenceCV</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-[#5f5f5d] hover:text-[#1c1c1c] transition-colors text-sm font-medium">Features</a>
            <a href="#templates" className="text-[#5f5f5d] hover:text-[#1c1c1c] transition-colors text-sm font-medium">Templates</a>
            <a href="#pricing" className="text-[#5f5f5d] hover:text-[#1c1c1c] transition-colors text-sm font-medium">Pricing</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={handleLogin}
              className="text-[#1c1c1c] bg-transparent border border-[#1c1c1c]/40 rounded-md px-4 py-2 text-sm font-medium hover:opacity-80 transition-opacity"
            >
              {user ? 'Dashboard' : 'Log In'}
            </button>
            <button 
              onClick={handleGetStarted}
              className="bg-[#1c1c1c] text-[#fcfbf8] rounded-md px-4 py-2 text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ boxShadow: 'rgba(255,255,255,0.2) 0px 0.5px 0px 0px inset, rgba(0,0,0,0.2) 0px 0px 0px 0.5px inset, rgba(0,0,0,0.05) 0px 1px 2px 0px' }}
            >
              Get Started
            </button>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden p-2 text-[#1c1c1c]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <LucideIcons.X className="w-5 h-5" /> : <LucideIcons.Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-b border-[#eceae4] bg-[#f7f4ed] overflow-hidden"
            >
              <div className="flex flex-col p-6 gap-4">
                <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-[#5f5f5d] font-medium">Features</a>
                <a href="#templates" onClick={() => setIsMobileMenuOpen(false)} className="text-[#5f5f5d] font-medium">Templates</a>
                <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-[#5f5f5d] font-medium">Pricing</a>
                <hr className="border-[#eceae4]" />
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); handleLogin(); }}
                  className="w-full text-center text-[#1c1c1c] bg-transparent border border-[#1c1c1c]/40 rounded-md px-4 py-2 text-sm font-medium hover:opacity-80"
                >
                  {user ? 'Dashboard' : 'Log In'}
                </button>
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); handleGetStarted(); }}
                  className="w-full text-center bg-[#1c1c1c] text-[#fcfbf8] rounded-md px-4 py-2 text-sm font-medium hover:opacity-80"
                  style={{ boxShadow: 'rgba(255,255,255,0.2) 0px 0.5px 0px 0px inset, rgba(0,0,0,0.2) 0px 0px 0px 0.5px inset, rgba(0,0,0,0.05) 0px 1px 2px 0px' }}
                >
                  Get Started
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 md:pt-32 md:pb-40 px-6 max-w-[1200px] mx-auto text-center overflow-hidden">
        {/* Soft background gradient wash */}
        <div className="absolute inset-0 z-0 pointer-events-none flex justify-center items-center opacity-40 blur-3xl mix-blend-multiply">
          <div className="absolute bg-pink-300 w-96 h-96 rounded-full top-[10%] left-[10%] opacity-30 animate-pulse" />
          <div className="absolute bg-orange-300 w-96 h-96 rounded-full top-[20%] right-[15%] opacity-30 animate-pulse delay-700" />
          <div className="absolute bg-blue-300 w-80 h-80 rounded-full bottom-[10%] left-[30%] opacity-30 animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-4xl md:text-[48px] lg:text-[60px] font-semibold leading-[1.1] tracking-[-1.5px] text-[#1c1c1c] mb-6 max-w-4xl">
            Your resume, your presence.
          </h1>
          <p className="text-[18px] md:text-[20px] text-[#5f5f5d] leading-[1.38] mb-10 max-w-2xl font-normal">
            Build stunning, shareable resumes powered by AI — in minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button 
              onClick={handleGetStarted}
              className="w-full sm:w-auto bg-[#1c1c1c] text-[#fcfbf8] rounded-md px-6 py-3 text-base font-medium hover:opacity-80 transition-opacity"
              style={{ boxShadow: 'rgba(255,255,255,0.2) 0px 0.5px 0px 0px inset, rgba(0,0,0,0.2) 0px 0px 0px 0.5px inset, rgba(0,0,0,0.05) 0px 1px 2px 0px' }}
            >
              Start Building
            </button>
            <a 
              href="#templates"
              className="w-full sm:w-auto text-center text-[#1c1c1c] bg-transparent border border-[#1c1c1c]/40 rounded-md px-6 py-3 text-base font-medium hover:opacity-80 transition-opacity"
            >
              View Templates
            </a>
          </div>

          <motion.div 
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mt-20 w-full max-w-5xl bg-white rounded-2xl border border-[#eceae4] shadow-2xl overflow-hidden"
          >
            {/* Mockup Top Bar */}
            <div className="h-10 bg-[#f7f4ed] border-b border-[#eceae4] flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-orange-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            {/* Mockup Content - simplified visually */}
            <div className="p-8 md:p-12 text-left bg-white h-[400px] bg-gradient-to-b from-white to-[#f7f4ed]">
               <div className="w-32 h-32 bg-gray-200 rounded-full mb-6" />
               <div className="w-64 h-8 bg-gray-200 rounded-md mb-4" />
               <div className="w-48 h-5 bg-gray-200 rounded-md mb-8" />
               <div className="space-y-3">
                 <div className="w-full max-w-md h-4 bg-gray-100 rounded-md" />
                 <div className="w-full max-w-sm h-4 bg-gray-100 rounded-md" />
                 <div className="w-full max-w-lg h-4 bg-gray-100 rounded-md" />
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 px-6 border-t border-[#eceae4]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-[48px] font-semibold leading-[1.0] tracking-[-1.2px] mb-4">Why PresenceCV?</h2>
            <p className="text-[18px] text-[#5f5f5d]">Everything you need to showcase your best self.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#f7f4ed] border border-[#eceae4] p-8 rounded-2xl flex flex-col items-start transition-transform hover:-translate-y-1">
              <div className="p-3 bg-white rounded-lg border border-[#eceae4] mb-6">
                <LucideIcons.Sparkles className="w-6 h-6 text-[#1c1c1c]" />
              </div>
              <h3 className="text-[20px] font-medium leading-[1.25] mb-2 text-[#1c1c1c]">AI-Powered Content</h3>
              <p className="text-[16px] text-[#5f5f5d] leading-[1.5]">Gemini AI helps you phrase and optimize your resume effortlessly.</p>
            </div>
            
            <div className="bg-[#f7f4ed] border border-[#eceae4] p-8 rounded-2xl flex flex-col items-start transition-transform hover:-translate-y-1">
              <div className="p-3 bg-white rounded-lg border border-[#eceae4] mb-6">
                <LucideIcons.Share2 className="w-6 h-6 text-[#1c1c1c]" />
              </div>
              <h3 className="text-[20px] font-medium leading-[1.25] mb-2 text-[#1c1c1c]">Live Share Link</h3>
              <p className="text-[16px] text-[#5f5f5d] leading-[1.5]">Share a URL that updates instantly in real-time as you edit.</p>
            </div>

            <div className="bg-[#f7f4ed] border border-[#eceae4] p-8 rounded-2xl flex flex-col items-start transition-transform hover:-translate-y-1">
              <div className="p-3 bg-white rounded-lg border border-[#eceae4] mb-6">
                <LucideIcons.FileText className="w-6 h-6 text-[#1c1c1c]" />
              </div>
              <h3 className="text-[20px] font-medium leading-[1.25] mb-2 text-[#1c1c1c]">PDF Export</h3>
              <p className="text-[16px] text-[#5f5f5d] leading-[1.5]">Clean, print-optimized formatting ready for ATS tracking.</p>
            </div>

            <div className="bg-[#f7f4ed] border border-[#eceae4] p-8 rounded-2xl flex flex-col items-start transition-transform hover:-translate-y-1">
              <div className="p-3 bg-white rounded-lg border border-[#eceae4] mb-6">
                <LucideIcons.Layers className="w-6 h-6 text-[#1c1c1c]" />
              </div>
              <h3 className="text-[20px] font-medium leading-[1.25] mb-2 text-[#1c1c1c]">Multi-Profile Setup</h3>
              <p className="text-[16px] text-[#5f5f5d] leading-[1.5]">Easily duplicate and tailor resumes for different opportunities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="templates" className="py-20 md:py-32 px-6 border-t border-[#eceae4]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl md:text-[48px] font-semibold leading-[1.0] tracking-[-1.2px] mb-4">Start with a strong foundation</h2>
            <p className="text-[18px] text-[#5f5f5d]">Pick a layout that suits your professional style.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group">
              <div className="aspect-[3/4] bg-white border border-[#eceae4] rounded-2xl mb-4 overflow-hidden relative flex justify-center items-center shadow-sm">
                 <div className="w-[80%] h-[90%] bg-gradient-to-br from-indigo-100 to-white rounded-md shadow-sm border border-[#eceae4] p-6 relative">
                    <div className="w-16 h-16 bg-white border border-[#eceae4] rounded-full mx-auto mb-4" />
                    <div className="w-24 h-3 bg-gray-200 mx-auto rounded-full mb-8" />
                    <div className="w-full h-2 bg-gray-100 rounded-full mb-2" />
                    <div className="w-[80%] h-2 bg-gray-100 rounded-full mb-8" />
                 </div>
                 <div className="absolute inset-0 bg-[#f7f4ed]/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={handleGetStarted}
                      className="bg-[#1c1c1c] text-[#fcfbf8] rounded-md px-4 py-2 text-sm font-medium hover:opacity-80"
                      style={{ boxShadow: 'rgba(255,255,255,0.2) 0px 0.5px 0px 0px inset, rgba(0,0,0,0.2) 0px 0px 0px 0.5px inset, rgba(0,0,0,0.05) 0px 1px 2px 0px' }}
                    >
                      Use Template
                    </button>
                 </div>
              </div>
              <h4 className="text-[20px] font-medium text-[#1c1c1c]">Creative Standard</h4>
            </div>

            <div className="group">
              <div className="aspect-[3/4] bg-white border border-[#eceae4] rounded-2xl mb-4 overflow-hidden relative flex justify-center items-center shadow-sm">
                 <div className="w-[80%] h-[90%] bg-gradient-to-br from-emerald-100 to-white rounded-md shadow-sm border border-[#eceae4] p-6 flex flex-row gap-4 relative">
                    <div className="w-12 h-12 bg-white border border-[#eceae4] rounded-md shrink-0" />
                    <div className="flex-1">
                      <div className="w-24 h-3 bg-gray-200 rounded-full mb-4" />
                      <div className="w-full h-2 bg-gray-100 rounded-full mb-2" />
                      <div className="w-full h-2 bg-gray-100 rounded-full mb-8" />
                    </div>
                 </div>
                 <div className="absolute inset-0 bg-[#f7f4ed]/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={handleGetStarted}
                      className="bg-[#1c1c1c] text-[#fcfbf8] rounded-md px-4 py-2 text-sm font-medium hover:opacity-80"
                      style={{ boxShadow: 'rgba(255,255,255,0.2) 0px 0.5px 0px 0px inset, rgba(0,0,0,0.2) 0px 0px 0px 0.5px inset, rgba(0,0,0,0.05) 0px 1px 2px 0px' }}
                    >
                      Use Template
                    </button>
                 </div>
              </div>
              <h4 className="text-[20px] font-medium text-[#1c1c1c]">Minimalist Tech</h4>
            </div>

            <div className="group">
              <div className="aspect-[3/4] bg-white border border-[#eceae4] rounded-2xl mb-4 overflow-hidden relative flex justify-center items-center shadow-sm">
                 <div className="w-[80%] h-[90%] bg-gradient-to-br from-rose-100 to-white rounded-md shadow-sm border border-[#eceae4] p-6 relative">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="w-24 h-3 bg-gray-200 rounded-full mb-2" />
                        <div className="w-16 h-2 bg-gray-200 rounded-full" />
                      </div>
                      <div className="w-10 h-10 bg-white border border-[#eceae4] rounded-full" />
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full mb-2" />
                    <div className="w-[80%] h-2 bg-gray-100 rounded-full mb-8" />
                 </div>
                 <div className="absolute inset-0 bg-[#f7f4ed]/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={handleGetStarted}
                      className="bg-[#1c1c1c] text-[#fcfbf8] rounded-md px-4 py-2 text-sm font-medium hover:opacity-80"
                      style={{ boxShadow: 'rgba(255,255,255,0.2) 0px 0.5px 0px 0px inset, rgba(0,0,0,0.2) 0px 0px 0px 0.5px inset, rgba(0,0,0,0.05) 0px 1px 2px 0px' }}
                    >
                      Use Template
                    </button>
                 </div>
              </div>
              <h4 className="text-[20px] font-medium text-[#1c1c1c]">Executive Flow</h4>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-32 px-6 border-t border-[#eceae4] bg-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-[48px] font-semibold leading-[1.0] tracking-[-1.2px] mb-4">Simple, transparent limits.</h2>
          <p className="text-[18px] text-[#5f5f5d] mb-16">Start for free and build your resume immediately.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-3xl mx-auto">
            <div className="bg-[#f7f4ed] border border-[#eceae4] p-8 rounded-2xl flex flex-col">
              <h3 className="text-[24px] font-semibold mb-2">Free</h3>
              <p className="text-[#5f5f5d] mb-6">Everything you need to land an interview.</p>
              <div className="text-[36px] font-semibold tracking-tight mb-8">$0<span className="text-[18px] font-normal text-[#5f5f5d]">/mo</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3"><LucideIcons.Check className="w-5 h-5 text-[#1c1c1c]" /> 1 Resume Profile</li>
                <li className="flex items-center gap-3"><LucideIcons.Check className="w-5 h-5 text-[#1c1c1c]" /> PDF Export</li>
                <li className="flex items-center gap-3"><LucideIcons.Check className="w-5 h-5 text-[#1c1c1c]" /> Public Share Link</li>
              </ul>
              <button 
                onClick={handleGetStarted}
                className="w-full text-center text-[#1c1c1c] bg-transparent border border-[#1c1c1c]/40 rounded-md px-6 py-3 text-base font-medium hover:opacity-80"
              >
                Current Plan
              </button>
            </div>
            
            <div className="bg-[#1c1c1c] text-[#fcfbf8] p-8 rounded-2xl flex flex-col relative shadow-2xl">
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Coming Soon
              </div>
              <h3 className="text-[24px] font-semibold mb-2 text-[#fcfbf8]">Pro</h3>
              <p className="opacity-80 mb-6 text-[16px]">For power users and active job seekers.</p>
              <div className="text-[36px] font-semibold tracking-tight mb-8 text-[#fcfbf8]">$X<span className="text-[18px] font-normal opacity-80">/mo</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3"><LucideIcons.Check className="w-5 h-5" /> Unlimited Profiles</li>
                <li className="flex items-center gap-3"><LucideIcons.Check className="w-5 h-5" /> Advanced AI Generation</li>
                <li className="flex items-center gap-3"><LucideIcons.Check className="w-5 h-5" /> Analytics for Shared links</li>
                <li className="flex items-center gap-3"><LucideIcons.Check className="w-5 h-5" /> Custom Domains</li>
              </ul>
              <button className="w-full text-center bg-white text-[#1c1c1c] rounded-md px-6 py-3 text-base font-medium opacity-50 cursor-not-allowed">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[#eceae4] px-6 text-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <LucideIcons.Box className="w-5 h-5 text-[#1c1c1c]" />
            <span className="font-semibold text-[#1c1c1c]">PresenceCV</span>
            <span className="text-[#5f5f5d] ml-2">© 2025 PresenceCV</span>
          </div>
          <div className="flex gap-6 text-[#5f5f5d]">
            <a href="#features" className="hover:text-[#1c1c1c] transition-colors">Features</a>
            <a href="#templates" className="hover:text-[#1c1c1c] transition-colors">Templates</a>
            <a href="#" className="hover:text-[#1c1c1c] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#1c1c1c] transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
