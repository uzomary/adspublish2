'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Loader2, Rocket, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "../../lib/utils";
import CustomAlert from '@/components/ui/custom-alert';

export default function SetupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch('/api/setup')
      .then(res => res.json())
      .then(data => {
        if (data.setupRequired === false) {
          router.push('/login');
        } else {
          setChecking(false);
        }
      });
  }, [router]);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        setAlert({ message: 'Setup completed successfully!', type: 'success' });
        setTimeout(() => router.push('/login?setup=success'), 1500);
      } else {
        const data = await res.json();
        setAlert({ message: data.error || 'Setup failed', type: 'error' });
      }
    } catch (err) {
      setAlert({ message: 'Connection error', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (checking) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse delay-700" />
      
      <div className="w-full max-w-6xl relative z-10 animate-in fade-in zoom-in duration-700 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        
        {/* Left Side: Branding */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
          <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-8 border border-white/10 group group-hover:rotate-6 transition-transform">
            <Rocket className="w-12 h-12 text-white" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="h-0.5 w-8 bg-blue-500 rounded-full hidden lg:block" />
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5" />
                First-time Setup
              </div>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black text-white italic tracking-tighter uppercase leading-[0.9]">
              Initialize<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">AdTrack</span>
            </h1>
            
            <p className="text-slate-400 text-sm font-medium max-w-md leading-relaxed">
              Welcome to your new enterprise advertising tracking platform. 
              Configure your master administrative account to begin managing campaigns and analytics.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-6 w-full max-w-md">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
               <div className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1">Security</div>
               <div className="text-xs text-slate-500 font-bold">256-bit JWT Encryption</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
               <div className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1">Database</div>
               <div className="text-xs text-slate-500 font-bold">Supabase Postgres</div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full max-w-lg lg:max-w-md xl:max-w-lg">
          <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] rounded-[3rem] overflow-hidden">
            <CardHeader className="pt-12 pb-6 text-center border-b border-white/5 bg-white/[0.01]">
              <CardTitle className="text-2xl font-bold text-white tracking-tight">Create Master Admin</CardTitle>
              <CardDescription className="text-slate-500 font-medium">Set up your primary secure identity</CardDescription>
            </CardHeader>

            <CardContent className="p-8 lg:p-12">
              <form onSubmit={handleSetup} className="space-y-6 relative">
              {alert && (
                <CustomAlert 
                  message={alert.message} 
                  type={alert.type} 
                  onClose={() => setAlert(null)} 
                />
              )}
              <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Admin Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium"
                      placeholder="you@company.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Secure Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium"
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    "w-full h-14 bg-white text-[#020617] font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl shadow-xl hover:bg-slate-100 disabled:opacity-50 transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-4",
                    loading ? "cursor-wait" : ""
                  )}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Finalize Setup
                      <ShieldCheck className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
