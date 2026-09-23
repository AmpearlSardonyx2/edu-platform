"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { 
  Plus, Trash2, Save, ChevronRight, ChevronDown, Loader2, 
  Upload, Download, Code, Palette, Beaker, Orbit, FileCode2 
} from "lucide-react";
import { ContentNode } from "@/lib/nodes";
import LessonPreview from "@/components/lessons/LessonPreview";

interface LessonFields {
  entryFunctionName: string;
  defaultCode: string;
  visualTheme: string;
  explanationStart: string;
  explanationCompareGreater: string;
  explanationCompareLess: string;
  explanationSwap: string;
  explanationMarkSorted: string;
  explanationDone: string;
}

interface AdminNode extends ContentNode {
  lesson: LessonFields | null;
}

const BLANK_LESSON: LessonFields = {
  entryFunctionName: "bubbleSort",
  defaultCode: `function bubbleSort(arr, trace) {
  let n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      trace.compare(j, j + 1);
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
        trace.swap(j, j + 1);
      }
    }
    trace.markSorted(n - 1 - i);
  }
  trace.markSorted(0);
  return arr;
}`,
  visualTheme: "warehouse",
  explanationStart: "The crates just arrived on the conveyor belt.",
  explanationCompareGreater: "Comparing {a} and {b}: {a} is heavier, swapping positions.",
  explanationCompareLess: "Comparing {a} and {b}: already in order, moving ahead.",
  explanationSwap: "Swapping crates {a} and {b} on the belt.",
  explanationMarkSorted: "Crate {v} locked in final sorted position.",
  explanationDone: "All cargo crates are sorted! Ready for launch.",
};

function TreeRow({
  node,
  nodes,
  depth,
  selectedId,
  onSelect,
  onAddChild,
}: {
  node: AdminNode;
  nodes: AdminNode[];
  depth: number;
  selectedId: string | null;
  onSelect: (n: AdminNode) => void;
  onAddChild: (parent: AdminNode) => void;
}) {
  const children = nodes.filter((n) => n.parentId === node.id).sort((a, b) => a.orderIndex - b.orderIndex);
  const [open, setOpen] = useState(true);

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 py-1.5 px-2 rounded-lg text-xs cursor-pointer transition ${
          selectedId === node.id 
            ? "bg-cyan-950/80 text-cyan-300 border border-cyan-800" 
            : "text-slate-300 hover:bg-slate-800/60"
        }`}
        style={{ paddingLeft: depth * 14 + 8 }}
      >
        {children.length > 0 ? (
          <button onClick={() => setOpen((o) => !o)} className="text-slate-500 hover:text-slate-300">
            {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </button>
        ) : (
          <span className="w-3" />
        )}

        <span onClick={() => onSelect(node)} className="flex-1 truncate font-medium">
          {node.title}
        </span>
        <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400">
          {node.type}
        </span>

        {node.type !== "algorithm" && (
          <button 
            onClick={() => onAddChild(node)} 
            title="Add child topic" 
            className="text-slate-500 hover:text-cyan-400 p-0.5 transition"
          >
            <Plus size={13} />
          </button>
        )}
      </div>

      {open && children.map((c) => (
        <TreeRow
          key={c.id}
          node={c}
          nodes={nodes}
          depth={depth + 1}
          selectedId={selectedId}
          onSelect={onSelect}
          onAddChild={onAddChild}
        />
      ))}
    </div>
  );
}

export default function AdminPanel() {
  const [nodes, setNodes] = useState<AdminNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selected, setSelected] = useState<AdminNode | null>(null);
  const [isNew, setIsNew] = useState(false);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState<"subject" | "chapter" | "algorithm">("chapter");
  const [parentId, setParentId] = useState<string>("");
  const [orderIndex, setOrderIndex] = useState(1);
  const [lesson, setLesson] = useState<LessonFields | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const jsonImportRef = useRef<HTMLInputElement | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/nodes")
      .then((r) => r.json())
      .then((data) => setNodes(data.nodes ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const roots = nodes.filter((n) => !n.parentId);

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setType("chapter");
    setParentId("");
    setOrderIndex(1);
    setLesson(null);
  };

  const selectNode = (node: AdminNode) => {
    setSelected(node);
    setIsNew(false);
    setTitle(node.title);
    setSlug(node.slug);
    setType(node.type);
    setParentId(node.parentId ?? "");
    setOrderIndex(node.orderIndex);
    setLesson(node.lesson ?? (node.type === "algorithm" ? { ...BLANK_LESSON } : null));
  };

  const startAddChild = (parent: AdminNode) => {
    setSelected(null);
    setIsNew(true);
    resetForm();
    setParentId(parent.id);
    setType(parent.type === "subject" ? "chapter" : "algorithm");
    if ((parent.type === "subject" ? "chapter" : "algorithm") === "algorithm") {
      setLesson({ ...BLANK_LESSON });
    }
  };

  const startAddRoot = () => {
    setSelected(null);
    setIsNew(true);
    resetForm();
    setType("subject");
  };

  const handleTypeChange = (t: "subject" | "chapter" | "algorithm") => {
    setType(t);
    setLesson(t === "algorithm" ? (lesson ?? { ...BLANK_LESSON }) : null);
  };

  // Code File Upload handler (.js, .py, .ts, .txt)
  const handleCodeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && lesson) {
        setLesson({ ...lesson, defaultCode: content });
      }
    };
    reader.readAsText(file);
  };

  // JSON Lesson Package Export
  const handleExportJson = () => {
    if (!lesson) return;
    const exportData = {
      title,
      slug,
      type,
      orderIndex,
      lesson,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug || "lesson"}-config.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // JSON Lesson Package Import
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.slug) setSlug(parsed.slug);
        if (parsed.type) setType(parsed.type);
        if (parsed.lesson) setLesson(parsed.lesson);
      } catch (err) {
        alert("Invalid JSON configuration file");
      }
    };
    reader.readAsText(file);
  };

  const handleSave = async () => {
    if (!title.trim() || !slug.trim()) {
      alert("Title and slug are required");
      return;
    }
    setSaving(true);
    const payload = { title, slug, type, parentId: parentId || null, orderIndex, lesson };

    try {
      const res = isNew
        ? await fetch("/api/admin/nodes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch(`/api/admin/nodes/${selected!.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Save failed");
        return;
      }
      load();
      setSelected(null);
      setIsNew(false);
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    if (!confirm(`Delete "${selected.title}" and all its children? This can't be undone.`)) return;
    await fetch(`/api/admin/nodes/${selected.id}`, { method: "DELETE" });
    setSelected(null);
    resetForm();
    load();
  };

  const showForm = isNew || !!selected;

  return (
    <div className="grid grid-cols-[280px_1fr] h-full bg-[#070b14] text-slate-100 select-none">
      
      {/* Hidden file upload inputs */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleCodeFileUpload} 
        accept=".js,.py,.ts,.cpp,.java,.txt" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={jsonImportRef} 
        onChange={handleImportJson} 
        accept=".json" 
        className="hidden" 
      />

      {/* LEFT: Tree Sidebar */}
      <div className="border-r border-slate-800 bg-[#090e17] flex flex-col h-full">
        <div className="px-4 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Curriculum Structure
          </span>
          <button
            onClick={startAddRoot}
            className="text-[11px] px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 flex items-center gap-1 transition"
          >
            <Plus size={12} /> Add Root
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading ? (
            <div className="p-4 text-xs text-slate-500 font-mono flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" /> Loading curriculum tree...
            </div>
          ) : roots.length === 0 ? (
            <p className="p-4 text-xs text-slate-500">No nodes created yet.</p>
          ) : (
            roots.map((root) => (
              <TreeRow
                key={root.id}
                node={root}
                nodes={nodes}
                depth={0}
                selectedId={selected?.id ?? null}
                onSelect={selectNode}
                onAddChild={startAddChild}
              />
            ))
          )}
        </div>
      </div>

      {/* RIGHT: Node Editor Form & Live Preview */}
      <div className="overflow-y-auto flex flex-col h-full bg-[#070b14]">
        {showForm ? (
          <div className="p-6 max-w-5xl space-y-6">
            
            {/* Top Action Bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {isNew ? "Create New Node" : `Edit: ${selected?.title}`}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure topics, code algorithms, visual themes, and simulation parameters.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* JSON Import/Export */}
                <button
                  type="button"
                  onClick={() => jsonImportRef.current?.click()}
                  className="flex items-center gap-1 text-xs border border-slate-700 bg-slate-800 px-3 py-1.5 rounded-lg text-slate-300 hover:text-white transition"
                  title="Import lesson config JSON"
                >
                  <Upload size={13} /> Import JSON
                </button>
                {lesson && (
                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="flex items-center gap-1 text-xs border border-slate-700 bg-slate-800 px-3 py-1.5 rounded-lg text-slate-300 hover:text-white transition"
                    title="Export lesson config JSON"
                  >
                    <Download size={13} /> Export JSON
                  </button>
                )}

                {!isNew && (
                  <button
                    onClick={handleDelete}
                    className="text-xs text-rose-400 border border-rose-900 bg-rose-950/40 hover:bg-rose-900/60 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold px-4 py-1.5 rounded-lg transition shadow-md shadow-cyan-500/20"
                >
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  Save Node
                </button>
              </div>
            </div>

            {/* Core Node Metadata Form */}
            <div className="grid sm:grid-cols-2 gap-4 bg-[#090e17] border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Bubble Sort or Titration Lab"
                  className="w-full bg-[#060a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Slug (URL path)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. bubble-sort"
                  className="w-full bg-[#060a12] border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Node Type</label>
                <select
                  value={type}
                  onChange={(e) => handleTypeChange(e.target.value as any)}
                  className="w-full bg-[#060a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                >
                  <option value="subject">Subject (e.g. Computer Science, Chemistry)</option>
                  <option value="chapter">Chapter (e.g. Sorting, Acids &amp; Bases)</option>
                  <option value="algorithm">Algorithm / Interactive Lab</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Display Order Index</label>
                <input
                  type="number"
                  value={orderIndex}
                  onChange={(e) => setOrderIndex(Number(e.target.value))}
                  className="w-full bg-[#060a12] border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Lesson Code & Design Configuration (If algorithm / lab) */}
            {type === "algorithm" && lesson && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Code className="text-cyan-400" size={16} />
                    Algorithm &amp; Simulation Design Configuration
                  </h3>

                  {/* Direct Code Upload Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 px-3 py-1.5 rounded-lg transition"
                  >
                    <FileCode2 size={14} /> Upload Code File (.js, .py)
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Entry Function Name</label>
                    <input
                      type="text"
                      value={lesson.entryFunctionName}
                      onChange={(e) => setLesson({ ...lesson, entryFunctionName: e.target.value })}
                      placeholder="e.g. bubbleSort"
                      className="w-full bg-[#060a12] border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Visual Theme</label>
                    <select
                      value={lesson.visualTheme}
                      onChange={(e) => setLesson({ ...lesson, visualTheme: e.target.value })}
                      className="w-full bg-[#060a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                    >
                      <option value="warehouse">Warehouse Conveyor &amp; Cargo Robot</option>
                      <option value="space">Space Orbital Slingshot</option>
                      <option value="chemistry">Chemistry Glassware &amp; Pouring</option>
                      <option value="physics">Physics Kinematics Cannon</option>
                    </select>
                  </div>
                </div>

                {/* Code Editor */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Default Implementation Code</label>
                  <textarea
                    value={lesson.defaultCode}
                    onChange={(e) => setLesson({ ...lesson, defaultCode: e.target.value })}
                    rows={10}
                    spellCheck={false}
                    className="w-full bg-[#060a12] border border-slate-800 rounded-xl p-3 font-mono text-xs leading-relaxed text-slate-200 outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Step Explanations Grid */}
                <div className="bg-[#090e17] border border-slate-800 rounded-2xl p-5 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Step Narrative Explanations (Templates support {"{a}"}, {"{b}"}, {"{v}"})
                  </h4>

                  <div className="grid sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 font-mono">Start of Step:</span>
                      <input
                        type="text"
                        value={lesson.explanationStart}
                        onChange={(e) => setLesson({ ...lesson, explanationStart: e.target.value })}
                        className="w-full mt-1 bg-[#060a12] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 font-mono">Compare (Greater):</span>
                      <input
                        type="text"
                        value={lesson.explanationCompareGreater}
                        onChange={(e) => setLesson({ ...lesson, explanationCompareGreater: e.target.value })}
                        className="w-full mt-1 bg-[#060a12] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 font-mono">Compare (Less / Equal):</span>
                      <input
                        type="text"
                        value={lesson.explanationCompareLess}
                        onChange={(e) => setLesson({ ...lesson, explanationCompareLess: e.target.value })}
                        className="w-full mt-1 bg-[#060a12] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 font-mono">On Swap:</span>
                      <input
                        type="text"
                        value={lesson.explanationSwap}
                        onChange={(e) => setLesson({ ...lesson, explanationSwap: e.target.value })}
                        className="w-full mt-1 bg-[#060a12] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 font-mono">Mark Sorted:</span>
                      <input
                        type="text"
                        value={lesson.explanationMarkSorted}
                        onChange={(e) => setLesson({ ...lesson, explanationMarkSorted: e.target.value })}
                        className="w-full mt-1 bg-[#060a12] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 font-mono">Sorting Done:</span>
                      <input
                        type="text"
                        value={lesson.explanationDone}
                        onChange={(e) => setLesson({ ...lesson, explanationDone: e.target.value })}
                        className="w-full mt-1 bg-[#060a12] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Live Preview in Admin Panel */}
                <div className="bg-[#090e17] border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Live Simulation Preview
                    </h4>
                    <span className="text-[10px] text-cyan-400 font-mono">REAL-TIME TRACER</span>
                  </div>

                  <LessonPreview
                    code={lesson.defaultCode}
                    entryFunctionName={lesson.entryFunctionName}
                    explanations={{
                      start: lesson.explanationStart,
                      compareGreater: lesson.explanationCompareGreater,
                      compareLess: lesson.explanationCompareLess,
                      swap: lesson.explanationSwap,
                      markSorted: lesson.explanationMarkSorted,
                      done: lesson.explanationDone,
                    }}
                    compact={true}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
            <Palette size={40} className="text-slate-700 mb-3" />
            <h3 className="text-sm font-semibold text-slate-400">Select a topic from the sidebar</h3>
            <p className="text-xs text-slate-600 mt-1 max-w-sm">
              Click any subject or chapter to view its configuration, upload code, or click "+ Add Root" to start a new subject track.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}