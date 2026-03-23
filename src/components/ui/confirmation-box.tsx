'use client';
import { X, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "./card";

interface ConfirmationBoxProps {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

export default function ConfirmationBox({
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = "Proceed",
  cancelText = "Cancel",
  loading = false
}: ConfirmationBoxProps) {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <Card className="w-full max-w-sm bg-slate-900 border-slate-800 rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
        <div className="p-8 border-b border-white/5 bg-rose-500/[0.02] flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-6 animate-bounce-slow">
            <AlertTriangle className="w-8 h-8 text-rose-500" />
          </div>
          <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">{title}</h3>
          <p className="text-slate-500 text-xs font-medium mt-2 leading-relaxed">{description}</p>
        </div>

        <div className="p-8 grid grid-cols-2 gap-4">
          <button
            onClick={onCancel}
            disabled={loading}
            className="h-12 rounded-xl border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="h-12 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : confirmText}
          </button>
        </div>

        <div className="py-4 bg-white/[0.01] border-t border-white/5 flex justify-center">
           <button onClick={onCancel} className="text-slate-600 hover:text-slate-400 transition-colors">
              <X className="w-4 h-4" />
           </button>
        </div>
      </Card>
      
      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
