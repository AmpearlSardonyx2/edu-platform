"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, Shuffle, AlertCircle } from "lucide-react";

type StepAction = "start" | "compare" | "swap" | "mark_sorted" | "done";
interface Slot { id: number; value: number; }
interface TraceStep { action: StepAction; array: Slot[]; indices: number[]; }

export interface LessonExplanations {
  start: string;
  compareGreater: string;
  compareLess: string;
  swap: string;
  markSorted: string;
  done: string;
}

function createTracer(arrRef: number[]) {
  let idOrder = arrRef.map((_, i) => i);
  const snapshot = (): Slot[] => arrRef.map((value, i) => ({ id: idOrder[i], value }));
  const steps: TraceStep[] = [{ action: "start", array: snapshot(), indices: [] }];
  return {
    steps,
    compare(i: number, j: number) { steps.push({ action: "compare", array: snapshot(), indices: [i, j] }); },
    swap(i: number, j: number) {
      const tmp = idOrder[i]; idOrder[i] = idOrder[j]; idOrder[j] = tmp;
      steps.push({ action: "swap", array: snapshot(), indices: [i, j] });
    },
    markSorted(idx: number) { steps.push({ action: "mark_sorted", array: snapshot(), indices: [idx] }); },
  };
}

function runTrace(code: string, inputArray: number[], entryFn: string): { steps: TraceStep[]; error: string | null } {
  const arr = [...inputArray];
  try {
    const tracer = createTracer(arr);
    // eslint-disable-next-line no-new-func
    const fn = new Function(
      "arr",
      "trace",
      `"use strict";\n${code}\nif (typeof ${entryFn} !== "function") { throw new Error("Define a function named ${entryFn}(arr, trace)"); }\nreturn ${entryFn}(arr, trace);`
    );
    fn(arr, tracer);
    tracer.steps.push({ action: "done", array: tracer.steps[tracer.steps.length - 1].array, indices: [] });
    return { steps: tracer.steps, error: null };
  } catch (err: any) {
    return { steps: [{ action: "start", array: inputArray.map((v, i) => ({ id: i, value: v })), indices: [] }], error: err.message };
  }
}

function fillTemplate(tpl: string, vars: Record<string, string | number>) {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

function codeLineFor(action: StepAction): string {
  return { start: "// ready", compare: "if (arr[j] > arr[j + 1])", swap: "swap crates", mark_sorted: "// position locked in", done: "return arr;" }[action];
}

function explainStep(explanations: LessonExplanations, steps: TraceStep[], stepIndex: number): string {
  const current = steps[stepIndex];
  const prev = stepIndex > 0 ? steps[stepIndex - 1] : null;
  const valueAt = (arr: Slot[], pos: number) => arr[pos]?.value;

  switch (current.action) {
    case "start": return explanations.start;
    case "compare": {
      const [i, j] = current.indices;
      const a = valueAt(current.array, i), b = valueAt(current.array, j);
      return (a as number) > (b as number)
        ? fillTemplate(explanations.compareGreater, { a, b })
        : fillTemplate(explanations.compareLess, { a, b });
    }
    case "swap": {
      const [i, j] = current.indices;
      const before = prev?.array ?? current.array;
      return fillTemplate(explanations.swap, { a: valueAt(before, i), b: valueAt(before, j) });
    }
    case "mark_sorted": return fillTemplate(explanations.markSorted, { v: valueAt(current.array, current.indices[0]) });
    case "done": return explanations.done;
    default: return "";
  }
}

const STATE_COLORS: Record<string, string> = {
  compare: "#F59E0B",
  swap: "#F43F5E",
  sorted: "#10B981",
  default: "#64748B",
};

function crateGradient(state: "default" | "compare" | "swap" | "sorted") {
  return {
    default: "linear-gradient(180deg, #f59e0b 0%, #b45309 100%)",
    compare: "linear-gradient(180deg, #fde047 0%, #f59e0b 100%)",
    swap: "linear-gradient(180deg, #fb7185 0%, #e11d48 100%)",
    sorted: "linear-gradient(180deg, #34d399 0%, #059669 100%)",
  }[state];
}

// ============================================================
// LESSON PREVIEW — the shared visualization+controls engine.
// Takes code/entryFunctionName/explanations as plain props and
// re-traces automatically whenever they change (debounced), so
// this works identically whether it's driven by a student's live
// code edits on the public page, or an admin's form fields while
// building a lesson. This is the ONE place the "engine" logic
// lives — extend it here to add new visual themes later.
// ============================================================
export default function LessonPreview({
  code,
  entryFunctionName,
  explanations,
  compact = false,
}: {
  code: string;
  entryFunctionName: string;
  explanations: LessonExplanations;
  compact?: boolean;
}) {
  const [inputValue, setInputValue] = useState("5, 2, 8, 1, 9, 3");
  const [baseArray, setBaseArray] = useState<number[]>([5, 2, 8, 1, 9, 3]);
  const [steps, setSteps] = useState<TraceStep[]>(() => runTrace(code, [5, 2, 8, 1, 9, 3], entryFunctionName).steps);
  const [error, setError] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1200);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const barWidth = compact ? 46 : 60;
  const current = steps[stepIndex];
  const slideMs = Math.max(300, Math.min(speed - 100, 1000));

  const sortedPositions = useMemo(() => {
    const s = new Set<number>();
    for (let i = 0; i <= stepIndex; i++) if (steps[i].action === "mark_sorted") steps[i].indices.forEach((idx) => s.add(idx));
    return s;
  }, [stepIndex, steps]);

  const explanation = useMemo(() => explainStep(explanations, steps, stepIndex), [explanations, steps, stepIndex]);

  const executeAndReset = useCallback((codeToRun: string, arr: number[]) => {
    const result = runTrace(codeToRun, arr, entryFunctionName);
    setSteps(result.steps);
    setError(result.error);
    setStepIndex(0);
    setIsPlaying(false);
  }, [entryFunctionName]);

  // Live re-trace whenever the code/entry-fn/explanations props change
  // (i.e. an admin editing the form, or a student editing code elsewhere).
  // Debounced so it doesn't thrash on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => executeAndReset(code, baseArray), 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, entryFunctionName]);

  const [robotLeft, setRobotLeft] = useState(barWidth * 1.5);
  useEffect(() => {
    if ((current.action === "compare" || current.action === "swap") && current.indices.length === 2) {
      setRobotLeft(((current.indices[0] + current.indices[1] + 1) / 2) * barWidth);
    }
  }, [stepIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setStepIndex((prev) => {
          if (prev >= steps.length - 1) { setIsPlaying(false); return prev; }
          return prev + 1;
        });
      }, speed);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, speed, steps.length]);

  const handleApplyInput = () => {
    const parsed = inputValue.split(",").map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
    if (parsed.length >= 2 && parsed.length <= 10) { setBaseArray(parsed); executeAndReset(code, parsed); }
  };
  const handleShuffle = () => {
    const arr = Array.from({ length: 6 }, () => Math.floor(Math.random() * 30) + 1);
    setInputValue(arr.join(", ")); setBaseArray(arr); executeAndReset(code, arr);
  };

  const max = Math.max(...current.array.map((s) => s.value), 1);
  const totalWidth = current.array.length * barWidth;
  const progress = steps.length > 1 ? Math.round((stepIndex / (steps.length - 1)) * 100) : 0;
  const isScanning = current.action === "compare";
  const isSwapping = current.action === "swap";
  const eyeColor = isSwapping ? STATE_COLORS.swap : isScanning ? STATE_COLORS.compare : "#94A3B8";
  const borderAccent = isSwapping ? STATE_COLORS.swap : isScanning ? STATE_COLORS.compare : current.action === "mark_sorted" ? STATE_COLORS.sorted : STATE_COLORS.default;

  return (
    <div className={`flex flex-col gap-2 ${compact ? "" : "h-full min-h-0"}`}>
      <div
        className={`relative rounded-xl overflow-hidden border border-slate-800 ${compact ? "" : "flex-1 min-h-0"}`}
        style={{ background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)", height: compact ? 260 : undefined }}
      >
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        />

        <div className="relative h-full flex flex-col items-center justify-center gap-1 px-4">
          <div className="relative" style={{ width: totalWidth, height: 56 }}>
            <div className="absolute top-2 left-0 right-0 h-1.5 rounded-full bg-slate-600/80 shadow-inner" />
            <div className="absolute top-0 flex flex-col items-center" style={{ left: robotLeft, transform: "translateX(-50%)", transition: `left ${slideMs}ms cubic-bezier(0.45,0,0.2,1)` }}>
              <div className="w-3 h-3 rounded-full bg-slate-300 border border-slate-500 mt-0.5" />
              <div className="w-px bg-slate-500" style={{ height: 8 }} />
              <div className="relative w-9 h-7 bg-slate-700 rounded-lg flex items-center justify-center gap-1.5 shadow-md">
                <div className="w-1.5 h-1.5 rounded-full transition-colors duration-200" style={{ backgroundColor: eyeColor, boxShadow: isScanning || isSwapping ? `0 0 6px ${eyeColor}` : "none" }} />
                <div className="w-1.5 h-1.5 rounded-full transition-colors duration-200" style={{ backgroundColor: eyeColor, boxShadow: isScanning || isSwapping ? `0 0 6px ${eyeColor}` : "none" }} />
              </div>
            </div>
          </div>

          <div className="relative" style={{ width: totalWidth, height: 14 }}>
            {isScanning && current.indices.length === 2 && current.indices.map((idx) => (
              <div key={idx} className="absolute top-0 w-px scan-line" style={{ left: idx * barWidth + (barWidth - 8) / 2 + 4, height: 14, backgroundColor: STATE_COLORS.compare }} />
            ))}
          </div>

          <div className="relative" style={{ width: totalWidth, height: compact ? 110 : 150 }}>
            {current.array.map((slot, posIdx) => {
              const isSwapPos = current.action === "swap" && current.indices.includes(posIdx);
              const isComparePos = current.action === "compare" && current.indices.includes(posIdx);
              const isSorted = sortedPositions.has(posIdx);
              const state: "default" | "compare" | "swap" | "sorted" = isSorted ? "sorted" : isSwapPos ? "swap" : isComparePos ? "compare" : "default";
              const crateHeight = (compact ? 30 : 46) + (slot.value / max) * (compact ? 40 : 60);

              return (
                <div key={slot.id} className="absolute bottom-6 flex flex-col items-center" style={{ left: posIdx * barWidth, width: barWidth - 12, transition: `left ${slideMs}ms cubic-bezier(0.4,0,0.2,1)`, animation: isSwapPos ? `crateBounce ${slideMs}ms ease-in-out` : "none" }}>
                  {isSorted && <div className="mb-1 text-[9px] font-semibold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full whitespace-nowrap">✓</div>}
                  <div className="relative w-full rounded flex items-center justify-center text-white font-mono text-xs font-bold shadow-lg overflow-hidden" style={{ height: crateHeight, background: crateGradient(state), transition: "background 250ms ease" }}>
                    <div className="absolute top-[32%] left-0 right-0 h-[3px] bg-black/20" />
                    {slot.value}
                  </div>
                  <div className="mt-1 rounded-full bg-black/40 blur-[2px]" style={{ width: barWidth - 22, height: 4 }} />
                </div>
              );
            })}
            <div className="absolute bottom-0 left-0 right-0 h-2.5 rounded-full belt-stripes" />
          </div>
        </div>

        {current.action === "done" && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60">
            <div className="text-sm font-semibold text-emerald-400 bg-slate-900 px-3 py-1.5 rounded-xl shadow border border-emerald-500/40">🎉 Complete!</div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg px-3 py-2">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span className="font-mono">{error}</span>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex flex-col gap-1" style={{ borderLeft: `4px solid ${borderAccent}` }}>
        <code className="text-[10px] font-mono bg-slate-900 text-emerald-300 px-2 py-0.5 rounded w-fit">{codeLineFor(current.action)}</code>
        <p className="text-xs text-slate-700 leading-snug">{explanation}</p>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => setStepIndex((p) => Math.max(0, p - 1))} disabled={stepIndex === 0} className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition"><SkipBack size={14} /></button>
        <button onClick={() => { if (stepIndex >= steps.length - 1) setStepIndex(0); setIsPlaying((p) => !p); }} className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition">{isPlaying ? <Pause size={14} /> : <Play size={14} />}</button>
        <button onClick={() => setStepIndex((p) => Math.min(steps.length - 1, p + 1))} disabled={stepIndex === steps.length - 1} className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition"><SkipForward size={14} /></button>
        <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 transition-all duration-200" style={{ width: `${progress}%` }} /></div>
        <input type="range" min="300" max="2000" step="100" value={2300 - speed} onChange={(e) => setSpeed(2300 - Number(e.target.value))} className="w-16 accent-indigo-600" title="Speed" />
      </div>

      <div className="flex items-center gap-2">
        <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2 py-1 font-mono flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        <button onClick={handleApplyInput} className="text-xs px-2 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition">Apply</button>
        <button onClick={handleShuffle} className="text-xs px-2 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition flex items-center gap-1"><Shuffle size={12} />Random</button>
      </div>

      <style jsx global>{`
        @keyframes crateBounce { 0% { transform: translateY(0); } 40% { transform: translateY(-12px); } 100% { transform: translateY(0); } }
        @keyframes scanPulse { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }
        .scan-line { animation: scanPulse 0.6s ease-in-out infinite; }
        .belt-stripes { background-color: #334155; background-image: repeating-linear-gradient(90deg, #64748b 0px, #64748b 10px, transparent 10px, transparent 20px); background-size: 20px 100%; animation: beltMove 1.2s linear infinite; }
        @keyframes beltMove { from { background-position-x: 0; } to { background-position-x: -20px; } }
      `}</style>
    </div>
  );
}