'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, Loader2, ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "../../lib/utils";
import CustomAlert from '@/components/ui/custom-alert';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [setupSuccess, setSetupSuccess] = useState(false);

  useEffect(() => {
    // 1. Check if setup is required
    fetch('/api/setup')
      .then(res => res.json())
      .then(data => {
        if (data.setupRequired) {
          router.push('/setup');
        }
      });

    // 2. Check for setup success message
    if (searchParams.get('setup') === 'success') {
      setSetupSuccess(true);
    }
  }, [router, searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        setAlert({ message: 'Authentication Successful', type: 'success' });
        setTimeout(() => router.push('/'), 1000);
      } else {
        const data = await res.json();
        setAlert({ message: data.error || 'Invalid credentials', type: 'error' });
      }
    } catch (err) {
      setAlert({ message: 'Connection error', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-700" />

      <div className="w-full max-w-6xl relative z-10 animate-in fade-in zoom-in duration-700 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

        {/* Left Side: Branding */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
          <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-8 border border-border group hover:rotate-6 transition-transform cursor-default">
            <span className="text-white font-black text-3xl italic">AT</span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="h-0.5 w-8 bg-blue-500 rounded-full hidden lg:block" />
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest">
                <Lock className="w-3.5 h-3.5" />
                Secure Access
              </div>
            </div>

            <h1 className="text-5xl lg:text-7xl font-black text-foreground italic tracking-tighter uppercase leading-[0.9]">
              Authenticate<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500">AdTrack</span>
            </h1>

            <p className="text-muted-foreground text-sm font-medium max-w-md leading-relaxed">
              Welcome back to the enterprise advertising command center.
              Please verify your administrative credentials to access your data terminal.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full max-w-lg lg:max-w-md xl:max-w-lg">
          <Card className="bg-card/40 border-border backdrop-blur-xl shadow-2xl rounded-[3rem] overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />

            <CardHeader className="pt-12 pb-6 text-center border-b border-border bg-white/[0.01]">
              <CardTitle className="text-2xl font-bold text-foreground tracking-tight">Admin Terminal</CardTitle>
              <CardDescription className="text-muted-foreground font-medium">Verify your synchronization key</CardDescription>
            </CardHeader>

            <CardContent className="p-8 lg:p-12">
              <form onSubmit={handleLogin} className="space-y-6 relative">
                {alert && (
                  <CustomAlert
                    message={alert.message}
                    type={alert.type}
                    onClose={() => setAlert(null)}
                  />
                )}
                {setupSuccess && !alert && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] py-4 px-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 mb-6 animate-in slide-in-from-top-4 duration-500">
                    <CheckCircle2 className="w-4 h-4" />
                    Setup Completed Successfully
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Admin Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-background/50 border border-border rounded-2xl py-4 pl-12 pr-4 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium"
                      placeholder="Enter email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Secret Key</label>
                    <Link href="/forgot-password" title="Forgot Password?" className="text-[10px] font-black uppercase tracking-widest text-blue-500/60 hover:text-blue-600 transition-colors">
                      Recovery?
                    </Link>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-background/50 border border-border rounded-2xl py-4 pl-12 pr-12 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    "w-full h-14 bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl shadow-xl hover:opacity-90 disabled:opacity-50 transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-4 group",
                    loading ? "cursor-wait" : ""
                  )}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Authorize Access
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center mt-12 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/50">
            Stakers Choice Command v1.0.4
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
