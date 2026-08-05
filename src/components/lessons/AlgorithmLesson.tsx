"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import LessonPreview, { LessonExplanations } from "./LessonPreview";

interface FetchedLesson {
  slug: string;
  title: string;
  entryFunctionName: string;
  defaultCode: string;
  explanations: LessonExplanations;
}

export default function AlgorithmLesson({ slug }: { slug: string }) {
  const router = useRouter();
  const [lesson, setLesson] = useState<FetchedLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");

  useEffect(() => {
    fetch(`/api/lessons/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.lesson) {
          setLesson(data.lesson);
          setCode(data.lesson.defaultCode);
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleBack = () => router.push(`/learn?from=${slug}`);
  const handleResetCode = () => lesson && setCode(lesson.defaultCode);

  if (loading) return <div className="h-screen flex items-center justify-center"><p className="text-slate-400 text-sm">Loading lesson...</p></div>;
  if (!lesson) return <div className="h-screen flex items-center justify-center"><p className="text-slate-500 text-sm">This lesson isn't set up yet.</p></div>;

  return (
    <div className="h-screen flex flex-col bg-stone-50 overflow-hidden">
      <div className="shrink-0 flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-white">
        <button onClick={handleBack} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-indigo-600 transition">
          <ArrowLeft size={16} /> Back to Learn
        </button>
        <h1 className="text-sm font-semibold text-slate-800">{lesson.title}</h1>
        <span className="w-24" />
      </div>

      <div className="flex-1 min-h-0 grid md:grid-cols-2 gap-4 p-4">
        <div className="flex flex-col min-h-0 gap-2">
          <div className="bg-slate-900 rounded-xl overflow-hidden flex-1 min-h-0 flex flex-col border border-slate-800">
            <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-slate-800 bg-slate-950/50 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="ml-2 text-[11px] text-slate-400 font-mono">{lesson.entryFunctionName}.js</span>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="flex-1 w-full bg-transparent text-slate-200 outline-none resize-none p-3 font-mono text-[12px] leading-6"
            />
          </div>
          <button onClick={handleResetCode} className="shrink-0 text-sm px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition w-fit">
            Reset code
          </button>
        </div>

        <LessonPreview code={code} entryFunctionName={lesson.entryFunctionName} explanations={lesson.explanations} />
      </div>
    </div>
  );
}