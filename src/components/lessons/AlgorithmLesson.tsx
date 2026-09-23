"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Lightbulb, Play, RotateCcw, CheckCircle2, 
  Sparkles, Layers, Maximize2, Clock, Zap, Bot
} from "lucide-react";
import LessonPreview, { LessonExplanations } from "./LessonPreview";
import ThemeToggle from "@/components/ThemeToggle";

interface FetchedLesson {
  slug: string;
  title: string;
  entryFunctionName: string;
  defaultCode: string;
  explanations: LessonExplanations;
}

const MULTI_LANG_CODES: Record<string, string> = {
  javascript: `function bubbleSort(arr) {
  let n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  return arr;
}`,
  python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        swapped = False
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr`,
  cpp: `void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
                swapped = true;
            }
        }
        if (!swapped) break;
    }
}`,
  java: `public static void bubbleSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        boolean swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                swapped = true;
            }
        }
        if (!swapped) break;
    }
}`,
  go: `func bubbleSort(arr []int) []int {
    n := len(arr)
    for i := 0; i < n-1; i++ {
        swapped := false
        for j := 0; j < n-i-1; j++ {
            if arr[j] > arr[j+1] {
                arr[j], arr[j+1] = arr[j+1], arr[j]
                swapped = true
            }
        }
        if !swapped {
            break
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

  // Quick Quiz State matching visualizition.jpeg
  const [quizSelected, setQuizSelected] = useState<number | null>(0);
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
          setLesson({
            slug: "bubble-sort",
            title: "Bubble Sort",
            entryFunctionName: "bubbleSort",
            defaultCode: MULTI_LANG_CODES.javascript,
            explanations: {
              start: "The crates just arrived on the belt. The robot will inspect adjacent pairs and swap.",
              compareGreater: "Comparing {a} and {b}: {a} is heavier than {b}, swap needed!",
              compareLess: "Comparing {a} and {b}: already in order, no swap needed.",
              swap: "Swapping crates {a} and {b} on the belt!",
              markSorted: "Crate {v} locked in its sorted final location.",
              done: "All crates sorted successfully! Ready for launch.",
            },
          });
          setCode(MULTI_LANG_CODES.javascript);
        }
      })
      .catch(() => {
        setLesson({
          slug: "bubble-sort",
          title: "Bubble Sort",
          entryFunctionName: "bubbleSort",
          defaultCode: MULTI_LANG_CODES.javascript,
          explanations: {
            start: "The crates just arrived on the belt.",
            compareGreater: "Comparing {a} and {b}: swap needed.",
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
    setCode(MULTI_LANG_CODES[activeLang]);
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
    setTimeout(() => setTrySuccess(false), 2500);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070913]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 dark:border-cyan-400 border-t-transparent animate-spin" />
          <p className="text-slate-500 text-xs font-mono">Loading mission workstation...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070913]">
        <p className="text-slate-500 text-sm">Lesson not configured yet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070913] text-slate-900 dark:text-slate-100 font-sans select-none transition-colors duration-200">
      
      {/* 1. Top Navbar matching visualizition.jpeg */}
      <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090e17] px-6 flex items-center justify-between shrink-0 shadow-sm">
        <button 
          onClick={handleBack} 
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-400 transition"
        >
          <ArrowLeft size={16} /> Back to Learn
        </button>

        <h1 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide uppercase">
          {lesson.title}
        </h1>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHint((p) => !p)}
            className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800/80 px-3 py-1.5 rounded-xl transition font-medium"
          >
            <Lightbulb size={14} /> Hint
          </button>
          
          <button
            onClick={() => setShowStepsDrawer(true)}
            className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/80 px-3 py-1.5 rounded-xl transition font-medium"
          >
            <Layers size={14} /> Steps
          </button>

          <ThemeToggle />
        </div>
      </header>

      {/* 2. Sub-Header Telemetry & Mission Strip matching visualizition.jpeg */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-[#080d16] px-6 py-2.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Difficulty pill */}
          <div className="flex items-center gap-2 text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <span className="text-slate-500 dark:text-slate-400">Difficulty:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Easy</span>
          </div>

          {/* Time pill */}
          <div className="flex items-center gap-2 text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl">
            <Clock size={13} className="text-indigo-500 dark:text-cyan-400" />
            <span className="text-slate-500 dark:text-slate-400">Estimated Time:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">15 min</span>
          </div>

          {/* XP Reward pill */}
          <div className="flex items-center gap-2 text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl">
            <Zap size={13} className="text-amber-500 animate-bounce" />
            <span className="text-slate-500 dark:text-slate-400">XP Reward:</span>
            <span className="font-bold text-amber-500 font-mono">+150 XP</span>
          </div>
        </div>

        {/* Mission Box matching visualizition.jpeg */}
        <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 rounded-2xl px-4 py-2 text-xs shadow-sm">
          <div className="flex items-center gap-1.5">
            <Bot size={16} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-indigo-700 dark:text-indigo-300 font-bold font-mono uppercase">Mission:</span>
          </div>
          <span className="text-slate-600 dark:text-slate-300">
            The robot has 6 cargo crates. Help it arrange them in the correct order before launch.
          </span>
        </div>
      </div>

      {/* 3. Main Workspace: Full 2-Column Grid */}
      <div className="flex-1 p-5 grid lg:grid-cols-12 gap-5 max-w-[1700px] w-full mx-auto">
        
        {/* LEFT COLUMN: Code Window + 4 Feature Cards (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          
          {/* The Code Editor Window */}
          <div className="bg-white dark:bg-[#090e17] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col transition-colors">
            
            {/* Code Tabs & Language Row */}
            <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-[#0a101b]">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("code")}
                  className={`text-xs font-bold px-3 py-1 rounded-xl transition ${
                    activeTab === "code" 
                      ? "text-indigo-600 dark:text-cyan-400 bg-white dark:bg-cyan-950/60 border border-slate-200 dark:border-cyan-800 shadow-sm" 
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  Code
                </button>
                <button
                  onClick={() => setActiveTab("explanation")}
                  className={`text-xs font-bold px-3 py-1 rounded-xl transition ${
                    activeTab === "explanation" 
                      ? "text-indigo-600 dark:text-cyan-400 bg-white dark:bg-cyan-950/60 border border-slate-200 dark:border-cyan-800 shadow-sm" 
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  Explanation
                </button>
              </div>

              {/* Language Selector Pills matching mockup */}
              <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-900 p-1 rounded-xl text-[11px] font-mono">
                {(["javascript", "python", "cpp", "java", "go"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLangChange(lang)}
                    className={`px-2.5 py-1 rounded-lg capitalize transition font-semibold ${
                      activeLang === lang 
                        ? "bg-white dark:bg-cyan-500/20 text-indigo-700 dark:text-cyan-300 shadow-sm border border-slate-200 dark:border-cyan-500/40" 
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    {lang === "cpp" ? "C++" : lang === "javascript" ? "JS JavaScript" : lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Body */}
            {activeTab === "code" ? (
              <div className="p-4 bg-slate-900 text-slate-100 flex flex-col font-mono text-xs leading-relaxed overflow-x-auto min-h-[220px]">
                <div className="flex">
                  {/* Line numbers */}
                  <div className="pr-3 text-right select-none text-slate-600 border-r border-slate-800">
                    {code.split("\n").map((_, i) => (
                      <div key={i} className="h-6">{i + 1}</div>
                    ))}
                  </div>
                  {/* Editable Code */}
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    spellCheck={false}
                    className="flex-1 bg-transparent text-emerald-300 outline-none resize-none pl-3 font-mono text-xs leading-6 min-h-[220px]"
                  />
                </div>
              </div>
            ) : (
              <div className="p-5 bg-white dark:bg-[#060a12] text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed min-h-[220px]">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Line-by-Line Mechanics</h4>
                <p>1. <span className="font-bold font-mono text-indigo-600 dark:text-cyan-400">Outer loop (i)</span>: Runs $n - 1$ times. In each complete pass, the largest remaining unsorted crate bubbles up to the very end.</p>
                <p>2. <span className="font-bold font-mono text-indigo-600 dark:text-cyan-400">Inner loop (j)</span>: Compares adjacent pairs (<span className="font-mono text-amber-500 font-semibold">arr[j]</span> and <span className="font-mono text-amber-500 font-semibold">arr[j+1]</span>). If the left crate is heavier, swap them.</p>
                <p>3. <span className="font-bold font-mono text-indigo-600 dark:text-cyan-400">Early exit (swapped)</span>: If an entire pass finishes without a single swap, the array is already sorted, and we break immediately!</p>
              </div>
            )}

            {/* Code Controls Footer */}
            <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0a101b] flex items-center justify-between">
              <button
                onClick={handleResetCode}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition font-medium"
              >
                <RotateCcw size={13} /> Reset Code
              </button>

              <button
                onClick={() => {}}
                className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-md shadow-indigo-500/25 transition active:scale-95"
              >
                <Play size={13} fill="currentColor" /> Run Code
              </button>
            </div>
          </div>

          {/* 4 Cards Grid matching visualizition.jpeg */}
          <div className="grid sm:grid-cols-2 gap-4">
            
            {/* Card 1: Concept */}
            <div className="bg-white dark:bg-[#090e17] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                <Lightbulb size={16} /> Concept
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Bubble Sort repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.
              </p>
              <button className="text-[11px] font-bold text-indigo-600 dark:text-cyan-400 hover:underline pt-1">
                Learn more →
              </button>
            </div>

            {/* Card 2: Walkthrough */}
            <div className="bg-white dark:bg-[#090e17] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2 shadow-sm">
              <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Walkthrough</div>
              <div className="space-y-1.5 text-[11px] font-mono text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-bold">1</span>
                  <span>Compare 5 and 2: <strong className="text-amber-500">5 &gt; 2, swap</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-bold">2</span>
                  <span>Compare 5 and 8: <strong>5 &lt; 8, keep</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-bold">3</span>
                  <span>Compare 8 and 1: <strong className="text-amber-500">8 &gt; 1, swap</strong></span>
                </div>
              </div>
            </div>

            {/* Card 3: Try It Yourself */}
            <div className="bg-white dark:bg-[#090e17] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2 shadow-sm">
              <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400">Try It Yourself</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Modify the input array and see how Bubble Sort works!</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tryInput}
                  onChange={(e) => setTryInput(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1 text-xs font-mono text-slate-800 dark:text-slate-200 flex-1 outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleTryVerify}
                  className="bg-indigo-600 dark:bg-cyan-600 hover:bg-indigo-500 text-white text-xs px-3.5 py-1 rounded-xl font-bold transition shadow-sm"
                >
                  Apply
                </button>
              </div>
              {trySuccess && (
                <span className="text-[11px] text-emerald-500 font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Array loaded into conveyor!
                </span>
              )}
            </div>

            {/* Card 4: Quick Quiz */}
            <div className="bg-white dark:bg-[#090e17] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2 shadow-sm">
              <div className="text-xs font-bold text-pink-600 dark:text-pink-400">Quick Quiz</div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">What happens in each pass of Bubble Sort?</p>
              <div className="space-y-1.5 text-[11px]">
                {[
                  "Largest element comes to the end",
                  "Smallest element comes to the start",
                  "Array gets reversed",
                  "Array is divided into two halves",
                ].map((opt, idx) => (
                  <label key={idx} className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300">
                    <input
                      type="radio"
                      name="quick-quiz"
                      checked={quizSelected === idx}
                      onChange={() => setQuizSelected(idx)}
                      className="accent-indigo-600 dark:accent-pink-500"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
              <div className="pt-1 flex items-center justify-between">
                <button
                  onClick={handleQuizCheck}
                  className="text-xs px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-700 transition"
                >
                  Check Answer
                </button>
                {quizChecked && (
                  <span className={`text-[11px] font-bold ${quizSelected === 0 ? "text-emerald-500" : "text-rose-500"}`}>
                    {quizSelected === 0 ? "✓ Correct!" : "✗ Try again!"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Full Visualization Arena (6 cols) */}
        <div className="lg:col-span-6 flex flex-col">
          <div className="bg-white dark:bg-[#090e17] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xl flex-1 flex flex-col transition-colors">
            <LessonPreview
              code={code}
              entryFunctionName={lesson.entryFunctionName}
              explanations={lesson.explanations}
            />
          </div>
        </div>
      </div>

      {/* 15-Step Progression Modal */}
      {showStepsDrawer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#090e17] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="text-indigo-600 dark:text-indigo-400" size={20} />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">15-Step Mission Learning Journey</h3>
              </div>
              <button
                onClick={() => setShowStepsDrawer(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-2.5 text-xs">
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
                <div key={s.step} className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 font-mono flex items-center justify-center shrink-0 text-xs font-bold">
                    {s.step}
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-slate-200">{s.title}</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{s.desc}</p>
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