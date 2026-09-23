"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, Shuffle, AlertCircle, Sparkles, Volume2 } from "lucide-react";

type StepAction = "start" | "compare" | "swap" | "mark_sorted" | "done";
interface Slot { id: number; value: number; }
interface TraceStep { action: StepAction; array: Slot[]; indices: number[]; pass?: number; step?: number; }

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
  const steps: TraceStep[] = [{ action: "start", array: snapshot(), indices: [], pass: 1, step: 0 }];
  let currentPass = 1;
  let currentStep = 0;

  return {
    steps,
    setPass(p: number) { currentPass = p; currentStep = 0; },
    compare(i: number, j: number) { 
      currentStep++;
      steps.push({ action: "compare", array: snapshot(), indices: [i, j], pass: currentPass, step: currentStep }); 
    },
    swap(i: number, j: number) {
      const tmp = idOrder[i]; idOrder[i] = idOrder[j]; idOrder[j] = tmp;
      currentStep++;
      steps.push({ action: "swap", array: snapshot(), indices: [i, j], pass: currentPass, step: currentStep });
    },
    markSorted(idx: number) { 
      currentStep++;
      steps.push({ action: "mark_sorted", array: snapshot(), indices: [idx], pass: currentPass, step: currentStep }); 
    },
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
  const map: Record<StepAction, string> = { 
    start: "// Warehouse initialized — crates on conveyor", 
    compare: "if (arr[j] > arr[j + 1])", 
    swap: "let temp = arr[j]; arr[j] = arr[j+1]; arr[j+1] = temp;", 
    mark_sorted: "// Crate locked in final sorted position", 
    done: "return arr; // All crates sorted!" 
  };
  return map[action] || "";
}

function explainStep(explanations: LessonExplanations, steps: TraceStep[], stepIndex: number): string {
  const current = steps[stepIndex];
  if (!current) return "";
  const prev = stepIndex > 0 ? steps[stepIndex - 1] : null;
  const valueAt = (arr: Slot[], pos: number) => arr[pos]?.value;

  switch (current.action) {
    case "start": return explanations?.start || "The cargo robot is ready to inspect the crates.";
    case "compare": {
      const [i, j] = current.indices;
      const a = valueAt(current.array, i), b = valueAt(current.array, j);
      return (a as number) > (b as number)
        ? fillTemplate(explanations?.compareGreater || "Comparing {a} and {b}: {a} > {b}, swap needed!", { a, b })
        : fillTemplate(explanations?.compareLess || "Comparing {a} and {b}: already in order, no swap needed.", { a, b });
    }
    case "swap": {
      const [i, j] = current.indices;
      const before = prev?.array ?? current.array;
      return fillTemplate(explanations?.swap || "Swapping crates {a} and {b} on the belt!", { a: valueAt(before, i), b: valueAt(before, j) });
    }
    case "mark_sorted": return fillTemplate(explanations?.markSorted || "Crate {v} locked in its final spot.", { v: valueAt(current.array, current.indices[0]) });
    case "done": return explanations?.done || "All crates are fully sorted! Ready for launch sequence.";
    default: return "";
  }
}

function crateGradient(state: "default" | "compare" | "swap" | "sorted") {
  return {
    default: "linear-gradient(180deg, #4338ca 0%, #312e81 100%)", // sleek sci-fi purple
    compare: "linear-gradient(180deg, #0ea5e9 0%, #0369a1 100%)", // glowing cyan
    swap: "linear-gradient(180deg, #f59e0b 0%, #b45309 100%)", // amber warning swap
    sorted: "linear-gradient(180deg, #10b981 0%, #047857 100%)", // emerald sorted
  }[state];
}

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
  const [speed, setSpeed] = useState(1000);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const barWidth = compact ? 44 : 58;
  const current = steps[stepIndex] || steps[0];
  const slideMs = Math.max(250, Math.min(speed - 100, 800));

  const sortedPositions = useMemo(() => {
    const s = new Set<number>();
    for (let i = 0; i <= stepIndex; i++) {
      if (steps[i]?.action === "mark_sorted") steps[i].indices.forEach((idx) => s.add(idx));
    }
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

  useEffect(() => {
    const t = setTimeout(() => executeAndReset(code, baseArray), 400);
    return () => clearTimeout(t);
  }, [code, entryFunctionName]); // eslint-disable-line react-hooks/exhaustive-deps

  const [robotLeft, setRobotLeft] = useState(barWidth * 1.5);
  useEffect(() => {
    if (current && (current.action === "compare" || current.action === "swap") && current.indices.length === 2) {
      setRobotLeft(((current.indices[0] + current.indices[1] + 1) / 2) * barWidth);
    }
  }, [stepIndex, current, barWidth]);

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
    if (parsed.length >= 2 && parsed.length <= 10) { 
      setBaseArray(parsed); 
      executeAndReset(code, parsed); 
    }
  };

  const handleShuffle = () => {
    const arr = Array.from({ length: 6 }, () => Math.floor(Math.random() * 25) + 1);
    setInputValue(arr.join(", ")); 
    setBaseArray(arr); 
    executeAndReset(code, arr);
  };

  const totalWidth = current.array.length * barWidth;
  const progress = steps.length > 1 ? Math.round((stepIndex / (steps.length - 1)) * 100) : 0;
  const isScanning = current.action === "compare";
  const isSwapping = current.action === "swap";

  // Speech bubble text for the robot
  let robotBubble = "Scanning crates...";
  if (current.action === "start") robotBubble = "Ready to sort!";
  else if (current.action === "compare" && current.indices.length === 2) {
    const valA = current.array[current.indices[0]]?.value;
    const valB = current.array[current.indices[1]]?.value;
    robotBubble = valA > valB ? `Comparing ${valA} & ${valB}: Swap needed!` : `Comparing ${valA} & ${valB}: No swap`;
  } else if (current.action === "swap") {
    robotBubble = `Swapping crates!`;
  } else if (current.action === "mark_sorted") {
    robotBubble = `Locked in position!`;
  } else if (current.action === "done") {
    robotBubble = `Sorting complete! 🎉`;
  }

  return (
    <div className={`flex flex-col gap-3.5 select-none ${compact ? "" : "h-full"}`}>
      {/* Top Telemetry Bar inside Visualizer */}
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-cyan-400 font-bold bg-cyan-950/60 px-2.5 py-0.5 rounded border border-cyan-800">
            PASS {current.pass || 1} &gt; STEP {stepIndex + 1}
          </span>
          <span className="text-slate-400 font-mono text-[11px]">
            ({stepIndex + 1} / {steps.length})
          </span>
        </div>

        {/* Speed Slider */}
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <span>Speed</span>
          <input 
            type="range" 
            min="200" 
            max="1800" 
            step="100" 
            value={2000 - speed} 
            onChange={(e) => setSpeed(2000 - Number(e.target.value))} 
            className="w-20 accent-cyan-400 cursor-pointer" 
          />
          <span className="font-mono text-slate-300 w-8 text-right">
            {(1000 / speed).toFixed(1)}x
          </span>
        </div>
      </div>

      {/* Futuristic Conveyor Belt Apparatus Viewport */}
      <div
        className="relative rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl flex flex-col justify-end p-6"
        style={{
          background: "radial-gradient(ellipse at center, #0f172a 0%, #070b14 100%)",
          minHeight: compact ? 260 : 340,
        }}
      >
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{ backgroundImage: "linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)", backgroundSize: "32px 32px" }}
        />

        {/* Robot Speech Bubble */}
        <div 
          className="absolute top-6 left-1/2 -translate-x-1/2 z-20 bg-slate-900/90 border border-cyan-500/50 rounded-full px-4 py-1.5 shadow-[0_0_15px_rgba(6,182,212,0.25)] flex items-center gap-2 text-xs text-cyan-300 font-mono backdrop-blur transition-all"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>{robotBubble}</span>
        </div>

        {/* Conveyor Belt & Crates Arena */}
        <div className="relative mx-auto flex flex-col items-center" style={{ width: totalWidth, height: 180 }}>
          
          {/* Animated Robot on Overhead Track */}
          <div 
            className="absolute top-0 z-20 flex flex-col items-center" 
            style={{ 
              left: robotLeft, 
              transform: "translateX(-50%)", 
              transition: `left ${slideMs}ms cubic-bezier(0.45,0,0.2,1)` 
            }}
          >
            {/* Robot Head with glowing eyes */}
            <div className="relative w-10 h-9 bg-slate-800 border border-slate-600 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
              <div 
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  isSwapping ? "bg-amber-400 shadow-[0_0_6px_#f59e0b]" : isScanning ? "bg-cyan-400 shadow-[0_0_6px_#06b6d4]" : "bg-slate-400"
                }`} 
              />
              <div 
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  isSwapping ? "bg-amber-400 shadow-[0_0_6px_#f59e0b]" : isScanning ? "bg-cyan-400 shadow-[0_0_6px_#06b6d4]" : "bg-slate-400"
                }`} 
              />
              {/* Antenna */}
              <div className="absolute -top-2 w-1 h-2 bg-slate-500 rounded-t" />
              <div className="absolute -top-3 w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
            </div>

            {/* Scanning Light Cone */}
            {isScanning && (
              <div 
                className="w-16 h-14 bg-gradient-to-b from-cyan-400/40 to-transparent pointer-events-none" 
                style={{ clipPath: "polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)" }} 
              />
            )}
          </div>

          {/* Cargo Crates on Belt */}
          <div className="absolute bottom-6 left-0 right-0 h-28 flex items-end">
            {current.array.map((slot, posIdx) => {
              const isSwapPos = current.action === "swap" && current.indices.includes(posIdx);
              const isComparePos = current.action === "compare" && current.indices.includes(posIdx);
              const isSorted = sortedPositions.has(posIdx);
              const state = isSorted ? "sorted" : isSwapPos ? "swap" : isComparePos ? "compare" : "default";
              const crateHeight = Math.min(90, 48 + slot.value * 2.2);

              return (
                <div
                  key={slot.id}
                  className="absolute bottom-0 flex flex-col items-center"
                  style={{
                    left: posIdx * barWidth,
                    width: barWidth - 10,
                    transition: `left ${slideMs}ms cubic-bezier(0.4,0,0.2,1)`,
                  }}
                >
                  {/* Sorted sticker */}
                  {isSorted && (
                    <span className="mb-1 text-[9px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 px-1.5 py-0.2 rounded-full">
                      ✓
                    </span>
                  )}

                  {/* 3D Sci-Fi Cargo Crate */}
                  <div
                    className="relative w-full rounded-xl flex items-center justify-center text-white font-mono text-sm font-bold shadow-xl border border-white/20 overflow-hidden"
                    style={{
                      height: crateHeight,
                      background: crateGradient(state),
                      transition: "background 250ms ease",
                      boxShadow: isComparePos 
                        ? "0 0 15px rgba(14,165,233,0.5)" 
                        : isSwapPos 
                        ? "0 0 15px rgba(245,158,11,0.5)" 
                        : isSorted 
                        ? "0 0 15px rgba(16,185,129,0.4)" 
                        : "0 4px 10px rgba(0,0,0,0.5)",
                    }}
                  >
                    {/* Metal cargo rivets detail */}
                    <div className="absolute top-1.5 left-1.5 w-1 h-1 rounded-full bg-white/40" />
                    <div className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full bg-white/40" />
                    <div className="absolute bottom-1.5 left-1.5 w-1 h-1 rounded-full bg-white/40" />
                    <div className="absolute bottom-1.5 right-1.5 w-1 h-1 rounded-full bg-white/40" />
                    <span className="drop-shadow-md text-base">{slot.value}</span>
                  </div>

                  {/* Floor Shadow */}
                  <div className="mt-1.5 rounded-full bg-black/60 blur-[3px]" style={{ width: barWidth - 20, height: 4 }} />
                </div>
              );
            })}
          </div>

          {/* Industrial Conveyor Belt */}
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-slate-800 rounded-lg border-t border-slate-700 shadow-inner flex items-center justify-between px-2 overflow-hidden">
            <div className="w-full h-1 bg-slate-700/50 rounded-full" />
          </div>
        </div>

        {/* Completion Celebration Overlay */}
        {current.action === "done" && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm z-30 animate-fade-in">
            <div className="text-center p-4 bg-slate-900 border border-emerald-500/60 rounded-2xl shadow-2xl">
              <span className="text-2xl">🎉</span>
              <h4 className="text-base font-bold text-white mt-1">Cargo Sorted & Locked!</h4>
              <p className="text-xs text-slate-400 mt-0.5">All crates reached their final positions.</p>
            </div>
          </div>
        )}
      </div>

      {/* Code line & robot explanation card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-1.5">
        <code className="text-xs font-mono text-cyan-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800/80 w-fit">
          {codeLineFor(current.action)}
        </code>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">{explanation}</p>
      </div>

      {/* Playback Controls & Progress Bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setStepIndex((p) => Math.max(0, p - 1))}
          disabled={stepIndex === 0}
          className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition"
          title="Previous Step"
        >
          <SkipBack size={15} />
        </button>

        <button
          onClick={() => {
            if (stepIndex >= steps.length - 1) setStepIndex(0);
            setIsPlaying((p) => !p);
          }}
          className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold transition shadow-lg shadow-cyan-500/20"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
        </button>

        <button
          onClick={() => setStepIndex((p) => Math.min(steps.length - 1, p + 1))}
          disabled={stepIndex === steps.length - 1}
          className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition"
          title="Next Step"
        >
          <SkipForward size={15} />
        </button>

        {/* Step Progress Line */}
        <div className="flex-1 h-2 bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Custom Array Input Bar */}
      <div className="flex items-center gap-2 pt-1">
        <span className="text-xs text-slate-400 font-mono">Input:</span>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="e.g. 5, 2, 8, 1, 9, 3"
          className="text-xs border border-slate-800 bg-slate-900 rounded-lg px-3 py-1.5 font-mono text-slate-200 flex-1 focus:outline-none focus:ring-1 focus:ring-cyan-400"
        />
        <button
          onClick={handleApplyInput}
          className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
        >
          Apply
        </button>
        <button
          onClick={handleShuffle}
          className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 transition flex items-center gap-1.5"
        >
          <Shuffle size={12} /> Random
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-rose-950/40 border border-rose-800 text-rose-300 text-xs rounded-lg px-3 py-2">
          <AlertCircle size={14} className="mt-0.5 shrink-0 text-rose-400" />
          <span className="font-mono">{error}</span>
        </div>
      )}
    </div>
  );
}