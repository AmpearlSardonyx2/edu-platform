"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Lightbulb, Play, RotateCcw, CheckCircle2, 
  HelpCircle, Sparkles, BookOpen, Layers, Maximize2, Moon
} from "lucide-react";
import LessonPreview, { LessonExplanations } from "./LessonPreview";

interface FetchedLesson {
  slug: string;
  title: string;
  entryFunctionName: string;
  defaultCode: string;
  explanations: LessonExplanations;
}

const MULTI_LANG_CODES: Record<string, string> = {
  javascript: `function bubbleSort(arr, trace) {
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
  python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`,
  cpp: `void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
            }
        }
    }
}`,
  java: `public static void bubbleSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}`,
  go: `func bubbleSort(arr []int) []int {
    n := len(arr)
    for i := 0; i < n-1; i++ {
        for j := 0; j < n-i-1; j++ {
            if arr[j] > arr[j+1] {
                arr[j], arr[j+1] = arr[j+1], arr[j]
            }
        }
    }
    return arr
}`,
};

export default function AlgorithmLesson({ slug }: { slug: string }) {
  const router = useRouter();
  const [lesson, setLesson] = useState<FetchedLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [activeLang, setActiveLang] = useState<"javascript" | "python" | "cpp" | "java" | "go">("javascript");
  const [activeTab, setActiveTab] = useState<"code" | "explanation">("code");
  const [showHint, setShowHint] = useState(false);
  const [showStepsDrawer, setShowStepsDrawer] = useState(false);

  // Quick Quiz State
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizChecked, setQuizChecked] = useState(false);

  // Try it yourself custom input state
  const [tryInput, setTryInput] = useState("4, 1, 3, 2");
  const [trySuccess, setTrySuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/lessons/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.lesson) {
          setLesson(data.lesson);
          setCode(data.lesson.defaultCode);
        } else {
          // Fallback demo for bubble-sort if database not yet migrated
          setLesson({
            slug: "bubble-sort",
            title: "Bubble Sort",
            entryFunctionName: "bubbleSort",
            defaultCode: MULTI_LANG_CODES.javascript,
            explanations: {
              start: "The crates just arrived on the belt. The robot will inspect adjacent pairs and swap if heavier crate is before lighter.",
              compareGreater: "Robot scans crates {a} and {b}: {a} > {b}, so they need to swap!",
              compareLess: "Robot scans crates {a} and {b}: already in order, moving forward.",
              swap: "Swapping crates {a} and {b} on the belt!",
              markSorted: "Crate {v} locked in its sorted final location.",
              done: "All crates sorted successfully! Ready for rocket launch.",
            },
          });
          setCode(MULTI_LANG_CODES.javascript);
        }
      })
      .catch(() => {
        // Fallback demo
        setLesson({
          slug: "bubble-sort",
          title: "Bubble Sort",
          entryFunctionName: "bubbleSort",
          defaultCode: MULTI_LANG_CODES.javascript,
          explanations: {
            start: "The crates just arrived on the belt. The robot will inspect adjacent pairs and swap.",
            compareGreater: "Comparing {a} and {b}: {a} > {b}, swap needed.",
            compareLess: "Comparing {a} and {b}: already sorted.",
            swap: "Swapping crates {a} and {b}.",
            markSorted: "Crate {v} locked in place.",
            done: "Sorting complete!",
          },
        });
        setCode(MULTI_LANG_CODES.javascript);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleBack = () => router.push(`/learn?from=${slug}`);
  const handleResetCode = () => {
    if (activeLang === "javascript" && lesson) {
      setCode(lesson.defaultCode);
    } else {
      setCode(MULTI_LANG_CODES[activeLang]);
    }
  };

  const handleLangChange = (lang: "javascript" | "python" | "cpp" | "java" | "go") => {
    setActiveLang(lang);
    setCode(MULTI_LANG_CODES[lang]);
  };

  const handleQuizCheck = () => {
    setQuizChecked(true);
  };

  const handleTryVerify = () => {
    setTrySuccess(true);
    setTimeout(() => setTrySuccess(false), 3000);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#070b14]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          <p className="text-slate-400 text-xs font-mono">Initializing Algorithm Station...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#070b14]">
        <p className="text-slate-500 text-sm">Lesson not configured yet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100 font-sans select-none">
      {/* Top Bar matching visualizition.jpeg */}
      <header className="h-14 border-b border-slate-800 bg-[#090e17] px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBack} 
            className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-cyan-400 transition"
          >
            <ArrowLeft size={16} /> Back to Learn
          </button>
          <div className="h-4 w-px bg-slate-800" />
          <h1 className="text-sm font-bold text-white tracking-wide uppercase">{lesson.title}</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHint((p) => !p)}
            className="flex items-center gap-1.5 text-xs text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/80 px-3 py-1.5 rounded-lg transition"
          >
            <Lightbulb size={14} /> Hint
          </button>
          <button
            onClick={() => setShowStepsDrawer(true)}
            className="flex items-center gap-1.5 text-xs text-indigo-300 bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-800/80 px-3 py-1.5 rounded-lg transition"
          >
            <Layers size={14} /> 15-Step Flow
          </button>
        </div>
      </header>

      {/* Telemetry Bar (Difficulty, Est Time, XP, Mission) */}
      <div className="border-b border-slate-800/80 bg-[#080d16] px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-slate-400">Difficulty:</span>
            <span className="font-semibold text-emerald-400">Easy</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-slate-400">Estimated Time:</span>
            <span className="font-semibold text-slate-200 font-mono">15 min</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <Sparkles size={13} className="text-amber-400" />
            <span className="text-slate-400">XP Reward:</span>
            <span className="font-semibold text-amber-400 font-mono">+150 XP</span>
          </div>
        </div>

        {/* Mission Banner */}
        <div className="flex items-center gap-3 bg-indigo-950/30 border border-indigo-900/50 rounded-xl px-4 py-2 text-xs">
          <span className="text-indigo-400 font-mono font-bold uppercase tracking-wider">Mission:</span>
          <span className="text-slate-300">
            The robot has 6 cargo crates. Help it arrange them in the correct order before launch.
          </span>
        </div>
      </div>

      {/* Main 2-Column Workspace */}
      <div className="flex-1 p-5 grid lg:grid-cols-12 gap-5 max-w-[1600px] w-full mx-auto">
        
        {/* Left Column: Code Editor & Analogy Widgets (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          
          {/* Code Container */}
          <div className="bg-[#090e17] border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
            
            {/* Code Header Bar with Language Selector */}
            <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between bg-[#0a101b]">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("code")}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-md transition ${activeTab === "code" ? "text-cyan-400 bg-cyan-950/60 border border-cyan-800" : "text-slate-400 hover:text-slate-200"}`}
                >
                  Code
                </button>
                <button
                  onClick={() => setActiveTab("explanation")}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-md transition ${activeTab === "explanation" ? "text-cyan-400 bg-cyan-950/60 border border-cyan-800" : "text-slate-400 hover:text-slate-200"}`}
                >
                  Explanation
                </button>
              </div>

              {/* Language Pills */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
                {(["javascript", "python", "cpp", "java", "go"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLangChange(lang)}
                    className={`px-2 py-0.5 rounded capitalize transition ${activeLang === lang ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40" : "text-slate-400 hover:text-slate-200"}`}
                  >
                    {lang === "cpp" ? "C++" : lang === "javascript" ? "JS" : lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Body */}
            {activeTab === "code" ? (
              <div className="p-3 bg-[#060a12] flex flex-col">
                <div className="flex font-mono text-xs leading-relaxed overflow-x-auto min-h-[220px]">
                  {/* Line numbers */}
                  <div className="pr-3 text-right select-none text-slate-600 border-r border-slate-800/80">
                    {code.split("\n").map((_, i) => (
                      <div key={i} className="h-6">{i + 1}</div>
                    ))}
                  </div>
                  {/* Editable Code */}
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    spellCheck={false}
                    className="flex-1 bg-transparent text-slate-200 outline-none resize-none pl-3 font-mono text-xs leading-6 min-h-[220px]"
                  />
                </div>
              </div>
            ) : (
              <div className="p-5 bg-[#060a12] text-xs text-slate-300 space-y-3 leading-relaxed min-h-[220px]">
                <h4 className="font-bold text-white text-sm">How Bubble Sort Works (Line-by-Line)</h4>
                <p>1. <span className="text-cyan-400 font-mono">Outer Loop (i)</span>: Runs $n - 1$ times. With each complete pass, the largest remaining unsorted element "bubbles" up to its correct final index at the end of the array.</p>
                <p>2. <span className="text-cyan-400 font-mono">Inner Loop (j)</span>: Compares adjacent pairs (<span className="font-mono text-amber-300">arr[j]</span> and <span className="font-mono text-amber-300">arr[j+1]</span>). If the left crate is heavier than the right crate, they trade places.</p>
                <p>3. <span className="text-cyan-400 font-mono">Optimization</span>: We stop at <span className="font-mono text-emerald-400">n - i - 1</span> because the last $i$ elements are already guaranteed to be in their final sorted spots.</p>
              </div>
            )}

            {/* Code Controls Footer */}
            <div className="px-4 py-2.5 border-t border-slate-800 bg-[#0a101b] flex items-center justify-between">
              <button
                onClick={handleResetCode}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition"
              >
                <RotateCcw size={13} /> Reset Code
              </button>

              <button
                onClick={() => {}}
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs px-4 py-1.5 rounded-lg shadow-md transition"
              >
                <Play size={13} fill="currentColor" /> Run Code
              </button>
            </div>
          </div>

          {/* Bottom 4-Card Widgets matching visualizition.jpeg */}
          <div className="grid sm:grid-cols-2 gap-3.5">
            {/* Concept Analogy Card */}
            <div className="bg-[#090e17] border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <Lightbulb size={15} /> Concept Analogy
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Think of bubbles rising in soda: heavier liquid pushes the air bubbles to the surface. Bubble Sort repeatedly compares two neighbors and pushes the largest value to the end.
              </p>
            </div>

            {/* Walkthrough Trace Card */}
            <div className="bg-[#090e17] border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="text-xs font-bold text-indigo-400">Pass 1 Walkthrough</div>
              <div className="space-y-1 text-[11px] font-mono text-slate-300">
                <div className="flex justify-between"><span>Compare 5 & 2:</span><span className="text-amber-400">5 &gt; 2 (Swap)</span></div>
                <div className="flex justify-between"><span>Compare 5 & 8:</span><span className="text-emerald-400">5 &lt; 8 (Keep)</span></div>
                <div className="flex justify-between"><span>Compare 8 & 1:</span><span className="text-amber-400">8 &gt; 1 (Swap)</span></div>
                <div className="flex justify-between"><span>Compare 8 & 9:</span><span className="text-emerald-400">8 &lt; 9 (Keep)</span></div>
              </div>
            </div>

            {/* Try It Yourself Card */}
            <div className="bg-[#090e17] border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="text-xs font-bold text-cyan-400">Try It Yourself</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tryInput}
                  onChange={(e) => setTryInput(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-200 flex-1"
                />
                <button
                  onClick={handleTryVerify}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-3 py-1 rounded-lg font-semibold transition"
                >
                  Apply
                </button>
              </div>
              {trySuccess && (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Array loaded into conveyor visualizer!
                </span>
              )}
            </div>

            {/* Quick Quiz Card */}
            <div className="bg-[#090e17] border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="text-xs font-bold text-pink-400">Quick Check Quiz</div>
              <p className="text-[11px] text-slate-300">What happens at the end of each complete pass?</p>
              <div className="space-y-1 text-[11px]">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="radio"
                    name="quick-quiz"
                    checked={quizSelected === 1}
                    onChange={() => setQuizSelected(1)}
                    className="accent-pink-500"
                  />
                  <span>Largest unsorted element moves to end</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="radio"
                    name="quick-quiz"
                    checked={quizSelected === 2}
                    onChange={() => setQuizSelected(2)}
                    className="accent-pink-500"
                  />
                  <span>Smallest element is deleted</span>
                </label>
              </div>
              <button
                onClick={handleQuizCheck}
                className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                Check Answer
              </button>
              {quizChecked && (
                <div className={`text-[11px] ${quizSelected === 1 ? "text-emerald-400" : "text-rose-400"}`}>
                  {quizSelected === 1 ? "✓ Correct! It bubbles up to the end." : "✗ Incorrect, try again."}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Visualization Viewport (6 cols) */}
        <div className="lg:col-span-6 flex flex-col">
          <div className="bg-[#090e17] border border-slate-800 rounded-2xl p-4 shadow-xl flex-1 flex flex-col">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Visualization Arena
            </h3>
            <LessonPreview
              code={code}
              entryFunctionName={lesson.entryFunctionName}
              explanations={lesson.explanations}
            />
          </div>
        </div>
      </div>

      {/* 15-Step Progression Drawer / Modal */}
      {showStepsDrawer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#090e17] border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="text-indigo-400" size={18} />
                <h3 className="text-base font-bold text-white">15-Step Mission Learning Flow</h3>
              </div>
              <button
                onClick={() => setShowStepsDrawer(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-2 text-xs">
              {[
                { step: 1, title: "Mission Briefing", desc: "Space cargo robot narrative & XP goals" },
                { step: 2, title: "Understand Concept", desc: "Everyday organizing books analogy, zero code" },
                { step: 3, title: "Interactive Thinking", desc: "Micro-questions: should we swap?" },
                { step: 4, title: "Visualization", desc: "Warehouse conveyor with robot inspection" },
                { step: 5, title: "Prediction Mode", desc: "Robot pauses: predict the next action" },
                { step: 6, title: "Dry Run Table", desc: "Automated step-by-step trace matrix" },
                { step: 7, title: "Code Explained", desc: "Click any line to reveal its purpose" },
                { step: 8, title: "Fill in Blanks", desc: "Complete loops and comparison operators" },
                { step: 9, title: "Build Together", desc: "Half-built code with robot hints" },
                { step: 10, title: "Build Yourself", desc: "Blank editor multi-language sandbox" },
                { step: 11, title: "Test Cases", desc: "Input, expected, and divergence diff" },
                { step: 12, title: "Boss Challenge", desc: "Reverse sort, custom comparators" },
                { step: 13, title: "Real World Use", desc: "When to use and Big-O efficiency" },
                { step: 14, title: "Rewards Screen", desc: "+150 XP, coins, and achievement badges" },
                { step: 15, title: "Robot Skins Store", desc: "Unlock custom companion cosmetics" },
              ].map((s) => (
                <div key={s.step} className="p-2.5 rounded-xl border border-slate-800/80 bg-slate-900/50 flex gap-2.5 items-start">
                  <span className="w-5 h-5 rounded-md bg-indigo-950 text-indigo-400 border border-indigo-800 font-mono flex items-center justify-center shrink-0 text-[10px] font-bold">
                    {s.step}
                  </span>
                  <div>
                    <h5 className="font-semibold text-slate-200">{s.title}</h5>
                    <p className="text-[11px] text-slate-400 leading-snug">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}