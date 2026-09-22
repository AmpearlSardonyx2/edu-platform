"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import NodeGraph from "@/components/NodeGraph";
import { 
  Code, Beaker, Orbit, Sparkles, ArrowRight, Play, CheckCircle2, FlaskConical 
} from "lucide-react";

export default function LearnPage() {
  const [selectedTrack, setSelectedTrack] = useState<"all" | "cs" | "chemistry" | "physics">("all");

  return (
    <AppShell>
      <main className="max-w-5xl mx-auto py-8 px-6 space-y-8">
        {/* Header Hero */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200 font-semibold">
                Interactive STEM Universe
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Explore Missions & Labs</h1>
            <p className="text-sm text-slate-500 mt-1">
              Select a subject to enter hands-on interactive simulations and gamified labs.
            </p>
          </div>

          {/* Subject Filter Pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium self-start md:self-auto">
            <button
              onClick={() => setSelectedTrack("all")}
              className={`px-3 py-1.5 rounded-lg transition ${selectedTrack === "all" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
            >
              All Subjects
            </button>
            <button
              onClick={() => setSelectedTrack("chemistry")}
              className={`px-3 py-1.5 rounded-lg transition ${selectedTrack === "chemistry" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
            >
              🧪 Chemistry
            </button>
            <button
              onClick={() => setSelectedTrack("physics")}
              className={`px-3 py-1.5 rounded-lg transition ${selectedTrack === "physics" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
            >
              🌌 Physics
            </button>
            <button
              onClick={() => setSelectedTrack("cs")}
              className={`px-3 py-1.5 rounded-lg transition ${selectedTrack === "cs" ? "bg-white text-cyan-700 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
            >
              💻 CS & Algorithms
            </button>
          </div>
        </div>

        {/* Featured Interactive Virtual Labs Showcase */}
        <div className="grid md:grid-cols-3 gap-5">
          {/* Chemistry Lab Card */}
          {(selectedTrack === "all" || selectedTrack === "chemistry") && (
            <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white rounded-2xl p-5 border border-emerald-900/50 shadow-xl flex flex-col justify-between hover:border-emerald-500/50 transition group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <FlaskConical size={20} />
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-emerald-950 px-2 py-0.5 rounded text-emerald-400 border border-emerald-800">
                    Virtual Lab
                  </span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition">
                  Acid-Base Titration & Pouring
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Interactive chemical pouring lab. Tilt flasks, observe phenolphthalein color transition from clear to vivid pink, and monitor pH & temperature curves.
                </p>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-medium text-amber-400 flex items-center gap-1">
                  <Sparkles size={13} /> +150 XP
                </span>
                <Link
                  href="/learn/chemistry-titration"
                  className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 group-hover:translate-x-0.5 transition"
                >
                  Enter Lab <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          )}

          {/* Physics Simulator Card */}
          {(selectedTrack === "all" || selectedTrack === "physics") && (
            <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white rounded-2xl p-5 border border-indigo-900/50 shadow-xl flex flex-col justify-between hover:border-indigo-500/50 transition group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                    <Orbit size={20} />
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-indigo-950 px-2 py-0.5 rounded text-indigo-400 border border-indigo-800">
                    Simulator
                  </span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition">
                  Projectile Motion Cannon
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Orbital target locking lab. Adjust launch angle $\theta$, muzzle velocity, and test Earth vs. Moon vs. Mars gravitational fields with live trajectory parabolas.
                </p>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-medium text-amber-400 flex items-center gap-1">
                  <Sparkles size={13} /> +150 XP
                </span>
                <Link
                  href="/learn/physics-projectile"
                  className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 group-hover:translate-x-0.5 transition"
                >
                  Launch Cannon <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          )}

          {/* Computer Science Card */}
          {(selectedTrack === "all" || selectedTrack === "cs") && (
            <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 text-white rounded-2xl p-5 border border-cyan-900/50 shadow-xl flex flex-col justify-between hover:border-cyan-500/50 transition group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                    <Code size={20} />
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-cyan-950 px-2 py-0.5 rounded text-cyan-400 border border-cyan-800">
                    Algorithm Lab
                  </span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition">
                  Bubble Sort Cargo Mission
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Mission-based algorithm sorting. Guide the cargo warehouse robot to compare adjacent crates and swap heavier containers before the rocket launch sequence.
                </p>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-medium text-amber-400 flex items-center gap-1">
                  <Sparkles size={13} /> +150 XP
                </span>
                <Link
                  href="/learn/bubble-sort"
                  className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 group-hover:translate-x-0.5 transition"
                >
                  Start Mission <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Topic Dependency Tree Section */}
        {(selectedTrack === "all" || selectedTrack === "cs") && (
          <div className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Subject Tree & Prerequisite Map</h2>
                <p className="text-xs text-slate-500">Navigate or search through interconnected curriculum topics</p>
              </div>
            </div>
            <Suspense fallback={<div className="text-sm text-slate-400 py-6 text-center">Loading topic tree...</div>}>
              <NodeGraph />
            </Suspense>
          </div>
        )}
      </main>
    </AppShell>
  );
}