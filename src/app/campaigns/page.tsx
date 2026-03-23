'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "../../lib/utils";
import { FolderKanban, Trash2, Plus, Calendar, Image as ImageIcon, Zap, Loader2 } from "lucide-react";
import CustomAlert from '@/components/ui/custom-alert';
import ConfirmationBox from '@/components/ui/confirmation-box';

interface Campaign {
  id: string;
  name: string;
  description: string;
  banner_count: number;
  event_count: number;
  created_at: string;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch('/api/campaigns').then(r => r.json()).then(d => { 
      setCampaigns(Array.isArray(d) ? d : []); 
      setLoading(false); 
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setAlert({ message: 'Campaign recorded successfully', type: 'success' });
      setShowModal(false);
      setForm({ name: '', description: '' });
      load();
    } catch (err) {
      setAlert({ message: 'Failed to create campaign', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    try {
      await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
      setAlert({ message: 'Campaign and associated data removed', type: 'success' });
      load();
    } catch (err) {
      setAlert({ message: 'Failed to delete campaign', type: 'error' });
    } finally {
      setSaving(false);
      setConfirmDelete(null);
    }
  };

  return (
    <div className="bg-[#020617] text-slate-50 flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-h-screen bg-[#020617] overflow-y-auto relative">
        {alert && (
          <CustomAlert 
            message={alert.message} 
            type={alert.type} 
            onClose={() => setAlert(null)} 
          />
        )}
        
        {confirmDelete && (
          <ConfirmationBox 
            title="Delete Campaign"
            description="Are you sure you want to permanently delete this campaign and all associated creative assets? This action cannot be undone."
            onConfirm={() => handleDelete(confirmDelete)}
            onCancel={() => setConfirmDelete(null)}
            confirmText="Delete"
            loading={saving}
          />
        )}

        <div className="px-10 py-8 flex items-center justify-between border-b border-white/5 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent italic">Campaigns</h1>
            <p className="text-sm text-slate-400 font-medium mt-1 uppercase tracking-widest text-[10px]">Registry • Grouping & Organization</p>
          </div>
          <button className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center gap-2" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4" />
            New Campaign
          </button>
        </div>

        <div className="px-10 py-10">
          {loading ? (
            <div className="flex h-[60vh] items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-3xl mb-6 shadow-xl border border-white/5">📁</div>
              <p className="text-lg font-bold text-slate-200 uppercase tracking-tight">System holds no records</p>
              <p className="text-sm text-slate-500 mt-2 max-w-xs leading-relaxed font-medium">Initialize a campaign to start grouping your creative assets and gathering performance data.</p>
              <button className="mt-8 h-11 px-8 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest border border-white/10 transition-all font-mono" onClick={() => setShowModal(true)}>
                Initialize Global Registry
              </button>
            </div>
          ) : (
            <Card className="border-slate-800/60 bg-slate-900/40 backdrop-blur-md shadow-2xl overflow-hidden rounded-2xl">
              <Table>
                <TableHeader className="bg-white/[0.01]">
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-[10px] uppercase font-black text-slate-500 py-6 px-8 tracking-[0.2em]">Campaign Name</TableHead>
                    <TableHead className="text-[10px] uppercase font-black text-slate-500 px-8 tracking-[0.2em]">Asset Count</TableHead>
                    <TableHead className="text-[10px] uppercase font-black text-slate-500 px-8 tracking-[0.2em]">Data Points</TableHead>
                    <TableHead className="text-[10px] uppercase font-black text-slate-500 px-8 tracking-[0.2em]">Launch Date</TableHead>
                    <TableHead className="text-[10px] uppercase font-black text-slate-500 text-right px-8 tracking-[0.2em]">Control</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map(c => (
                    <TableRow key={c.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                      <TableCell className="px-8 py-8">
                        <div className="font-extrabold text-slate-100 group-hover:text-blue-400 transition-colors uppercase tracking-tight text-base italic">{c.name}</div>
                        <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest line-clamp-1 max-w-md opacity-60">
                          {c.description || 'No system descriptor provided...'}
                        </div>
                      </TableCell>
                      <TableCell className="px-8 text-slate-400">
                        <div className="flex items-center gap-3">
                          <ImageIcon className="w-3.5 h-3.5 text-blue-500/40" />
                          <span className="font-bold tabular-nums text-slate-300">{c.banner_count} Assets</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-8 text-slate-400">
                        <div className="flex items-center gap-3">
                          <Zap className="w-3.5 h-3.5 text-emerald-500/40" />
                          <span className="font-bold tabular-nums text-slate-300">{Number(c.event_count).toLocaleString()} Events</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-8 text-slate-500 font-mono text-xs italic">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 opacity-30" />
                          {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                        </div>
                      </TableCell>
                      <TableCell className="px-8 text-right">
                        <button className="h-9 w-9 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-all flex items-center justify-center ml-auto" onClick={() => setConfirmDelete(c.id)}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      </main>

      {showModal && (
        <div className="modal-backdrop bg-slate-950/90 backdrop-blur-md fixed inset-0 flex items-center justify-center z-50 p-6" onClick={() => setShowModal(false)}>
          <Card className="modal w-full max-w-lg bg-slate-900 border-slate-800 shadow-2xl p-0 overflow-hidden rounded-3xl" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b border-white/5 bg-white/[0.01]">
              <h2 className="text-xl font-bold text-white flex items-center gap-3 italic tracking-tight uppercase">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center not-italic">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                Record New Campaign
              </h2>
            </div>
            <form onSubmit={handleCreate} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Identity Tag</label>
                <input className="w-full h-12 bg-slate-800 border-slate-700/50 rounded-2xl px-5 text-sm outline-none focus:border-blue-500 transition-all shadow-inner placeholder:text-slate-600 font-bold" placeholder="e.g. SUMMER PEAK 2025" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">System Descriptor</label>
                <textarea className="w-full bg-slate-800 border-slate-700/50 rounded-2xl px-5 py-4 text-sm outline-none focus:border-blue-500 transition-all min-h-[120px] resize-none shadow-inner placeholder:text-slate-700 font-medium leading-relaxed" placeholder="Detailed objective of this synchronization cycle..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="pt-6 flex items-center gap-4 border-t border-white/5">
                <button type="submit" className="flex-1 h-12 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-600/20 active:scale-95 disabled:opacity-50" disabled={saving}>
                  {saving ? 'Processing...' : 'Deploy Registry'}
                </button>
                <button type="button" className="h-12 px-8 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-black uppercase tracking-[0.2em] border border-white/10 transition-all font-mono" onClick={() => setShowModal(false)}>Abort</button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
