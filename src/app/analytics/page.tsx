'use client';
import { useEffect, useState, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  BarChart, Bar, ResponsiveContainer 
} from 'recharts';
import { cn } from "../../lib/utils";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, MousePointer2, Globe, Zap, Target, User, Home } from "lucide-react";

interface Analytics {
  summary: { 
    total_impressions: number; 
    unique_impressions: number;
    total_clicks: number; 
    total_visits: number; 
    unique_visits: number;
    total_actions: number; 
    ctr: string; 
  };
  daily: Array<{ 
    date: string; 
    impressions: number; 
    unique_impressions: number;
    clicks: number; 
    visits: number; 
    actions: number 
  }>;
  topBanners: Array<{ 
    id: string; 
    name: string; 
    impressions: number; 
    unique_impressions: number;
    clicks: number 
  }>;
}
interface Campaign { id: string; name: string; }

const chartConfig = {
  impressions: {
    label: "Impressions",
    color: "var(--chart-1)",
  },
  uniques: {
    label: "Unique Reach",
    color: "var(--chart-2)",
  },
  clicks: {
    label: "Clicks",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignId, setCampaignId] = useState('all');
  const [days, setDays] = useState('30');
  const [loading, setLoading] = useState(true);

  const load = (cid: string, d: string) => {
    setLoading(true);
    const params = new URLSearchParams({ days: d });
    if (cid && cid !== 'all') params.set('campaignId', cid);
    Promise.all([
      fetch(`/api/analytics?${params}`).then(r => r.json()),
      fetch('/api/campaigns').then(r => r.json()),
    ]).then(([a, c]) => { setData(a); setCampaigns(c); setLoading(false); });
  };

  useEffect(() => { load('all', '30'); }, []);

  const handleFilterCampaign = (val: string | null) => {
    if (val) {
      setCampaignId(val); load(val, days);
    }
  };

  const handleFilterDays = (val: string | null) => {
    if (val) {
      setDays(val); load(campaignId, val);
    }
  };

  const s = data?.summary;
  const rawDaily = data?.daily ?? [];

  const daily = useMemo(() => {
    const daysToCover = parseInt(days);
    const result = [];
    const now = new Date();
    const dataMap = new Map();
    rawDaily.forEach(d => {
      const dateKey = new Date(d.date).toISOString().split('T')[0];
      dataMap.set(dateKey, d);
    });

    for (let i = daysToCover - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const existing = dataMap.get(dateKey);
      result.push({
        date: dateKey,
        formattedDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        impressions: Number(existing?.impressions || 0),
        uniques: Number(existing?.unique_impressions || 0),
        clicks: Number(existing?.clicks || 0),
        visits: Number(existing?.visits || 0),
        actions: Number(existing?.actions || 0),
      });
    }
    return result;
  }, [rawDaily, days]);

  return (
    <div className="bg-background text-foreground flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-h-screen bg-background overflow-y-auto">
        <div className="px-10 py-8 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Analytics</h1>
            <p className="text-sm text-slate-400 font-medium mt-1">Real-time performance metrics & audience insights</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Campaign</span>
              <Select value={campaignId} onValueChange={handleFilterCampaign}>
                <SelectTrigger className="w-[200px] h-10 bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
                  <SelectValue placeholder="Campaign" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                  <SelectItem value="all">Global Overview</SelectItem>
                  {campaigns.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Range</span>
              <Select value={days} onValueChange={handleFilterDays}>
                <SelectTrigger className="w-[140px] h-10 bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                  <SelectItem value="7">Past 7 Days</SelectItem>
                  <SelectItem value="30">Past 30 Days</SelectItem>
                  <SelectItem value="90">Past 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="px-10 py-10 space-y-10">
          {loading ? (
            <div className="flex h-[60vh] items-center justify-center"><div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" /></div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-5">
                {[
                  { label: 'Impressions', value: Number(s?.total_impressions ?? 0).toLocaleString(), icon: <Eye className="w-4 h-4" />, color: "text-blue-400", bg: "bg-blue-400/10" },
                  { label: 'Unique Reach', value: Number(s?.unique_impressions ?? 0).toLocaleString(), icon: <User className="w-4 h-4" />, color: "text-purple-400", bg: "bg-purple-400/10" },
                  { label: 'Clicks', value: Number(s?.total_clicks ?? 0).toLocaleString(), icon: <MousePointer2 className="w-4 h-4" />, color: "text-emerald-400", bg: "bg-emerald-400/10" },
                  { label: 'Visits', value: Number(s?.total_visits ?? 0).toLocaleString(), icon: <Globe className="w-4 h-4" />, color: "text-indigo-400", bg: "bg-indigo-400/10" },
                  { label: 'Unique Vis', value: Number(s?.unique_visits ?? 0).toLocaleString(), icon: <Home className="w-4 h-4" />, color: "text-indigo-300", bg: "bg-indigo-300/10" },
                  { label: 'Actions', value: Number(s?.total_actions ?? 0).toLocaleString(), icon: <Zap className="w-4 h-4" />, color: "text-amber-400", bg: "bg-amber-400/10" },
                  { label: 'CTR', value: `${s?.ctr ?? '0.00'}%`, icon: <Target className="w-4 h-4" />, color: "text-rose-400", bg: "bg-rose-400/10" },
                ].map(st => (
                  <Card key={st.label} className="border-slate-800/60 bg-slate-900/40 backdrop-blur-md hover:border-slate-700/80 transition-all duration-300 group shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                      <CardTitle className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 group-hover:text-slate-400 transition-colors">{st.label}</CardTitle>
                      <div className={cn("rounded-lg p-2 transition-transform duration-300 group-hover:scale-110", st.bg, st.color)}>{st.icon}</div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold tabular-nums tracking-tight">{st.value}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid gap-8">
                <Card className="border-slate-800/60 bg-slate-900/40 backdrop-blur-md shadow-xl overflow-hidden">
                  <CardHeader className="border-b border-white/5 pb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-bold tracking-tight">Market Reach Performance</CardTitle>
                        <CardDescription className="text-slate-500 font-medium">Daily breakdown of audience exposure and engagement</CardDescription>
                      </div>
                      <div className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-widest">
                        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" /> <span className="text-slate-300">Impressions</span></div>
                        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" /> <span className="text-slate-300">Unique Reach</span></div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="h-[400px] pt-8 px-2">
                    <ChartContainer config={chartConfig} className="h-full w-full">
                      <AreaChart data={daily} margin={{ left: 12, right: 32, top: 12, bottom: 12 }}>
                        <defs>
                          <linearGradient id="fillImpr" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="fillUniq" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="rgba(255,255,255,0.03)" />
                        <XAxis dataKey="formattedDate" axisLine={false} tickLine={false} tickMargin={15} className="text-[10px] font-bold fill-slate-500" />
                        <YAxis axisLine={false} tickLine={false} tickMargin={15} className="text-[10px] font-bold fill-slate-500" />
                        <ChartTooltip content={<ChartTooltipContent indicator="line" className="bg-slate-900/95 border-slate-800 shadow-2xl" />} />
                        <Area type="monotone" dataKey="impressions" fill="url(#fillImpr)" stroke="#3b82f6" strokeWidth={3} animationDuration={1500} />
                        <Area type="monotone" dataKey="uniques" fill="url(#fillUniq)" stroke="#a855f7" strokeWidth={3} animationDuration={1500} />
                      </AreaChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="border-slate-800/60 bg-slate-900/40 backdrop-blur-md shadow-xl overflow-hidden">
                    <CardHeader className="border-b border-white/5 pb-6">
                      <CardTitle className="text-lg font-bold tracking-tight">Active Conversions</CardTitle>
                      <CardDescription className="text-slate-500 font-medium">Daily click-through volume across tracked banners</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px] pt-8 px-2">
                      <ChartContainer config={chartConfig} className="h-full w-full">
                        <BarChart data={daily} margin={{ left: 12, right: 20, top: 12, bottom: 12 }}>
                          <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="rgba(255,255,255,0.03)" />
                          <XAxis dataKey="formattedDate" axisLine={false} tickLine={false} tickMargin={15} className="text-[10px] font-bold fill-slate-500" />
                          <YAxis axisLine={false} tickLine={false} tickMargin={15} className="text-[10px] font-bold fill-slate-500" />
                          <ChartTooltip content={<ChartTooltipContent hideIndicator className="bg-slate-900/95 border-slate-800 shadow-2xl" />} />
                          <Bar dataKey="clicks" fill="#10b981" radius={[4, 4, 0, 0]} barSize={36} animationDuration={1500} className="drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-800/60 bg-slate-900/40 backdrop-blur-md shadow-xl overflow-hidden">
                    <CardHeader className="border-b border-white/5 pb-6">
                      <CardTitle className="text-lg font-bold tracking-tight">Top Performance Rank</CardTitle>
                      <CardDescription className="text-slate-500 font-medium">Banners ranked by execution efficiency (CTR)</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-white/5 hover:bg-transparent uppercase tracking-wider">
                            <TableHead className="text-[10px] font-extrabold text-slate-500 py-4">Identification</TableHead>
                            <TableHead className="text-[10px] font-extrabold text-slate-500 text-right">Exposure</TableHead>
                            <TableHead className="text-[10px] font-extrabold text-slate-500 text-right">Interactions</TableHead>
                            <TableHead className="text-[10px] font-extrabold text-slate-500 text-center">Score</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data?.topBanners.map(b => {
                            const ctr = Number(b.impressions) > 0 ? ((Number(b.clicks) / Number(b.impressions)) * 100).toFixed(1) : '0.0';
                            return (
                              <TableRow key={b.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                                <TableCell className="font-bold py-5 text-slate-300 group-hover:text-white transition-colors">{b.name}</TableCell>
                                <TableCell className="text-right tabular-nums text-slate-400">{Number(b.impressions).toLocaleString()}</TableCell>
                                <TableCell className="text-right tabular-nums text-slate-400">{Number(b.clicks).toLocaleString()}</TableCell>
                                <TableCell className="text-center">
                                  <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/5 text-emerald-400 font-mono text-[10px] tracking-tighter">
                                    {ctr}% CTR
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-slate-800/60 bg-slate-900/40 backdrop-blur-md shadow-xl overflow-hidden">
                  <CardHeader className="border-b border-white/5 pb-6">
                    <CardTitle className="text-lg font-bold tracking-tight">Performance Audit Log</CardTitle>
                    <CardDescription className="text-slate-500 font-medium">Complete historical dataset for the selected timeframe</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="rounded-xl border border-white/5 overflow-hidden shadow-inner">
                      <Table>
                        <TableHeader className="bg-white/[0.01]">
                          <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 py-4 px-6">Timestamp</TableHead>
                            <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 text-right px-6">Total Impr</TableHead>
                            <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 text-right px-6">Unique Reach</TableHead>
                            <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 text-right px-6">Interactions</TableHead>
                            <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 text-right px-6">Visits</TableHead>
                            <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 text-center px-6">CTR</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[...daily].reverse()
                            .filter(d => Number(d.impressions) > 0 || Number(d.clicks) > 0 || Number(d.visits) > 0)
                            .map(d => {
                            const imp = Number(d.impressions), clk = Number(d.clicks);
                            return (
                              <TableRow key={d.date} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                                <TableCell className="font-bold text-slate-400 px-6 py-4">{d.formattedDate}</TableCell>
                                <TableCell className="text-right tabular-nums text-slate-300 px-6">{imp.toLocaleString()}</TableCell>
                                <TableCell className="text-right tabular-nums text-slate-300 px-6">{Number(d.uniques || 0).toLocaleString()}</TableCell>
                                <TableCell className="text-right tabular-nums text-emerald-400 px-6">{clk.toLocaleString()}</TableCell>
                                <TableCell className="text-right tabular-nums text-slate-300 px-6">{Number(d.visits).toLocaleString()}</TableCell>
                                <TableCell className="text-center px-6">
                                  <Badge variant="secondary" className="font-mono text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                                    {imp > 0 ? ((clk / imp) * 100).toFixed(1) : '0.0'}%
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}


