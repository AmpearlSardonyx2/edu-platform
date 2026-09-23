"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { 
  Code2, CheckCircle2, Sparkles, ArrowRight, Filter, 
  Search, FlaskConical, Orbit, ShieldCheck 
} from "lucide-react";

interface Problem {
  id: string;
  title: string;
  category: "CS" | "Chemistry" | "Physics";
  difficulty: "Easy" | "Medium" | "Hard";
  acceptance: string;
  xp: number;
  solved: boolean;
  slug: string;
}

const PROBLEMS: Problem[] = [
  {
    id: "p1",
    title: "Bubble Sort Cargo Alignment",
    category: "CS",
    difficulty: "Easy",
    acceptance: "91.4%",
    xp: 150,
    solved: true,
    slug: "bubble-sort",
  },
  {
    id: "p2",
    title: "Acid-Base Equivalence Neutralization",
    category: "Chemistry",
    difficulty: "Easy",
    acceptance: "84.2%",
    xp: 150,
    solved: true,
    slug: "chemistry-titration",
  },
  {
    id: "p3",
    title: "Lunar Rover Slingshot Trajectory",
    category: "Physics",
    difficulty: "Medium",
    acceptance: "72.8%",
    xp: 200,
    solved: true,
    slug: "physics-projectile",
  },
  {
    id: "p4",
    title: "Selection Sort Minimum Extraction",
    category: "CS",
    difficulty: "Easy",
    acceptance: "88.1%",
    xp: 150,
    solved: false,
    slug: "selection-sort",
  },
  {
    id: "p5",
    title: "Binary Search Valley Scanner",
    category: "CS",
    difficulty: "Medium",
    acceptance: "65.3%",
    xp: 250,
    solved: false,
    slug: "binary-search",
  },
  {
    id: "p6",
    title: "Two Sum Target Lock",
    category: "CS",
    difficulty: "Easy",
    acceptance: "89.5%",
    xp: 150,
    solved: false,
    slug: "two-sum",
  },
];

export default function PracticePage() {
  const [filter, setFilter] = useState<string>("All");
  const [query, setQuery] = useState("");

  const filtered = PROBLEMS.filter((p) => {
    const matchFilter = filter === "All" || p.category === filter;
    const matchQuery = p.title.toLowerCase().includes(query.toLowerCase());
    return matchFilter && matchQuery;
  });

  return (
    <AppShell>
      <main className="max-w-6xl mx-auto py-8 px-6 space-y-6 select-none">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-[11px] uppercase font-mono tracking-widest text-cyan-400 font-bold bg-cyan-950/60 px-2.5 py-0.5 rounded border border-cyan-800">
              Training Grounds
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-1">Problem Arena &amp; Challenges</h1>
            <p className="text-xs text-slate-400 mt-1">
              Test your algorithmic and scientific instincts with interactive hands-on challenges.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search problems by name..."
              className="w-full bg-[#080d16] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-[#080d16] p-1 rounded-xl border border-slate-800 text-xs">
            {["All", "CS", "Chemistry", "Physics"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filter === cat
                    ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Problems Table */}
        <div className="bg-[#090e17] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-[#060a12] text-slate-400 uppercase font-mono text-[10px]">
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Difficulty</th>
                <th className="py-3 px-4">Acceptance</th>
                <th className="py-3 px-4">Reward</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3.5 px-4">
                    {p.solved ? (
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 flex items-center justify-center font-bold">
                        ✓
                      </span>
                    ) : (
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center font-bold">
                        ○
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-200">
                    {p.title}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    {p.category}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.difficulty === "Easy"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : p.difficulty === "Medium"
                          ? "bg-amber-950 text-amber-400 border border-amber-800"
                          : "bg-rose-950 text-rose-400 border border-rose-800"
                      }`}
                    >
                      {p.difficulty}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    {p.acceptance}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                    +{p.xp} XP
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={p.category === "Chemistry" ? "/learn/chemistry-titration" : p.category === "Physics" ? "/learn/physics-projectile" : `/learn/${p.slug}`}
                      className="inline-flex items-center gap-1 font-bold text-cyan-400 hover:text-cyan-300 transition"
                    >
                      Solve <ArrowRight size={13} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </AppShell>
  );
}
