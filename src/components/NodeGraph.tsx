"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ZoomIn, ZoomOut, Maximize2, Sparkles, Compass } from "lucide-react";
import { ContentNode } from "@/lib/nodes";

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
  glowColor: string;
  angle: number; // in degrees around center
  distance: number; // in pixels
  subNodes: OrbitNode[];
}

const DEFAULT_GALAXY_DATA: OrbitCategory[] = [
  {
    id: "arrays",
    title: "ARRAYS",
    color: "#10b981", // emerald
    glowColor: "rgba(16, 185, 129, 0.4)",
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
    glowColor: "rgba(249, 115, 22, 0.4)",
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
    glowColor: "rgba(168, 85, 247, 0.4)",
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
    glowColor: "rgba(234, 179, 8, 0.4)",
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
    glowColor: "rgba(6, 182, 212, 0.4)",
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
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");
  const [zoom, setZoom] = useState(1);
  const [selectedSubNode, setSelectedSubNode] = useState<string | null>(null);

  // Center coordinate of canvas
  const centerX = 440;
  const centerY = 310;

  // Flattened nodes for search
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
    setSelectedSubNode(node.id);
    if (node.slug === "bubble-sort" || node.hasContent) {
      router.push(`/learn/${node.slug}`);
    } else {
      router.push(`/learn/bubble-sort`);
    }
  };

  return (
    <div className="flex flex-col gap-4 select-none">
      {/* Top Search & Controls Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search constellation nodes (e.g. Bubble Sort, Stacks)..."
            className="w-full bg-[#080d16] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />

          {/* Quick search dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#090e17] border border-slate-800 rounded-xl shadow-2xl z-30 overflow-hidden">
              {searchResults.map((item) => (
                <button
                  key={item.slug}
                  onClick={() => router.push(`/learn/${item.slug}`)}
                  className="w-full px-3 py-2 text-left hover:bg-slate-800/60 flex items-center justify-between text-xs text-slate-300"
                >
                  <span className="font-semibold">{item.title}</span>
                  <span className="text-[10px] text-slate-500 uppercase">{item.category}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5 bg-[#080d16] border border-slate-800 p-1 rounded-xl text-slate-400">
          <button
            onClick={() => setZoom((z) => Math.max(0.7, z - 0.1))}
            className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Zoom out"
          >
            <ZoomOut size={15} />
          </button>
          <span className="text-[11px] font-mono w-10 text-center text-slate-300">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
            className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Zoom in"
          >
            <ZoomIn size={15} />
          </button>
        </div>
      </div>

      {/* Galaxy Map Arena matching dashboard,visual design.jpeg */}
      <div 
        className="relative w-full rounded-3xl border border-slate-800/80 overflow-hidden shadow-2xl min-h-[580px] flex items-center justify-center"
        style={{
          background: "radial-gradient(ellipse at center, #0f172a 0%, #060911 100%)",
        }}
      >
        {/* Starry Grid and Constellation Dust */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#818cf8 1px, transparent 1px), radial-gradient(#38bdf8 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            backgroundPosition: "0 0, 20px 20px",
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
          {/* SVG Orbital Rays & Connectors */}
          <svg className="absolute inset-0 w-full height-full pointer-events-none" width="880" height="620">
            {DEFAULT_GALAXY_DATA.map((cat) => {
              const rad = (cat.angle * Math.PI) / 180;
              const catX = centerX + cat.distance * Math.cos(rad);
              const catY = centerY + cat.distance * Math.sin(rad);

              return (
                <g key={cat.id}>
                  {/* Central Ray */}
                  <line
                    x1={centerX}
                    y1={centerY}
                    x2={catX}
                    y2={catY}
                    stroke={cat.color}
                    strokeWidth={1.5}
                    strokeOpacity={0.6}
                    strokeDasharray="3 3"
                  />

                  {/* Sub-node branching rays */}
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
              background: "radial-gradient(circle, #7c3aed 0%, #4c1d95 70%, #2e1065 100%)",
              boxShadow: "0 0 50px rgba(124, 58, 237, 0.5), inset 0 0 20px rgba(192, 132, 252, 0.4)",
              border: "2px solid rgba(192, 132, 252, 0.6)",
            }}
          >
            <span className="text-sm font-black tracking-widest text-white uppercase drop-shadow">
              DSA
            </span>
            <span className="text-[10px] text-purple-200/80 leading-tight mt-0.5">
              Data Structures &amp; Algorithms
            </span>
          </div>

          {/* Planetary Category Orbs & Sub-Moons */}
          {DEFAULT_GALAXY_DATA.map((cat) => {
            const rad = (cat.angle * Math.PI) / 180;
            const catX = centerX + cat.distance * Math.cos(rad);
            const catY = centerY + cat.distance * Math.sin(rad);

            return (
              <div key={cat.id}>
                {/* Main Category Orb */}
                <div
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-center p-2 cursor-pointer z-20 transition hover:scale-110"
                  style={{
                    left: catX,
                    top: catY,
                    width: 76,
                    height: 76,
                    backgroundColor: "#090e17",
                    border: `2.5px solid ${cat.color}`,
                    boxShadow: `0 0 20px ${cat.glowColor}`,
                  }}
                >
                  <span className="text-[11px] font-extrabold text-white tracking-wider">
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

                  const borderColor = isCompleted ? "#10b981" : isInProgress ? "#a855f7" : "#475569";
                  const bgStyle = isCompleted 
                    ? "bg-emerald-950/80 text-emerald-300" 
                    : isInProgress 
                    ? "bg-purple-950/80 text-purple-300 animate-pulse shadow-[0_0_12px_rgba(168,85,247,0.5)]" 
                    : "bg-slate-900/80 text-slate-400";

                  return (
                    <button
                      key={sub.id}
                      onClick={() => handleLaunchNode(sub)}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide border transition hover:scale-110 z-20 whitespace-nowrap ${bgStyle}`}
                      style={{
                        left: subX,
                        top: subY,
                        borderColor: borderColor,
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
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-[#090e17]/90 border border-slate-800 rounded-full px-5 py-2 flex items-center gap-6 text-xs backdrop-blur shadow-xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
            <span className="text-slate-300 text-[11px] font-medium">COMPLETED</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_8px_#a855f7]" />
            <span className="text-slate-300 text-[11px] font-medium">IN PROGRESS</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            <span className="text-slate-400 text-[11px] font-medium">NOT STARTED</span>
          </div>
        </div>
      </div>
    </div>
  );
}