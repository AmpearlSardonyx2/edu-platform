"use client";

import { useState, useEffect, useRef, useMemo, useLayoutEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ContentNode } from "@/lib/nodes";
import { Search } from "lucide-react";

interface LinePos { key: string; x1: number; y1: number; x2: number; y2: number; }

function getChildren(nodes: ContentNode[], parentId: string) {
  return nodes.filter((n) => n.parentId === parentId).sort((a, b) => a.orderIndex - b.orderIndex);
}
function findBySlug(nodes: ContentNode[], slug: string) {
  return nodes.find((n) => n.slug === slug);
}

function NodeCircle({ node, allNodes, isSelected, isHighlighted, onClick, innerRef }: {
  node: ContentNode; allNodes: ContentNode[]; isSelected: boolean; isHighlighted: boolean; onClick: () => void; innerRef?: (el: HTMLButtonElement | null) => void;
}) {
  const isLeaf = getChildren(allNodes, node.id).length === 0;
  const isDisabledLeaf = isLeaf && !node.hasContent;

  let classes = "bg-white text-slate-700 border-slate-300 hover:border-indigo-400 hover:text-indigo-600";
  if (isSelected) classes = "bg-indigo-600 text-white border-indigo-600 shadow-md";
  else if (isLeaf && node.hasContent) classes = "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100";
  else if (isLeaf && !node.hasContent) classes = "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed";

  return (
    <button ref={innerRef} onClick={onClick} disabled={isDisabledLeaf} className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center text-center text-xs font-medium px-2 border-2 transition ${classes} ${isHighlighted ? "ring-4 ring-indigo-300" : ""}`}>
      {node.title}
    </button>
  );
}

export default function NodeGraph() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [nodes, setNodes] = useState<ContentNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [selectedAlgoId, setSelectedAlgoId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [lines, setLines] = useState<LinePos[]>([]);

  useEffect(() => {
    fetch("/api/nodes")
      .then((r) => r.json())
      .then((data) => setNodes(data.nodes ?? []))
      .finally(() => setLoading(false));
  }, []);

  const rootNode = nodes.find((n) => n.type === "subject");
  const chapters = rootNode ? getChildren(nodes, rootNode.id) : [];
  const algorithms = selectedChapterId ? getChildren(nodes, selectedChapterId) : [];

  const containerRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLButtonElement | null>(null);
  const chapterRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const algoRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const recomputeLines = () => {
    const container = containerRef.current;
    const root = rootRef.current;
    if (!container || !root) return;

    const cRect = container.getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();
    const rootX = rootRect.left + rootRect.width / 2 - cRect.left;
    const rootY = rootRect.bottom - cRect.top;

    const newLines: LinePos[] = [];

    chapters.forEach((ch) => {
      const el = chapterRefs.current.get(ch.id);
      if (!el) return;
      const r = el.getBoundingClientRect();
      newLines.push({ key: `root-${ch.id}`, x1: rootX, y1: rootY, x2: r.left + r.width / 2 - cRect.left, y2: r.top - cRect.top });
    });

    if (selectedChapterId) {
      const parentEl = chapterRefs.current.get(selectedChapterId);
      if (parentEl) {
        const pr = parentEl.getBoundingClientRect();
        const px = pr.left + pr.width / 2 - cRect.left;
        const py = pr.bottom - cRect.top;
        algorithms.forEach((alg) => {
          const el = algoRefs.current.get(alg.id);
          if (!el) return;
          const r = el.getBoundingClientRect();
          newLines.push({ key: `${selectedChapterId}-${alg.id}`, x1: px, y1: py, x2: r.left + r.width / 2 - cRect.left, y2: r.top - cRect.top });
        });
      }
    }

    setLines(newLines);
  };

  useLayoutEffect(() => {
    recomputeLines();
    window.addEventListener("resize", recomputeLines);
    return () => window.removeEventListener("resize", recomputeLines);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChapterId, algorithms.length, chapters.length, nodes.length]);

  useEffect(() => {
    const from = searchParams.get("from");
    if (!from || nodes.length === 0) return;
    const node = findBySlug(nodes, from);
    if (!node) return;
    if (node.parentId) setSelectedChapterId(node.parentId);
    setSelectedAlgoId(node.id);
    setHighlightId(node.id);
    const t = setTimeout(() => setHighlightId(null), 1600);
    return () => clearTimeout(t);
  }, [searchParams, nodes]);

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return nodes.filter((n) => n.type !== "subject" && n.title.toLowerCase().includes(q)).slice(0, 6);
  }, [query, nodes]);

  const handleSelectChapter = (node: ContentNode) => {
    setSelectedAlgoId(null);
    setSelectedChapterId((prev) => (prev === node.id ? null : node.id));
  };

  const handleSelectAlgorithm = (node: ContentNode) => {
    if (!node.hasContent) return;
    router.push(`/learn/${node.slug}`);
  };

  const jumpToNode = (node: ContentNode) => {
    setQuery("");
    if (node.type === "chapter") {
      setSelectedChapterId(node.id);
      setSelectedAlgoId(null);
    } else {
      const parent = nodes.find((n) => n.id === node.parentId);
      if (parent) setSelectedChapterId(parent.id);
      if (node.hasContent) { router.push(`/learn/${node.slug}`); return; }
      setSelectedAlgoId(node.id);
    }
    setHighlightId(node.id);
    setTimeout(() => setHighlightId(null), 1600);
  };

  if (loading) return <div className="text-sm text-slate-400 py-10 text-center">Loading topics...</div>;
  if (!rootNode) return <div className="text-sm text-slate-400 py-10 text-center">No topics yet. Add some in the admin panel.</div>;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="What do you want to learn today?" className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        {suggestions.length > 0 && (
          <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
            {suggestions.map((s) => (
              <button key={s.id} onClick={() => jumpToNode(s)} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center justify-between">
                <span>{s.title}</span>
                <span className="text-[10px] uppercase text-slate-400">{s.type}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div ref={containerRef} className="relative bg-white border border-slate-200 rounded-xl py-14 px-6 min-h-[420px] overflow-hidden">
        <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
          <defs>
            <marker id="tree-arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <polygon points="0 0, 8 4, 0 8" fill="#4ade80" />
            </marker>
          </defs>
          {lines.map((l) => (
            <line key={l.key} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#4ade80" strokeWidth={3} markerEnd="url(#tree-arrowhead)" />
          ))}
        </svg>

        <div className="relative flex flex-col items-center gap-20">
          <NodeCircle node={rootNode} allNodes={nodes} isSelected isHighlighted={false} onClick={() => {}} innerRef={(el) => (rootRef.current = el)} />

          <div className="flex justify-center gap-14">
            {chapters.map((ch) => (
              <NodeCircle key={ch.id} node={ch} allNodes={nodes} isSelected={selectedChapterId === ch.id} isHighlighted={highlightId === ch.id} onClick={() => handleSelectChapter(ch)} innerRef={(el) => { if (el) chapterRefs.current.set(ch.id, el); }} />
            ))}
          </div>

          {selectedChapterId && algorithms.length > 0 && (
            <div className="flex justify-center gap-14">
              {algorithms.map((alg) => (
                <NodeCircle key={alg.id} node={alg} allNodes={nodes} isSelected={selectedAlgoId === alg.id} isHighlighted={highlightId === alg.id} onClick={() => handleSelectAlgorithm(alg)} innerRef={(el) => { if (el) algoRefs.current.set(alg.id, el); }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}