'use client';
import { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Info, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomAlertProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export default function CustomAlert({ 
  message, 
  type = 'info', 
  onClose, 
  duration = 3000 
}: CustomAlertProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      
      if (elapsed >= duration) {
        clearInterval(interval);
        onClose();
      }
    }, 10);

    return () => clearInterval(interval);
  }, [duration, onClose]);

  const icons: Record<string, LucideIcon> = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info
  };
  const Icon = icons[type];

  const colors = {
    success: "from-emerald-500/10 via-slate-950 to-slate-950 border-emerald-500/50 text-emerald-400 shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)]",
    error: "from-rose-500/10 via-slate-950 to-slate-950 border-rose-500/50 text-rose-400 shadow-[0_0_40px_-10px_rgba(244,63,94,0.3)]",
    info: "from-blue-500/10 via-slate-950 to-slate-950 border-blue-500/50 text-blue-400 shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)]"
  };

  const barColors = {
    success: "bg-emerald-500",
    error: "bg-rose-500",
    info: "bg-blue-500"
  };

  return (
    <div className={cn(
      "absolute inset-x-6 top-1/2 -translate-y-1/2 z-[100] animate-in fade-in zoom-in duration-300",
      "flex flex-col items-center pointer-events-none"
    )}>
      <div className={cn(
        "w-full max-w-[340px] bg-slate-950 border-2 rounded-[2.5rem] p-7 shadow-[0_32px_64px_-16px_rgba(0,0,0,1)] relative overflow-hidden pointer-events-auto",
        "bg-gradient-to-br",
        colors[type]
      )}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 transition-colors opacity-40 hover:opacity-100"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center gap-5">
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center border-2 border-white/5 shadow-2xl shadow-black",
            "bg-slate-900"
          )}>
            <Icon className="w-7 h-7" />
          </div>
          <p className="text-base font-black italic uppercase tracking-tight leading-tight px-2">{message}</p>
        </div>

        {/* Progress Bar Container */}
        <div className="absolute bottom-0 left-0 w-full h-[4px] bg-white/5">
          <div 
            className={cn("h-full transition-all ease-linear shadow-[0_-2px_8px_rgba(255,255,255,0.1)]", barColors[type])}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Outer Animated Border Mask */}
        <div 
          className="absolute inset-0 border-[3px] rounded-[2.5rem] opacity-30 pointer-events-none"
          style={{
            borderColor: 'currentColor',
            clipPath: `inset(0 ${100 - progress}% 0 0)`
          }}
        />
      </div>
    </div>
  );
}
