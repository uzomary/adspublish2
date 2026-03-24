'use client';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, FolderKanban, Image as ImageIcon, 
  BarChart3, Settings, LogOut, ChevronLeft, ChevronRight, Menu, X,
  Sun, Moon
} from "lucide-react";
import { cn } from "../lib/utils";
import { ThemeToggle } from "./theme-toggle";


const navItems = [
  { href: '/', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Overview' },
  { href: '/campaigns', icon: <FolderKanban className="w-4 h-4" />, label: 'Campaigns' },
  { href: '/banners', icon: <ImageIcon className="w-4 h-4" />, label: 'Banners' },
  { href: '/analytics', icon: <BarChart3 className="w-4 h-4" />, label: 'Analytics' },
  { href: '/settings', icon: <Settings className="w-4 h-4" />, label: 'Settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [user, setUser] = useState<{ name: string, email: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved) setIsCollapsed(saved === 'true');

    // Fetch user profile
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setUser(data);
      })
      .catch(() => {});
  }, []);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem('sidebar-collapsed', String(next));
  };

  if (!mounted) return null;

  const initials = user?.name 
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : 'AD';

  return (
    <>
      {/* Mobile Menu Trigger */}
      <button 
        className="lg:hidden fixed top-6 right-6 z-50 p-3 rounded-xl bg-slate-900 border border-white/10 text-white shadow-2xl"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-500 z-40 group/sidebar",
          isCollapsed ? "w-20" : "w-64",
          "lg:translate-x-0 lg:sticky",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "max-w-[100vw]"
        )}
      >
        <div className={cn("p-8 flex items-center gap-3 relative", isCollapsed ? "justify-center p-6" : "")}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
            <span className="text-white font-black text-xs">AT</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden transition-all duration-300">
              <h2 className="text-sm font-bold tracking-tight text-white leading-none whitespace-nowrap">AdTrack</h2>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest whitespace-nowrap">Enterprise</span>
            </div>
          )}
          
          {/* Collapse Toggle - Desktop Only */}
          <button 
            onClick={toggleCollapse}
            className="hidden lg:flex absolute -right-3 top-12 w-6 h-6 rounded-full bg-slate-900 border border-white/10 items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all shadow-xl"
          >
            {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-4 overflow-y-auto no-scrollbar">
          <div className="space-y-1">
            <p className={cn(
              "px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 transition-opacity duration-300",
              isCollapsed ? "opacity-0 h-0 overflow-hidden mb-0" : "opacity-100"
            )}>
              Main Navigation
            </p>
            {navItems.map(({ href, icon, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                    isActive 
                      ? "bg-blue-500/10 text-blue-400" 
                      : "text-slate-400 hover:text-white hover:bg-white/5",
                    isCollapsed ? "justify-center px-0 h-10 w-10 mx-auto" : ""
                  )}
                >
                  {isActive && !isCollapsed && (
                    <div className="absolute left-0 w-1 h-5 bg-blue-500 rounded-r-full shadow-[0_0_12px_rgba(59,130,246,0.8)]" />
                  )}
                  <span className={cn(
                    "transition-colors duration-200 flex-shrink-0",
                    isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-100"
                  )}>
                    {icon}
                  </span>
                  {!isCollapsed && (
                    <span className="whitespace-nowrap transition-all duration-300">{label}</span>
                  )}
                  {isCollapsed && (
                    <div className="absolute left-14 bg-slate-900 border border-white/10 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                      {label}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className={cn("p-4 mt-auto transition-all duration-300", isCollapsed ? "p-3" : "p-4")}>
          <div className={cn(
            "rounded-2xl bg-sidebar-accent/50 border border-sidebar-border space-y-3 transition-all duration-300",
            isCollapsed ? "p-0 bg-transparent border-0" : "p-4"
          )}>
            <div className={cn("flex items-center gap-3", isCollapsed ? "justify-center" : "")}>
              <div className="w-8 h-8 rounded-full bg-background border border-sidebar-border flex-shrink-0 flex items-center justify-center">
                <span className="text-[10px] font-black text-blue-500">{initials}</span>
              </div>
              {!isCollapsed && (
                <div className="flex-1 overflow-hidden transition-all duration-300">
                  <p className="text-[11px] font-bold text-foreground leading-none truncate capitalize">
                    {user?.name || "Member Node"}
                  </p>
                  <p className="text-[9px] text-muted-foreground font-medium tracking-tight truncate lowercase">
                    {user?.email || "initializing..."}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <ThemeToggle />
              <button 
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' });
                  router.refresh();
                  router.push('/login');
                }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all group relative",
                  isCollapsed ? "hidden" : ""
                )}>
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </button>
            </div>
            
            {isCollapsed && (
              <button 
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' });
                  router.refresh();
                  router.push('/login');
                }}
                className="w-10 h-10 mx-auto flex items-center justify-center rounded-lg bg-sidebar-accent text-muted-foreground hover:text-foreground transition-all group relative">
                <LogOut className="w-3 h-3" />
                <div className="absolute left-14 bg-popover border border-border text-popover-foreground text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  Sign Out
                </div>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
