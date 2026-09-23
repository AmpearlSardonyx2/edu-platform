"use client";

import AppShell from "@/components/AppShell";
import { 
  Award, Flame, Trophy, CheckCircle2, TrendingUp, 
  BarChart3, Zap, Star, Shield, ArrowRight 
} from "lucide-react";
import Link from "next/link";

interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
  unlocked: boolean;
  date: string;
  category: "starter" | "algorithms" | "streak" | "mastery";
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-steps",
    title: "First Steps",
    desc: "Complete your first lesson.",
    icon: "🚀",
    unlocked: true,
    date: "Unlocked Sep 14",
    category: "starter",
  },
  {
    id: "bubble-beginner",
    title: "Bubble Beginner",
    desc: "Complete the Bubble Sort lesson.",
    icon: "🫧",
    unlocked: true,
    date: "Unlocked Sep 18",
    category: "algorithms",
  },
  {
    id: "code-writer",
    title: "Code Writer",
    desc: "Write your first code solution.",
    icon: "💻",
    unlocked: true,
    date: "Unlocked Sep 19",
    category: "algorithms",
  },
  {
    id: "streak-master",
    title: "Streak Master",
    desc: "Maintain a 7 day streak.",
    icon: "🔥",
    unlocked: true,
    date: "Unlocked Sep 21",
    category: "streak",
  },
  {
    id: "problem-solver",
    title: "Problem Solver",
    desc: "Solve 50 problems across subjects.",
    icon: "🧩",
    unlocked: true,
    date: "Unlocked Yesterday",
    category: "mastery",
  },
  {
    id: "chemistry-alchemist",
    title: "Apprentice Alchemist",
    desc: "Complete Acid-Base Titration simulation.",
    icon: "🧪",
    unlocked: true,
    date: "Unlocked Today",
    category: "mastery",
  },
  {
    id: "orbital-commander",
    title: "Orbital Gunner",
    desc: "Score a direct hit in the Projectile Cannon lab.",
    icon: "🎯",
    unlocked: true,
    date: "Unlocked Today",
    category: "mastery",
  },
];

export default function ProgressPage() {
  return (
    <AppShell>
      <main className="max-w-6xl mx-auto py-8 px-6 space-y-8 select-none">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-[11px] uppercase font-mono tracking-widest text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-800">
              Telemetry &amp; Records
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-1">Progress &amp; Achievements</h1>
            <p className="text-xs text-slate-400 mt-1">
              Track your cognitive growth, problem solving velocity, and unlocked insignia.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="text-xs font-semibold px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              Robot Skins Store →
            </Link>
          </div>
        </div>

        {/* 5-Key Stats Grid matching concept.jpeg */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          <div className="bg-[#090e17] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between text-cyan-400">
              <span className="text-xs text-slate-400">Lessons Completed</span>
              <CheckCircle2 size={16} />
            </div>
            <div className="text-2xl font-black font-mono text-white mt-2">32</div>
          </div>

          <div className="bg-[#090e17] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between text-indigo-400">
              <span className="text-xs text-slate-400">Problems Solved</span>
              <Zap size={16} />
            </div>
            <div className="text-2xl font-black font-mono text-white mt-2">156</div>
          </div>

          <div className="bg-[#090e17] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between text-amber-500">
              <span className="text-xs text-slate-400">Current Streak</span>
              <Flame size={16} />
            </div>
            <div className="text-2xl font-black font-mono text-white mt-2">15 days</div>
          </div>

          <div className="bg-[#090e17] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-xs text-slate-400">Total XP</span>
              <Star size={16} />
            </div>
            <div className="text-2xl font-black font-mono text-white mt-2">2,450</div>
          </div>

          <div className="bg-[#090e17] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl col-span-2 md:col-span-1">
            <div className="flex items-center justify-between text-purple-400">
              <span className="text-xs text-slate-400">Global Rank</span>
              <Trophy size={16} />
            </div>
            <div className="text-2xl font-black font-mono text-white mt-2">#1420</div>
          </div>
        </div>

        {/* Recent Achievements Showcase */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="text-amber-400" size={18} />
              <h3 className="text-base font-bold text-white">Recent Achievements</h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">7 of 12 Unlocked</span>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {ACHIEVEMENTS.map((a) => (
              <div
                key={a.id}
                className="bg-[#090e17] border border-slate-800/80 rounded-2xl p-4 flex gap-3.5 items-start shadow-xl hover:border-slate-700 transition"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                  {a.icon}
                </div>

                <div className="space-y-1 min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{a.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-snug">{a.desc}</p>
                  <span className="text-[9px] font-mono text-emerald-400 block pt-1">{a.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Activity Heatmap & Accuracy */}
        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-[#090e17] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Weekly Mission Activity
            </h4>
            <div className="flex items-end justify-between h-36 pt-4 gap-2">
              {[
                { day: "Mon", count: 4, height: "45%" },
                { day: "Tue", count: 6, height: "65%" },
                { day: "Wed", count: 8, height: "85%" },
                { day: "Thu", count: 5, height: "55%" },
                { day: "Fri", count: 9, height: "95%" },
                { day: "Sat", count: 7, height: "75%" },
                { day: "Sun", count: 10, height: "100%" },
              ].map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-indigo-600 to-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all"
                    style={{ height: d.height }}
                  />
                  <span className="text-[10px] text-slate-400 font-mono">{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#090e17] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Subject Mastery Breakdown
            </h4>
            <div className="space-y-3 pt-2 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Data Structures &amp; Algorithms</span>
                  <span className="font-mono text-cyan-400 font-bold">82%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: "82%" }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Chemistry Virtual Labs</span>
                  <span className="font-mono text-emerald-400 font-bold">64%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: "64%" }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Physics Kinematics &amp; Mechanics</span>
                  <span className="font-mono text-indigo-400 font-bold">75%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div className="h-full bg-indigo-400 rounded-full" style={{ width: "75%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
