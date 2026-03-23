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
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { 
  Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid 
} from "recharts";
import { 
  Eye, MousePointer2, Globe, Zap, Target, ArrowUpRight, TrendingUp 
} from "lucide-react";

interface Analytics {
  summary: {
    total_impressions: number;
    total_clicks: number;
    total_visits: number;
    total_actions: number;
    ctr: string;
  };
  daily: Array<{ date: string; impressions: number; clicks: number; visits: number; actions: number }>;
  topBanners: Array<{ id: string; name: string; impressions: number; clicks: number }>;
}

export default function OverviewPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics?days=30')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const s = data?.summary;
  const daily = data?.daily ?? [];

  const stats = [
    { label: 'Total Impressions', value: Number(s?.total_impressions ?? 0).toLocaleString(), icon: <Eye className="w-4 h-4" />, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: 'Total Clicks', value: Number(s?.total_clicks ?? 0).toLocaleString(), icon: <MousePointer2 className="w-4 h-4" />, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: 'Net Visits', value: Number(s?.total_visits ?? 0).toLocaleString(), icon: <Globe className="w-4 h-4" />, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: 'Conversion Rate', value: `${s?.ctr ?? '0.00'}%`, icon: <Target className="w-4 h-4" />, color: "text-rose-500", bg: "bg-rose-500/10" },
  ];

  const chartConfig = {
    impressions: { label: "Impressions", color: "#3b82f6" },
    clicks: { label: "Clicks", color: "#10b981" },
  };

  return (
    <div className="bg-[#020617] text-slate-50 flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-h-screen bg-[#020617] overflow-y-auto">
        <div className="px-10 py-8 flex items-center justify-between border-b border-white/5 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Overview</h1>
            <p className="text-sm text-slate-400 font-medium mt-1 uppercase tracking-widest text-[10px]">Global Dashboard • 30 Day Window</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">System Online</span>
            </div>
          </div>
        </div>

        <div className="px-10 py-10 space-y-8">
          {loading ? (
            <div className="flex h-[60vh] items-center justify-center">
              <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((st, i) => (
                  <Card key={i} className="bg-slate-900/40 border-slate-800/60 backdrop-blur-md hover:border-slate-700/60 transition-all group overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      {st.icon}
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                      <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">
                        {st.label}
                      </CardTitle>
                      <div className={`p-2 rounded-xl ${st.bg} ${st.color}`}>
                        {st.icon}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-black tabular-nums tracking-tighter text-slate-100 italic">{st.value}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Main Chart */}
              <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-md shadow-2xl p-8 rounded-3xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <TrendingUp className="w-48 h-48" />
                </div>
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div>
                    <h3 className="text-xl font-black text-white italic truncate tracking-tight uppercase">Network Activity Flow</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Cross-Campaign Interaction Matrix</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Impressions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Engagement</span>
                    </div>
                  </div>
                </div>

                <div className="h-[350px] w-full mt-4">
                  <ChartContainer config={chartConfig} className="h-full w-full">
                    <AreaChart data={daily}>
                      <defs>
                        <linearGradient id="fillImpressions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="fillClicks" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="#ffffff05" strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#475569" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                      />
                      <YAxis hide />
                      <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={{ stroke: '#ffffff10', strokeWidth: 1 }} />
                      <Area type="monotone" dataKey="impressions" stroke="#3b82f6" strokeWidth={4} fill="url(#fillImpressions)" stackId="1" animationDuration={1500} />
                      <Area type="monotone" dataKey="clicks" stroke="#10b981" strokeWidth={4} fill="url(#fillClicks)" stackId="1" animationDuration={2000} />
                    </AreaChart>
                  </ChartContainer>
                </div>

              </Card>

              {/* Top Banners Table */}
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden">
                  <div className="p-8 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black text-white italic tracking-tight uppercase">Elite Creative Matrix</h3>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">High Performance Assets Layer</p>
                    </div>
                  </div>
                  <Table>
                    <TableHeader className="bg-white/[0.01]">
                      <TableRow className="border-white/5 hover:bg-transparent">
                        <TableHead className="text-[10px] uppercase font-black text-slate-400 py-6 px-8 tracking-[0.2em]">Creative Asset</TableHead>
                        <TableHead className="text-[10px] uppercase font-black text-slate-400 px-8 text-right tracking-[0.2em]">Scale</TableHead>
                        <TableHead className="text-[10px] uppercase font-black text-slate-400 px-8 text-right tracking-[0.2em]">Reach</TableHead>
                        <TableHead className="text-[10px] uppercase font-black text-slate-400 px-8 tracking-[0.2em]">Optimization</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(data?.topBanners ?? []).map(b => {
                        const imp = Number(b.impressions);
                        const clk = Number(b.clicks);
                        const ctr = imp > 0 ? ((clk / imp) * 100).toFixed(1) : '0.0';
                        return (
                          <TableRow key={b.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                            <TableCell className="px-8 py-8">
                              <div className="font-extrabold text-slate-100 group-hover:text-blue-400 transition-colors uppercase tracking-tight text-sm flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-blue-500/20 group-hover:bg-blue-500 transition-colors shadow-lg" />
                                {b.name}
                              </div>
                            </TableCell>
                            <TableCell className="px-8 text-right tabular-nums font-black text-slate-200 text-base">{imp.toLocaleString()}</TableCell>
                            <TableCell className="px-8 text-right tabular-nums font-black text-slate-200 text-base">{clk.toLocaleString()}</TableCell>
                            <TableCell className="px-8">
                              <Badge className="bg-blue-600/10 text-blue-400 border-none px-3 py-1 font-black text-[10px] tracking-widest">
                                {ctr}% CTR
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            </>
          )}

          {!loading && daily.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-3xl mb-6 shadow-xl border border-white/5">📊</div>
              <p className="text-lg font-bold text-slate-200 uppercase tracking-tight italic">Insufficient Ecosystem Data</p>
              <p className="text-sm text-slate-500 mt-2 max-w-xs leading-relaxed font-medium capitalize">Activate your banners and synchronization cycles to populate the global matrix.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
