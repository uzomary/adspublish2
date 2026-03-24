'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Mail, Loader2, ArrowLeft, Send, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "../../lib/utils";
import CustomAlert from '@/components/ui/custom-alert';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [debugLink, setDebugLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);
    setDebugLink(null);

    try {
      const res = await fetch('/api/auth/reset-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const d = await res.json();
      if (res.ok) {
        setAlert({ message: 'Instructions Sent. Check your inbox.', type: 'success' });
        if (d.debugLink) {
          setDebugLink(d.debugLink);
        }
      } else {
        setAlert({ message: d.error || 'Failed to send request', type: 'error' });
      }
    } catch (err) {
      setAlert({ message: 'Connection error', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse delay-700" />

      <div className="w-full max-w-6xl relative z-10 animate-in fade-in zoom-in duration-700 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

        {/* Left Side: Branding */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
          <Link href="/login" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-[10px] font-black uppercase tracking-widest mb-12 transition-colors group" title="Back to Login">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            Back to Portal
          </Link>

          <div className="w-24 h-24 rounded-[2rem] bg-sidebar border border-sidebar-border flex items-center justify-center shadow-2xl mb-8 group hover:rotate-6 transition-transform">
            <Mail className="w-10 h-10 text-blue-500" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="h-0.5 w-8 bg-blue-500 rounded-full hidden lg:block" />
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest">
                <Send className="w-3.5 h-3.5" />
                Identity Recovery
              </div>
            </div>

            <h1 className="text-5xl lg:text-7xl font-black text-foreground italic tracking-tighter uppercase leading-[0.9]">
              Restore<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500">Access</span>
            </h1>

            <p className="text-muted-foreground text-sm font-medium max-w-md leading-relaxed">
              Lost your administrative synchronization key?
              Enter your verified email below to receive a secure recovery link.
            </p>
          </div>

          <div className="mt-12 p-6 rounded-3xl bg-secondary/30 border border-border border-dashed max-w-sm">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-relaxed">
              Recovery links are single-use and expire after 60 minutes for security auditing purposes.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full max-w-lg lg:max-w-md xl:max-w-lg">
          <Card className="bg-card/40 border-border backdrop-blur-xl shadow-2xl rounded-[3rem] overflow-hidden">
            <CardHeader className="pt-12 pb-6 text-center border-b border-border bg-white/[0.01]">
              <CardTitle className="text-2xl font-bold text-foreground tracking-tight">Recover Identity</CardTitle>
              <CardDescription className="text-muted-foreground font-medium">Administrative Security Protocol</CardDescription>
            </CardHeader>

            <CardContent className="p-8 lg:p-12">
              <form onSubmit={handleSubmit} className="space-y-6 relative">
                {alert && (
                  <CustomAlert
                    message={alert.message}
                    type={alert.type}
                    onClose={() => setAlert(null)}
                  />
                )}

                {debugLink && (
                  <div className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-6 animate-in zoom-in duration-500">
                    <div className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-3">Dev Mode: Reset Link Found</div>
                    <Link
                      href={debugLink}
                      className="inline-flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/20"
                    >
                      Follow Recovery Link
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <p className="mt-3 text-[9px] text-muted-foreground font-medium leading-relaxed">
                      Note: You are seeing this because RESEND_API_KEY is not configured in your .env file.
                    </p>
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
                      Distribute Link
                      <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center mt-12 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/50">
            Secure Recovery Node alpha-1
          </p>
        </div>
      </div>
    </div>
  );
}
