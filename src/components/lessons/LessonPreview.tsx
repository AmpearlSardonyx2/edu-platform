"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, Shuffle, AlertCircle, Sparkles } from "lucide-react";

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

  const barWidth = compact ? 48 : 64;
  const current = steps[stepIndex] || steps[0];
  const slideMs = Math.max(250, Math.min(speed - 100, 750));

  const sortedPositions = useMemo(() => {
    const s = new Set<number>();
    for (let i = 0; i <= stepIndex; i++) {
      if (steps[i]?.action === "mark_sorted") steps[i].indices.forEach((idx) => s.add(idx));
    }
    return s;
  }, [stepIndex, steps]);

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
    if (parsed.length >= 2 && parsed.length <= 8) { 
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
  const isScanning = current.action === "compare";
  const isSwapping = current.action === "swap";

  // Speech bubble text
  let robotBubble = "Scanning crates...";
  if (current.action === "start") robotBubble = "Ready to sort crates!";
  else if (current.action === "compare" && current.indices.length === 2) {
    const valA = current.array[current.indices[0]]?.value;
    const valB = current.array[current.indices[1]]?.value;
    robotBubble = valA > valB ? `Comparing ${valA} and ${valB}: Swap needed!` : `Comparing ${valA} and ${valB}: No swap needed`;
  } else if (current.action === "swap") {
    robotBubble = `Swapping crates on conveyor!`;
  } else if (current.action === "mark_sorted") {
    robotBubble = `Crate locked in final position!`;
  } else if (current.action === "done") {
    robotBubble = `All crates sorted! Launch ready! 🚀`;
  }

  return (
    <div className={`flex flex-col justify-between gap-4 select-none ${compact ? "" : "h-full"}`}>
      
      {/* Top Header of Visualizer */}
      <div className="flex items-center justify-between px-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-wider uppercase text-slate-800 dark:text-slate-200">
            Visualization
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-mono text-xs font-bold text-indigo-600 dark:text-cyan-400 bg-indigo-50 dark:bg-cyan-950/60 px-2.5 py-0.5 rounded-lg border border-indigo-200 dark:border-cyan-800">
            PASS {current.pass || 1} &gt; STEP {stepIndex + 1}
          </span>

          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
            <span>Speed</span>
            <input 
              type="range" 
              min="200" 
              max="1800" 
              step="100" 
              value={2000 - speed} 
              onChange={(e) => setSpeed(2000 - Number(e.target.value))} 
              className="w-16 accent-indigo-600 dark:accent-cyan-400 cursor-pointer" 
            />
            <span className="font-mono text-[11px] w-7 text-right">
              {(1000 / speed).toFixed(1)}x
            </span>
          </div>
        </div>
      </div>

      {/* Futuristic 3D Conveyor Belt Arena matching visualizition.jpeg */}
      <div
        className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800/90 shadow-xl flex-1 flex flex-col justify-between p-6 transition-all duration-300"
        style={{
          background: "radial-gradient(ellipse at center, var(--card) 0%, var(--background) 100%)",
          minHeight: compact ? 260 : 340,
        }}
      >
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(#818cf8 1px, transparent 1px), linear-gradient(90deg, #818cf8 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Robot Speech Bubble */}
        <div className="relative z-20 flex justify-center">
          <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-cyan-500/50 rounded-full px-5 py-1.5 shadow-lg flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-cyan-300 font-mono backdrop-blur transition-all">
            <span className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-cyan-400 animate-pulse" />
            <span>{robotBubble}</span>
          </div>
        </div>

        {/* Conveyor Belt & Crates Arena */}
        <div className="relative mx-auto flex flex-col items-center justify-end my-4" style={{ width: totalWidth, height: 190 }}>
          
          {/* Animated 3D Robot Mascot along conveyor track */}
          <div 
            className="absolute top-2 z-20 flex flex-col items-center transition-all"
            style={{ 
              left: robotLeft, 
              transform: "translateX(-50%)", 
              transitionDuration: `${slideMs}ms`,
            }}
          >
            {/* Robot Head */}
            <div className="relative w-12 h-10 bg-slate-100 dark:bg-slate-800 border-2 border-indigo-400 dark:border-cyan-400 rounded-2xl flex items-center justify-center gap-2 shadow-md dark:shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <div 
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  isSwapping ? "bg-amber-500" : isScanning ? "bg-cyan-400" : "bg-slate-400"
                }`} 
              />
              <div 
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  isSwapping ? "bg-amber-500" : isScanning ? "bg-cyan-400" : "bg-slate-400"
                }`} 
              />
              {/* Antenna */}
              <div className="absolute -top-2 w-1 h-2 bg-slate-400 rounded-t" />
              <div className="absolute -top-3.5 w-2 h-2 bg-indigo-500 dark:bg-cyan-400 rounded-full animate-ping" />
            </div>

            {/* Scanning Light Cone */}
            {isScanning && (
              <div 
                className="w-20 h-16 bg-gradient-to-b from-indigo-500/20 dark:from-cyan-400/35 to-transparent pointer-events-none" 
                style={{ clipPath: "polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)" }} 
              />
            )}
          </div>

          {/* Cargo Crates on Belt */}
          <div className="absolute bottom-5 left-0 right-0 h-32 flex items-end">
            {current.array.map((slot, posIdx) => {
              const isSwapPos = current.action === "swap" && current.indices.includes(posIdx);
              const isComparePos = current.action === "compare" && current.indices.includes(posIdx);
              const isSorted = sortedPositions.has(posIdx);

              // Colors matching visualizition.jpeg and light theme design.jpeg
              let crateBg = "bg-gradient-to-b from-indigo-500 to-indigo-700 dark:from-slate-700 dark:to-slate-800 text-white";
              let crateBorder = "border-indigo-300 dark:border-slate-600";
              let glowStyle = "shadow-md";

              if (isComparePos) {
                // In visualizition.jpeg: one compared item is cyan, one is amber
                const isFirst = current.indices[0] === posIdx;
                if (isFirst) {
                  crateBg = "bg-gradient-to-b from-cyan-400 to-cyan-600 text-white";
                  crateBorder = "border-cyan-300";
                  glowStyle = "shadow-[0_0_20px_rgba(6,182,212,0.6)] scale-105";
                } else {
                  crateBg = "bg-gradient-to-b from-amber-400 to-amber-600 text-white";
                  crateBorder = "border-amber-300";
                  glowStyle = "shadow-[0_0_20px_rgba(245,158,11,0.6)] scale-105";
                }
              } else if (isSwapPos) {
                crateBg = "bg-gradient-to-b from-rose-500 to-rose-700 text-white animate-bounce";
                crateBorder = "border-rose-300";
                glowStyle = "shadow-[0_0_25px_rgba(244,63,94,0.6)]";
              } else if (isSorted) {
                crateBg = "bg-gradient-to-b from-emerald-500 to-emerald-700 text-white";
                crateBorder = "border-emerald-300";
                glowStyle = "shadow-[0_0_15px_rgba(16,185,129,0.5)]";
              }

              const crateHeight = Math.min(95, 48 + slot.value * 2.2);

              return (
                <div
                  key={slot.id}
                  className="absolute bottom-0 flex flex-col items-center transition-all duration-300"
                  style={{
                    left: posIdx * barWidth,
                    width: barWidth - 12,
                  }}
                >
                  {isSorted && (
                    <span className="mb-1 text-[10px] font-bold bg-emerald-500 text-white px-1.5 py-0.2 rounded-full shadow">
                      ✓
                    </span>
                  )}

                  {/* 3D Crate Body */}
                  <div
                    className={`relative w-full rounded-2xl flex items-center justify-center font-mono text-base font-black border-2 transition-all duration-200 ${crateBg} ${crateBorder} ${glowStyle}`}
                    style={{ height: crateHeight }}
                  >
                    {/* Metallic rivets */}
                    <span className="absolute top-1 left-1.5 w-1 h-1 rounded-full bg-white/40" />
                    <span className="absolute top-1 right-1.5 w-1 h-1 rounded-full bg-white/40" />
                    <span className="absolute bottom-1 left-1.5 w-1 h-1 rounded-full bg-white/40" />
                    <span className="absolute bottom-1 right-1.5 w-1 h-1 rounded-full bg-white/40" />
                    <span className="drop-shadow">{slot.value}</span>
                  </div>

                  {/* Floor Shadow */}
                  <div className="mt-1 rounded-full bg-slate-900/30 dark:bg-black/60 blur-[3px]" style={{ width: barWidth - 24, height: 4 }} />
                </div>
              );
            })}
          </div>

          {/* 3D Perspective Conveyor Belt matching mockup */}
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-slate-300 dark:bg-slate-800 rounded-lg border-t-2 border-slate-400 dark:border-slate-700 shadow-inner flex items-center justify-between px-3 overflow-hidden">
            <div className="w-full h-1 bg-slate-400 dark:bg-slate-600 rounded-full opacity-60" />
          </div>
        </div>

        {/* Playback Controls matching visualizition.jpeg */}
        <div className="relative z-20 flex items-center justify-center gap-6 pt-2">
          <button
            onClick={() => setStepIndex((p) => Math.max(0, p - 1))}
            disabled={stepIndex === 0}
            className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-30 transition shadow-sm"
            title="Previous Step"
          >
            <SkipBack size={16} />
          </button>

          {/* Big Floating Play/Pause Button with glowing gradient */}
          <button
            onClick={() => {
              if (stepIndex >= steps.length - 1) setStepIndex(0);
              setIsPlaying((p) => !p);
            }}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold transition shadow-lg shadow-indigo-500/30 flex items-center justify-center scale-105 active:scale-95"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
          </button>

          <button
            onClick={() => setStepIndex((p) => Math.min(steps.length - 1, p + 1))}
            disabled={stepIndex === steps.length - 1}
            className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-30 transition shadow-sm"
            title="Next Step"
          >
            <SkipForward size={16} />
          </button>
        </div>
      </div>

      {/* Bottom Custom Array Input Bar matching mockup */}
      <div className="flex items-center gap-3 bg-white dark:bg-[#090e17] border border-slate-200 dark:border-slate-800 p-2.5 rounded-2xl shadow-sm text-xs">
        <span className="font-mono text-slate-500 dark:text-slate-400 font-semibold pl-2">Input:</span>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="e.g. 5, 2, 8, 1, 9, 3"
          className="flex-1 bg-slate-50 dark:bg-[#060a12] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 font-mono text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500"
        />
        <button
          onClick={handleApplyInput}
          className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold transition"
        >
          Apply
        </button>
        <button
          onClick={handleShuffle}
          className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold transition flex items-center gap-1.5"
        >
          <Shuffle size={13} /> Random
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl p-3">
          <AlertCircle size={15} className="mt-0.5 shrink-0 text-rose-500" />
          <span className="font-mono">{error}</span>
        </div>
      )}
    </div>
  );
}