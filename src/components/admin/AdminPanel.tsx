"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Save, ChevronRight, ChevronDown, Loader2 } from "lucide-react";
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
  entryFunctionName: "",
  defaultCode: "",
  visualTheme: "warehouse",
  explanationStart: "",
  explanationCompareGreater: "",
  explanationCompareLess: "",
  explanationSwap: "",
  explanationMarkSorted: "",
  explanationDone: "",
};

function TreeRow({ node, nodes, depth, selectedId, onSelect, onAddChild }: {
  node: AdminNode; nodes: AdminNode[]; depth: number; selectedId: string | null;
  onSelect: (n: AdminNode) => void; onAddChild: (parent: AdminNode) => void;
}) {
  const children = nodes.filter((n) => n.parentId === node.id).sort((a, b) => a.orderIndex - b.orderIndex);
  const [open, setOpen] = useState(true);

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 py-1.5 px-2 rounded-lg text-sm cursor-pointer ${selectedId === node.id ? "bg-indigo-50 text-indigo-700" : "hover:bg-slate-50"}`}
        style={{ paddingLeft: depth * 16 + 8 }}
      >
        {children.length > 0 ? (
          <button onClick={() => setOpen((o) => !o)} className="text-slate-400">
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : <span className="w-3.5" />}

        <span onClick={() => onSelect(node)} className="flex-1 truncate">{node.title}</span>
        <span className="text-[10px] uppercase text-slate-400">{node.type}</span>

        {node.type !== "algorithm" && (
          <button onClick={() => onAddChild(node)} title="Add child" className="text-slate-400 hover:text-indigo-600 p-0.5">
            <Plus size={13} />
          </button>
        )}
      </div>

      {open && children.map((c) => (
        <TreeRow key={c.id} node={c} nodes={nodes} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} onAddChild={onAddChild} />
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

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/nodes")
      .then((r) => r.json())
      .then((data) => setNodes(data.nodes ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const roots = nodes.filter((n) => !n.parentId);

  const resetForm = () => {
    setTitle(""); setSlug(""); setType("chapter"); setParentId(""); setOrderIndex(1); setLesson(null);
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
    if ((parent.type === "subject" ? "chapter" : "algorithm") === "algorithm") setLesson({ ...BLANK_LESSON });
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

  const handleSave = async () => {
    if (!title.trim() || !slug.trim()) { alert("Title and slug are required"); return; }
    setSaving(true);
    const payload = { title, slug, type, parentId: parentId || null, orderIndex, lesson };

    try {
      const res = isNew
        ? await fetch("/api/admin/nodes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        : await fetch(`/api/admin/nodes/${selected!.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

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
    <div className="grid grid-cols-[280px_1fr] h-full">
      {/* LEFT: tree */}
      <div className="border-r border-slate-200 bg-white flex flex-col">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-800">Content</span>
          <button onClick={startAddRoot} className="text-xs px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center gap-1">
            <Plus size={12} /> Subject
          </button>
        </div>
        <div className="flex-1 overflow-auto p-2">
          {loading ? (
            <div className="text-xs text-slate-400 flex items-center gap-1.5 p-2"><Loader2 size={12} className="animate-spin" /> Loading...</div>
          ) : (
            roots.map((n) => (
              <TreeRow key={n.id} node={n} nodes={nodes} depth={0} selectedId={selected?.id ?? null} onSelect={selectNode} onAddChild={startAddChild} />
            ))
          )}
        </div>
      </div>

      {/* RIGHT: editor */}
      <div className="overflow-auto p-6">
        {!showForm ? (
          <div className="h-full flex items-center justify-center text-sm text-slate-400">
            Select a node to edit, or add a new one from the tree.
          </div>
        ) : (
          <div className="max-w-2xl space-y-5">
            <h2 className="text-lg font-semibold text-slate-800">{isNew ? "New Node" : `Edit: ${selected?.title}`}</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500">Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Slug</label>
                <input value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Type</label>
                <select value={type} onChange={(e) => handleTypeChange(e.target.value as any)} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                  <option value="subject">Subject</option>
                  <option value="chapter">Chapter</option>
                  <option value="algorithm">Algorithm</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Order</label>
                <input type="number" value={orderIndex} onChange={(e) => setOrderIndex(Number(e.target.value))} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-slate-500">Parent</label>
                <select value={parentId} onChange={(e) => setParentId(e.target.value)} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                  <option value="">— None (top-level) —</option>
                  {nodes.filter((n) => n.id !== selected?.id).map((n) => (
                    <option key={n.id} value={n.id}>{n.title} ({n.type})</option>
                  ))}
                </select>
              </div>
            </div>

            {type === "algorithm" && lesson && (
              <div className="space-y-4 border-t border-slate-200 pt-4">
                <h3 className="text-sm font-semibold text-slate-700">Lesson content</h3>

                <div>
                  <label className="text-xs font-medium text-slate-500">Entry function name (must match the function your code defines)</label>
                  <input value={lesson.entryFunctionName} onChange={(e) => setLesson({ ...lesson, entryFunctionName: e.target.value })} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono" />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500">Visual theme</label>
                  <select
                    value={lesson.visualTheme}
                    onChange={(e) => setLesson({ ...lesson, visualTheme: e.target.value })}
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="warehouse">Warehouse Robot (crates on a belt)</option>
                    <option value="bars">Simple Bars</option>
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Only "Warehouse Robot" is wired up in the preview right now — "Simple Bars" will render as warehouse until that theme is built.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500">Default code</label>
                  <textarea value={lesson.defaultCode} onChange={(e) => setLesson({ ...lesson, defaultCode: e.target.value })} rows={12} spellCheck={false} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono bg-slate-900 text-slate-200" />
                </div>

                <p className="text-xs text-slate-400">Use <code>{"{a}"}</code>, <code>{"{b}"}</code>, <code>{"{v}"}</code> as placeholders for live values in the explanations below.</p>

                {[
                  ["explanationStart", "Start"],
                  ["explanationCompareGreater", "Compare — out of order"],
                  ["explanationCompareLess", "Compare — already in order"],
                  ["explanationSwap", "Swap"],
                  ["explanationMarkSorted", "Mark sorted"],
                  ["explanationDone", "Done"],
                ].map(([key, label]) => (
                  <div key={key}>
                    <label className="text-xs font-medium text-slate-500">{label}</label>
                    <textarea
                      value={(lesson as any)[key]}
                      onChange={(e) => setLesson({ ...lesson, [key]: e.target.value })}
                      rows={2}
                      className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-xs"
                    />
                  </div>
                ))}

                <div className="border-t border-slate-200 pt-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Live preview</h3>
                  <p className="text-xs text-slate-400 mb-3">Updates automatically ~0.5s after you stop typing above.</p>
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
                    compact
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition">
                <Save size={14} /> {saving ? "Saving..." : "Save"}
              </button>
              {!isNew && (
                <button onClick={handleDelete} className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition">
                  <Trash2 size={14} /> Delete
                </button>
              )}
              <button onClick={() => { setSelected(null); setIsNew(false); resetForm(); }} className="text-sm px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}