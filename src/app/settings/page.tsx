'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  UserPlus, Trash2, Key, Shield, Mail, User, 
  Loader2, CheckCircle2, AlertCircle, X, Plus, Eye, EyeOff, Lock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "../../lib/utils";
import CustomAlert from '@/components/ui/custom-alert';
import ConfirmationBox from '@/components/ui/confirmation-box';

export default function SettingsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });
  const [passwordChange, setPasswordChange] = useState({ newPassword: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchAdmins = async () => {
    try {
      const res = await fetch('/api/admins');
      if (res.ok) setAdmins(await res.json());
      else setAlert({ message: 'Failed to load admins', type: 'error' });
    } catch (e) {
      setAlert({ message: 'Connection error', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setAlert(null);
    try {
      const res = await fetch('/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdmin),
      });
      if (res.ok) {
        setAlert({ message: 'Admin added successfully', type: 'success' });
        setShowCreate(false);
        setNewAdmin({ name: '', email: '', password: '' });
        fetchAdmins();
      } else {
        const data = await res.json();
        setAlert({ message: data.error || 'Failed to add admin', type: 'error' });
      }
    } catch (err) {
      setAlert({ message: 'Connection error', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admins?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAlert({ message: 'Admin removed', type: 'success' });
        fetchAdmins();
      } else {
        const data = await res.json();
        setAlert({ message: data.error || 'Failed to delete', type: 'error' });
      }
    } catch (err) {
      setAlert({ message: 'Connection error', type: 'error' });
    } finally {
      setSubmitting(false);
      setConfirmDelete(null);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordChange.newPassword !== passwordChange.confirm) {
      setAlert({ message: 'Passwords do not match', type: 'error' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admins', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordChange.newPassword }),
      });
      if (res.ok) {
        setAlert({ message: 'Password updated successfully', type: 'success' });
        setPasswordChange({ newPassword: '', confirm: '' });
      } else {
        const data = await res.json();
        setAlert({ message: data.error || 'Failed to update password', type: 'error' });
      }
    } catch (err) {
      setAlert({ message: 'Connection error', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-background text-foreground flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-h-screen bg-background relative overflow-hidden flex flex-col">
        {/* Alerts & Confirmations */}
        {alert && (
          <CustomAlert 
            message={alert.message} 
            type={alert.type} 
            onClose={() => setAlert(null)} 
          />
        )}
        
        {confirmDelete && (
          <ConfirmationBox 
            title="Delete Admin"
            description="Are you sure you want to remove this administrator? This action cannot be undone."
            onConfirm={() => handleDeleteAdmin(confirmDelete)}
            onCancel={() => setConfirmDelete(null)}
            confirmText="Remove"
            loading={submitting}
          />
        )}

        {/* Ambient background rays */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -mr-64 -mt-64" />
        
        <div className="p-8 lg:p-12 max-w-6xl w-full mx-auto space-y-12 relative z-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-500 font-black uppercase tracking-widest text-[10px]">
                <Shield className="w-4 h-4" />
                Security & Access
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">Admin Dashboard</h1>
              <p className="text-slate-500 text-sm font-medium">Manage your elite team and portal security</p>
            </div>
            
            <button 
              onClick={() => setShowCreate(true)}
              className="px-6 h-12 bg-white text-slate-950 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all flex items-center gap-2 shadow-xl shadow-white/5 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add Member
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Team List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Active Administrators</h2>
                <div className="h-px flex-1 bg-white/5 mx-4" />
                <span className="text-[10px] font-black text-blue-500">{admins.length} Total</span>
              </div>
              
              <Card className="border-slate-800/60 bg-slate-900/40 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-white/[0.02]">
                      <TableRow className="border-white/5 hover:bg-transparent">
                        <TableHead className="text-slate-500 font-black uppercase tracking-widest text-[9px] h-12">Identify</TableHead>
                        <TableHead className="text-slate-500 font-black uppercase tracking-widest text-[9px] h-12">Email Access</TableHead>
                        <TableHead className="text-right text-slate-500 font-black uppercase tracking-widest text-[9px] h-12">Control</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {admins.map((admin) => (
                        <TableRow key={admin.id} className="border-white/5 hover:bg-white/[0.01] group transition-colors">
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-black text-blue-500 text-xs text-center">
                                {admin.name.charAt(0)}
                              </div>
                              <span className="font-bold text-slate-200 text-sm">{admin.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-400 font-medium text-sm">{admin.email}</TableCell>
                          <TableCell className="text-right">
                            <button 
                              onClick={() => setConfirmDelete(admin.id)}
                              className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                              title="Remove Admin"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {loading && (
                        <TableRow>
                          <TableCell colSpan={3} className="h-32 text-center">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-700" />
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>

            {/* Security Config */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Key className="w-5 h-5 text-purple-500" />
                Security Access
              </h2>
              <Card className="border-slate-800/60 bg-slate-900/40 backdrop-blur-md rounded-2xl p-8 relative">
                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Update Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={passwordChange.newPassword}
                        onChange={(e) => setPasswordChange({ ...passwordChange, newPassword: e.target.value })}
                        className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-3 pl-4 pr-10 text-sm text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 outline-none transition-all"
                        placeholder="New password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={passwordChange.confirm}
                      onChange={(e) => setPasswordChange({ ...passwordChange, confirm: e.target.value })}
                      className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-3 pl-4 pr-10 text-sm text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 outline-none transition-all"
                      placeholder="Confirm new password"
                    />
                  </div>
                  <button 
                    disabled={submitting}
                    className="w-full h-11 bg-white text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Update Security Key"}
                  </button>
                </form>
              </Card>

              <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 border-dashed">
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed text-center">
                   Account changes take effect immediately.<br/>Other logged-in sessions will remain valid for 24 hours.
                 </p>
              </div>
            </div>
          </div>
        </div>

        {/* Create Admin Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-6" onClick={() => setShowCreate(false)}>
            <Card className="w-full max-w-md bg-slate-900 border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="p-8 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Add Team Member</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Access & Identity Configuration</p>
                </div>
                <button onClick={() => setShowCreate(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-slate-400 Transition-all"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-10">
                <form onSubmit={handleAddAdmin} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Member Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500" />
                      <input
                        type="text" required
                        value={newAdmin.name}
                        onChange={e => setNewAdmin({...newAdmin, name: e.target.value})}
                        className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:ring-2 focus:ring-blue-500/20 outline-none"
                        placeholder="e.g. John Doe"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500" />
                      <input
                        type="email" required
                        value={newAdmin.email}
                        onChange={e => setNewAdmin({...newAdmin, email: e.target.value})}
                        className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:ring-2 focus:ring-blue-500/20 outline-none"
                        placeholder="admin@example.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Initial Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500" />
                      <input
                        type={showPassword ? "text" : "password"} required
                        value={newAdmin.password}
                        onChange={e => setNewAdmin({...newAdmin, password: e.target.value})}
                        className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-3 pl-12 pr-12 text-sm text-white focus:ring-2 focus:ring-blue-500/20 outline-none"
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
                  <button 
                    disabled={submitting}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-blue-500/20 mt-4 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Finalize Membership</>}
                  </button>
                </form>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
