"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Home, BookOpen, Dumbbell, Bot, LineChart, User, LogOut, Menu, X, Shield } from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Learn", href: "/learn", icon: BookOpen },
  { label: "Practice", href: "/practice", icon: Dumbbell },
  { label: "AI Tutor", href: "/ai-tutor", icon: Bot },
  { label: "Progress", href: "/progress", icon: LineChart },
  { label: "Profile", href: "/profile", icon: User },
];

const ADMIN_ITEM = { label: "Admin", href: "/admin", icon: Shield };
export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored) setCollapsed(stored === "true");
  }, []);

  const toggle = () => setCollapsed((prev) => { localStorage.setItem("sidebar-collapsed", String(!prev)); return !prev; });

  return (
    <aside className={`shrink-0 border-r border-slate-200 bg-white flex flex-col h-screen sticky top-0 transition-all duration-200 ${collapsed ? "w-16" : "w-60"}`}>
      <div className="px-4 py-5 border-b border-slate-100 flex items-center justify-between">
        {!collapsed && <span className="font-semibold text-slate-900 text-sm">CS Platform</span>}
        <button onClick={toggle} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">{collapsed ? <Menu size={18} /> : <X size={18} />}</button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {[...NAV_ITEMS, ...(session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "COLLEGE_ADMIN" ? [ADMIN_ITEM] : [])].map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} title={collapsed ? item.label : undefined} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"} ${collapsed ? "justify-center" : ""}`}>
              <Icon size={17} />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-slate-100">
        {!collapsed && (
          <>
            <p className="text-sm font-medium text-slate-800 truncate">{session?.user?.name ?? "User"}</p>
            <p className="text-xs text-slate-400 truncate mb-3">{session?.user?.email}</p>
          </>
        )}
        <button onClick={() => signOut({ callbackUrl: "/login" })} title="Log out" className={`flex items-center gap-2 text-xs text-slate-500 hover:text-rose-600 transition ${collapsed ? "justify-center w-full" : ""}`}>
          <LogOut size={14} />
          {!collapsed && "Log out"}
        </button>
      </div>
    </aside>
  );
}