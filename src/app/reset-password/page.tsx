'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Loader2, CheckCircle2, ArrowRight, ShieldAlert, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "../../lib/utils";
import CustomAlert from '@/components/ui/custom-alert';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [success, setSuccess] = useState(false);
  const token = searchParams.get('token');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { setAlert({ message: 'Missing token', type: 'error' }); return; }
    if (password !== confirm) { setAlert({ message: 'Passwords do not match', type: 'error' }); return; }
    
    setLoading(true);
    setAlert(null);

    try {
      const res = await fetch('/api/auth/reset-password/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      if (res.ok) {
        setAlert({ message: 'Password Updated Successfully', type: 'success' });
        setSuccess(true);
        setTimeout(() => router.push('/login'), 2000);
      } else {
        const d = await res.json();
        setAlert({ message: d.error || 'Failed to reset password', type: 'error' });
      }
    } catch (err) {
      setAlert({ message: 'Connection error', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!token) return (
    <div className="text-center p-12 bg-rose-500/10 rounded-[2rem] border border-rose-500/20 max-w-md mx-auto">
      <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-white mb-2 italic uppercase">Invalid Link</h2>
      <p className="text-slate-400 text-sm">This reset link is malformed or has expired. Please request a new one.</p>
      <button onClick={() => router.push('/forgot-password')} className="mt-8 text-blue-500 text-[10px] font-black uppercase tracking-widest hover:text-blue-400">Request New Link</button>
    </div>
  );

  return (
    <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] rounded-[3rem] overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
      
      {success ? (
        <div className="p-16 text-center animate-in zoom-in duration-500">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/10">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-4 italic uppercase tracking-tight">Sync Complete!</h2>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            Your administrative synchronization key has been securely updated. Redirecting to access terminal...
          </p>
        </div>
      ) : (
        <>
          <CardHeader className="pt-12 pb-6 text-center border-b border-white/5 bg-white/[0.01]">
            <CardTitle className="text-2xl font-bold text-white tracking-tight">Sync New Key</CardTitle>
            <CardDescription className="text-slate-500 font-medium">Verify your recovery overwrite</CardDescription>
          </CardHeader>
          <CardContent className="p-8 lg:p-12">
            <form onSubmit={handleReset} className="space-y-6 relative">
              {alert && (
                <CustomAlert 
                  message={alert.message} 
                  type={alert.type} 
                  onClose={() => setAlert(null)} 
                />
              )}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">New Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium"
                    placeholder="••••••••"
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

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Confirm Identity Key</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium"
                    placeholder="Repeat new password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full h-14 bg-white text-[#020617] font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl shadow-xl hover:bg-slate-100 disabled:opacity-50 transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-4 group",
                  loading ? "cursor-wait" : ""
                )}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Save New Access Key
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </CardContent>
        </>
      )}
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse delay-700" />
      
      <div className="w-full max-w-6xl relative z-10 animate-in fade-in zoom-in duration-700 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        
        {/* Left Side: Branding */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
          <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-2xl border border-border mb-8 group hover:rotate-6 transition-transform">
            <Lock className="w-10 h-10 text-white" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="h-0.5 w-8 bg-blue-500 rounded-full hidden lg:block" />
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest">
                <ShieldAlert className="w-3.5 h-3.5" />
                Security Overwrite
              </div>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black text-foreground italic tracking-tighter uppercase leading-[0.9]">
              Sync New<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500">Credentials</span>
            </h1>
            
            <p className="text-muted-foreground text-sm font-medium max-w-md leading-relaxed">
              Identity verification complete. Finalize your administrative reset by providing a new master synchronization key.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-sm">
             <div className="p-4 rounded-2xl bg-secondary/30 border border-border backdrop-blur-sm">
                <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Audit Log</div>
                <div className="text-[10px] text-emerald-500 font-bold uppercase">Token Validated</div>
             </div>
             <div className="p-4 rounded-2xl bg-secondary/30 border border-border backdrop-blur-sm">
                <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Encrypted</div>
                <div className="text-[10px] text-blue-500 font-bold uppercase">End-to-End SSL</div>
             </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full max-w-lg lg:max-w-md xl:max-w-lg">
          <Suspense fallback={
            <div className="w-full h-96 bg-card/40 rounded-[3rem] border border-border flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
          
          <p className="text-center mt-12 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/50">
            Stakers Choice Ads Recovery Engine v1.0.4
          </p>
        </div>
      </div>
    </div>
  );
}
