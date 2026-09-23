"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, ZoomIn, ZoomOut, Compass } from "lucide-react";

interface OrbitNode {
  id: string;
  title: string;
  slug: string;
  status: "completed" | "in-progress" | "not-started";
  hasContent: boolean;
}

interface OrbitCategory {
  id: string;
  title: string;
  color: string;
  lightBg: string;
  angle: number;
  distance: number;
  subNodes: OrbitNode[];
}

const DEFAULT_GALAXY_DATA: OrbitCategory[] = [
  {
    id: "arrays",
    title: "ARRAYS",
    color: "#10b981", // emerald
    lightBg: "#ecfdf5",
    angle: 300,
    distance: 180,
    subNodes: [
      { id: "arr-intro", title: "Intro", slug: "arrays-intro", status: "completed", hasContent: false },
      { id: "arr-traversal", title: "Traversal", slug: "arrays-traversal", status: "completed", hasContent: false },
      { id: "arr-insertion", title: "Insertion", slug: "arrays-insertion", status: "completed", hasContent: false },
    ],
  },
  {
    id: "sorting",
    title: "SORTING",
    color: "#f97316", // orange
    lightBg: "#fff7ed",
    angle: 20,
    distance: 210,
    subNodes: [
      { id: "bubble-sort", title: "Bubble Sort", slug: "bubble-sort", status: "in-progress", hasContent: true },
      { id: "selection-sort", title: "Selection Sort", slug: "selection-sort", status: "not-started", hasContent: false },
      { id: "insertion-sort", title: "Insertion Sort", slug: "insertion-sort", status: "not-started", hasContent: false },
      { id: "merge-sort", title: "Merge Sort", slug: "merge-sort", status: "not-started", hasContent: false },
    ],
  },
  {
    id: "trees",
    title: "TREES",
    color: "#a855f7", // purple
    lightBg: "#faf5ff",
    angle: 90,
    distance: 190,
    subNodes: [
      { id: "trees-intro", title: "Intro", slug: "trees-intro", status: "not-started", hasContent: false },
      { id: "binary-tree", title: "Binary Tree", slug: "binary-tree", status: "not-started", hasContent: false },
      { id: "bst", title: "BST", slug: "bst", status: "not-started", hasContent: false },
    ],
  },
  {
    id: "queues",
    title: "QUEUES",
    color: "#eab308", // amber
    lightBg: "#fefce8",
    angle: 150,
    distance: 190,
    subNodes: [
      { id: "queues-intro", title: "Intro", slug: "queues-intro", status: "not-started", hasContent: false },
      { id: "circular-queue", title: "Circular Queue", slug: "circular-queue", status: "not-started", hasContent: false },
      { id: "deque", title: "Deque", slug: "deque", status: "not-started", hasContent: false },
    ],
  },
  {
    id: "stacks",
    title: "STACKS",
    color: "#06b6d4", // cyan
    lightBg: "#ecfeff",
    angle: 215,
    distance: 200,
    subNodes: [
      { id: "stacks-intro", title: "Intro", slug: "stacks-intro", status: "completed", hasContent: false },
      { id: "operations", title: "Operations", slug: "stacks-operations", status: "completed", hasContent: false },
      { id: "applications", title: "Applications", slug: "stacks-applications", status: "completed", hasContent: false },
    ],
  },
];

export default function NodeGraph() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [zoom, setZoom] = useState(1);

  // Center coordinate of canvas
  const centerX = 440;
  const centerY = 310;

  const searchableNodes = useMemo(() => {
    const list: Array<{ title: string; category: string; slug: string; hasContent: boolean }> = [];
    DEFAULT_GALAXY_DATA.forEach((cat) => {
      cat.subNodes.forEach((sub) => {
        list.push({ title: sub.title, category: cat.title, slug: sub.slug, hasContent: sub.hasContent });
      });
    });
    return list;
  }, []);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    return searchableNodes.filter((n) => n.title.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
  }, [query, searchableNodes]);

  const handleLaunchNode = (node: OrbitNode) => {
    if (node.slug === "bubble-sort" || node.hasContent) {
      router.push(`/learn/${node.slug}`);
    } else {
      router.push(`/learn/bubble-sort`);
    }
  };

  return (
    <div className="flex flex-col gap-4 select-none w-full">
      {/* Search & Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topics (e.g. Bubble Sort, Stacks, Trees)..."
            className="w-full bg-white dark:bg-[#080d16] border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 shadow-sm outline-none focus:border-indigo-500"
          />

          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#090e17] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-30 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {searchResults.map((item) => (
                <button
                  key={item.slug}
                  onClick={() => router.push(`/learn/${item.slug}`)}
                  className="w-full px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300"
                >
                  <span className="font-semibold">{item.title}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">{item.category}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-[#080d16] border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl text-slate-500 shadow-sm">
          <button
            onClick={() => setZoom((z) => Math.max(0.7, z - 0.1))}
            className="p-1.5 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            title="Zoom out"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-xs font-mono w-10 text-center text-slate-700 dark:text-slate-300 font-semibold">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
            className="p-1.5 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            title="Zoom in"
          >
            <ZoomIn size={16} />
          </button>
        </div>
      </div>

      {/* Galaxy Map Arena matching dashboard,visual design.jpeg & light theme design.jpeg */}
      <div 
        className="relative w-full rounded-3xl border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-2xl min-h-[580px] flex items-center justify-center transition-colors bg-white dark:bg-[#060911]"
      >
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#6366f1 1px, transparent 1px), radial-gradient(#06b6d4 1px, transparent 1px)",
            backgroundSize: "36px 36px",
            backgroundPosition: "0 0, 18px 18px",
          }}
        />

        <div 
          className="relative transition-transform duration-300"
          style={{ 
            width: 880, 
            height: 620,
            transform: `scale(${zoom})`,
          }}
        >
          {/* Orbital connecting lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" width="880" height="620">
            {DEFAULT_GALAXY_DATA.map((cat) => {
              const rad = (cat.angle * Math.PI) / 180;
              const catX = centerX + cat.distance * Math.cos(rad);
              const catY = centerY + cat.distance * Math.sin(rad);

              return (
                <g key={cat.id}>
                  {/* Ray to Category */}
                  <line
                    x1={centerX}
                    y1={centerY}
                    x2={catX}
                    y2={catY}
                    stroke={cat.color}
                    strokeWidth={1.5}
                    strokeOpacity={0.5}
                    strokeDasharray="4 4"
                  />

                  {/* Branch rays to subnodes */}
                  {cat.subNodes.map((sub, idx) => {
                    const subSpread = ((idx - (cat.subNodes.length - 1) / 2) * 28 * Math.PI) / 180;
                    const subRad = rad + subSpread;
                    const subX = catX + 70 * Math.cos(subRad);
                    const subY = catY + 70 * Math.sin(subRad);

                    return (
                      <line
                        key={sub.id}
                        x1={catX}
                        y1={catY}
                        x2={subX}
                        y2={subY}
                        stroke={cat.color}
                        strokeWidth={1.2}
                        strokeOpacity={0.4}
                      />
                    );
                  })}
                </g>
              );
            })}
          </svg>

          {/* Central Sun: DSA Master Core */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full flex flex-col items-center justify-center text-center p-3 cursor-pointer z-20 shadow-2xl transition hover:scale-105"
            style={{
              left: centerX,
              top: centerY,
              width: 140,
              height: 140,
              background: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
              boxShadow: "0 0 40px rgba(99, 102, 241, 0.4)",
              border: "3px solid rgba(255, 255, 255, 0.3)",
            }}
          >
            <span className="text-base font-black tracking-widest text-white uppercase drop-shadow">
              DSA
            </span>
            <span className="text-[10px] text-indigo-100 font-medium leading-tight mt-0.5 max-w-[90px]">
              Data Structures &amp; Algorithms
            </span>
          </div>

          {/* Category Planetary Orbs */}
          {DEFAULT_GALAXY_DATA.map((cat) => {
            const rad = (cat.angle * Math.PI) / 180;
            const catX = centerX + cat.distance * Math.cos(rad);
            const catY = centerY + cat.distance * Math.sin(rad);

            return (
              <div key={cat.id}>
                {/* Main Planet Node */}
                <div
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-center p-2 cursor-pointer z-20 transition hover:scale-110 shadow-lg"
                  style={{
                    left: catX,
                    top: catY,
                    width: 76,
                    height: 76,
                    backgroundColor: "var(--card)",
                    border: `2.5px solid ${cat.color}`,
                  }}
                >
                  <span className="text-xs font-black text-slate-800 dark:text-white tracking-wider">
                    {cat.title}
                  </span>
                </div>

                {/* Sub-node Moons */}
                {cat.subNodes.map((sub, idx) => {
                  const subSpread = ((idx - (cat.subNodes.length - 1) / 2) * 28 * Math.PI) / 180;
                  const subRad = rad + subSpread;
                  const subX = catX + 70 * Math.cos(subRad);
                  const subY = catY + 70 * Math.sin(subRad);

                  const isCompleted = sub.status === "completed";
                  const isInProgress = sub.status === "in-progress";

                  const borderColor = isCompleted ? "#10b981" : isInProgress ? "#a855f7" : "#94a3b8";

                  let badgeStyle = "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 shadow-sm";
                  if (isCompleted) {
                    badgeStyle = "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold shadow-sm";
                  } else if (isInProgress) {
                    badgeStyle = "bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-bold shadow-md shadow-purple-500/20 animate-pulse";
                  }

                  return (
                    <button
                      key={sub.id}
                      onClick={() => handleLaunchNode(sub)}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full px-3 py-1 text-[11px] border transition-transform hover:scale-110 z-20 whitespace-nowrap ${badgeStyle}`}
                      style={{
                        left: subX,
                        top: subY,
                        borderColor: borderColor,
                        borderWidth: 1.5,
                      }}
                      title={`Launch ${sub.title}`}
                    >
                      {sub.title}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Legend Bar at Bottom */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-[#090e17]/90 border border-slate-200 dark:border-slate-800 rounded-full px-6 py-2 flex items-center gap-6 text-xs backdrop-blur shadow-xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
            <span className="text-slate-600 dark:text-slate-300 font-semibold text-[11px]">COMPLETED</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_6px_#a855f7]" />
            <span className="text-slate-600 dark:text-slate-300 font-semibold text-[11px]">IN PROGRESS</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span className="text-slate-500 dark:text-slate-400 font-semibold text-[11px]">NOT STARTED</span>
          </div>
        </div>
      </div>
    </div>
  );
}