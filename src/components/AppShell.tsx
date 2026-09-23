"use client";

import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#070913] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">{children}</div>
    </div>
  );
}