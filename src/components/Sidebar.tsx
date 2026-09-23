"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { 
  Home, BookOpen, Code2, Bot, BarChart3, User, LogOut, 
  Menu, X, Shield, Terminal
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const NAV_ITEMS = [
  { label: "HOME", href: "/dashboard", icon: Home },
  { label: "LEARN", href: "/learn", icon: BookOpen },
  { label: "PRACTICE", href: "/practice", icon: Code2 },
  { label: "AI TUTOR", href: "/ai-tutor", icon: Bot },
  { label: "PROGRESS", href: "/progress", icon: BarChart3 },
  { label: "PROFILE", href: "/profile", icon: User },
];

const ADMIN_ITEM = { label: "ADMIN", href: "/admin", icon: Shield };

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored) setCollapsed(stored === "true");
  }, []);

  const toggle = () => setCollapsed((prev) => {
    localStorage.setItem("sidebar-collapsed", String(!prev));
    return !prev;
  });

  const userName = session?.user?.name || "Ampearl";
  const userRole = session?.user?.role || "SUPER_ADMIN";

  return (
    <aside 
      className={`shrink-0 border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e17] flex flex-col h-screen sticky top-0 transition-all duration-300 z-30 select-none ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Top Header Logo */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
        {!collapsed ? (
          <Link href="/dashboard" className="flex items-center gap-3 group">
            {/* Hexagon icon */}
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-emerald-500/10 border border-indigo-200 dark:border-emerald-500/40 flex items-center justify-center text-indigo-600 dark:text-emerald-400 group-hover:scale-105 transition shadow-sm">
              <Terminal size={18} />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-wider text-xs text-slate-900 dark:text-white uppercase flex items-center gap-1.5">
                CS PLATFORM
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-indigo-100 dark:bg-emerald-950 text-indigo-700 dark:text-emerald-400 border border-indigo-200 dark:border-emerald-800">
                  v2.0
                </span>
              </span>
            </div>
          </Link>
        ) : (
          <Link href="/dashboard" className="mx-auto text-indigo-600 dark:text-emerald-400">
            <Terminal size={20} />
          </Link>
        )}
        <button 
          onClick={toggle} 
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
        >
          {collapsed ? <Menu size={16} /> : <X size={16} />}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {[
          ...NAV_ITEMS,
          ...(session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "COLLEGE_ADMIN" || !session ? [ADMIN_ITEM] : [])
        ].map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wider transition ${
                isActive
                  ? "bg-indigo-50 dark:bg-emerald-500/10 text-indigo-600 dark:text-emerald-400 border border-indigo-200 dark:border-emerald-500/30 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/40 border border-transparent"
              } ${collapsed ? "justify-center px-2" : ""}`}
            >
              <Icon size={17} className={isActive ? "text-indigo-600 dark:text-emerald-400" : "text-slate-400"} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Robot Mascot CRT Screen Box */}
      {!collapsed && (
        <div className="px-3 pb-3">
          <div className="rounded-xl border border-slate-200 dark:border-emerald-900/60 bg-slate-100 dark:bg-emerald-950/40 p-2.5 shadow-sm">
            <div className="flex items-center justify-between text-[9px] font-mono text-emerald-600 dark:text-emerald-400/80 mb-1">
              <span>STATUS: ONLINE</span>
              <span className="animate-pulse">● ACTIVE</span>
            </div>
            <div className="flex items-center gap-3 py-1">
              <div className="w-10 h-10 rounded-lg bg-white dark:bg-emerald-950/80 border border-slate-200 dark:border-emerald-500/40 flex items-center justify-center font-mono text-emerald-600 dark:text-emerald-300 text-xs font-bold shadow-sm">
                [•_•]
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-mono text-slate-800 dark:text-emerald-300 font-bold">ROBOT BUDDY</span>
                <span className="text-[9px] font-mono text-slate-500 dark:text-emerald-500/80">"Ready for mission!"</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Theme Toggle & User Account Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#080d16]">
        <div className={`flex items-center ${collapsed ? "flex-col gap-2" : "justify-between"} gap-2`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 border border-indigo-400/50 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-md">
              {userName.slice(0, 1).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex flex-col">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{userName}</span>
                <span className="text-[9px] font-mono uppercase tracking-wider text-indigo-600 dark:text-emerald-400">
                  {userRole}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Log out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition shrink-0"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}