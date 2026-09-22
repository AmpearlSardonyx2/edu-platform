// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArrowRight, Flame, Trophy, Target, Bot, Check } from "lucide-react";
import AppShell from "@/components/AppShell";
import ThemeToggle from "@/components/ThemeToggle";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  let collegeName: string | null = null;
  if (session.user.collegeId) {
    const college = await prisma.college.findUnique({
      where: { id: session.user.collegeId },
      select: { name: true },
    });
    collegeName = college?.name ?? null;
  }

  const firstName = session.user.name?.split(" ")[0] ?? "";

  // TODO: replace with real queries once these tables/fields exist
  const stats = {
    streakDays: 15,
    level: 12,
    xp: 2450,
    xpToNext: 3200,
    rank: 48,
    rankPercentile: 5, // "Top 5%"
    focusScore: 92,
    overallProgress: 72,
    lessonsCompleted: 48,
    lessonsTotal: 67,
    problemsSolved: 142,
    problemsTotal: 250,
    quizzesPassed: 18,
    quizzesTotal: 25,
    currentStreak: 12,
  };

  const mission = {
    items: [
      { label: "Finish Bubble Sort", done: true },
      { label: "Solve 5 problems", done: false },
      { label: "Review Arrays", done: false },
    ],
    progressPct: 78,
  };

  const friendsActivity = [
    { name: "Aryan", detail: "reached Level 13" },
    { name: "Maya", detail: "solved Tree Traversal" },
  ];

  return (
    <AppShell>
      <main className="max-w-6xl mx-auto py-10 px-6 space-y-6 bg-slate-50 dark:bg-[#05070d] min-h-screen transition-colors">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs tracking-widest font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
              Good evening,
            </p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {firstName} <span aria-hidden>👋</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Keep learning. Keep building. Keep growing.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <StatPill
              icon={<Flame size={16} className="text-orange-500" />}
              value={stats.streakDays}
              label="Day streak"
            />
            <StatPill
              value={`Level ${stats.level}`}
              label={`${stats.xp.toLocaleString()} / ${stats.xpToNext.toLocaleString()} XP`}
            />
            <StatPill
              value={`Rank #${stats.rank}`}
              label={`Top ${stats.rankPercentile}%`}
            />
            <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full border-2 border-purple-400 dark:border-purple-500 bg-white dark:bg-white/5">
              <span className="text-sm font-bold text-purple-600 dark:text-purple-300">
                {stats.focusScore}%
              </span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 leading-tight text-center">
                focus score
              </span>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Continue learning */}
        <Link
          href="/learn/bubble-sort"
          className="block rounded-2xl p-6 border border-slate-200 dark:border-white/10
                     bg-white dark:bg-white/[0.03] hover:border-emerald-400/50 dark:hover:border-emerald-400/30
                     transition group"
        >
          <p className="text-xs uppercase tracking-wide text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
            Continue learning
          </p>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Bubble Sort</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                You're doing great. Let's continue where you left off.
              </p>
            </div>
            <span
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 text-white
                         text-sm font-medium px-4 py-2 group-hover:bg-emerald-600 transition"
            >
              Continue lesson
              <ArrowRight size={16} />
            </span>
          </div>
        </Link>

        {/* Progress / Mission / Mentor grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Your progress */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500 font-semibold mb-4">
              Your progress
            </p>
            <div className="flex items-center gap-4">
              <ProgressRing percent={stats.overallProgress} />
              <dl className="text-sm space-y-1.5 flex-1">
                <ProgressRow
                  label="Lessons completed"
                  value={`${stats.lessonsCompleted} / ${stats.lessonsTotal}`}
                />
                <ProgressRow
                  label="Problems solved"
                  value={`${stats.problemsSolved} / ${stats.problemsTotal}`}
                />
                <ProgressRow
                  label="Quizzes passed"
                  value={`${stats.quizzesPassed} / ${stats.quizzesTotal}`}
                />
                <ProgressRow label="Current streak" value={`${stats.currentStreak} days`} />
              </dl>
            </div>
          </div>

          {/* Today's mission */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500 font-semibold mb-4 flex items-center gap-2">
              <Target size={14} /> Today's mission
            </p>
            <ul className="space-y-2.5">
              {mission.items.map((item) => (
                <li key={item.label} className="flex items-center gap-2 text-sm">
                  <span
                    className={`w-4 h-4 rounded flex items-center justify-center border
                      ${
                        item.done
                          ? "bg-emerald-500 border-emerald-500"
                          : "border-slate-300 dark:border-slate-600"
                      }`}
                  >
                    {item.done && <Check size={11} className="text-white" />}
                  </span>
                  <span
                    className={
                      item.done
                        ? "text-slate-400 dark:text-slate-500 line-through"
                        : "text-slate-700 dark:text-slate-200"
                    }
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 mb-1">
                <span>Progress</span>
                <span>{mission.progressPct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${mission.progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* AI mentor */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-5 flex flex-col">
            <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500 font-semibold mb-4 flex items-center gap-2">
              <Bot size={14} /> AI mentor
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300 flex-1">
              You've mastered comparisons. Next, Selection sort will take about 18 minutes.
            </p>
            <Link
              href="/ai-tutor"
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg
                         border border-emerald-500 text-emerald-600 dark:text-emerald-400
                         text-sm font-medium px-4 py-2 hover:bg-emerald-500 hover:text-white transition"
            >
              Start next lesson <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Friends activity */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500 font-semibold mb-4">
            Friends activity
          </p>
          <div className="flex flex-wrap gap-6">
            {friendsActivity.map((f) => (
              <div key={f.name} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {f.name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-white">{f.name}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{f.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Account summary (from your original page) */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-6 space-y-2 text-sm">
          <p>
            <span className="text-slate-400 dark:text-slate-500">Name:</span>{" "}
            <span className="text-slate-800 dark:text-slate-200">{session.user.name}</span>
          </p>
          <p>
            <span className="text-slate-400 dark:text-slate-500">Email:</span>{" "}
            <span className="text-slate-800 dark:text-slate-200">{session.user.email}</span>
          </p>
          <p>
            <span className="text-slate-400 dark:text-slate-500">Role:</span>{" "}
            <span className="text-slate-800 dark:text-slate-200">{session.user.role}</span>
          </p>
          <p>
            <span className="text-slate-400 dark:text-slate-500">College:</span>{" "}
            <span className="text-slate-800 dark:text-slate-200">
              {collegeName ?? "Not affiliated"}
            </span>
          </p>
        </div>

        <Link
          href="/learn"
          className="inline-block text-sm text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
        >
          Browse all topics →
        </Link>
      </main>
    </AppShell>
  );
}

function StatPill({
  icon,
  value,
  label,
}: {
  icon?: React.ReactNode;
  value: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 min-w-[92px]">
      <span className="flex items-center gap-1 text-sm font-bold text-slate-900 dark:text-white">
        {icon}
        {value}
      </span>
      <span className="text-[10px] text-slate-400 dark:text-slate-500">{label}</span>
    </div>
  );
}

function ProgressRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="font-medium text-slate-800 dark:text-slate-100">{value}</dd>
    </div>
  );
}

function ProgressRing({ percent }: { percent: number }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative w-20 h-20 shrink-0">
      <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          strokeWidth="7"
          className="stroke-slate-100 dark:stroke-white/10"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          stroke="url(#ring-gradient)"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-bold text-slate-900 dark:text-white">{percent}%</span>
        <span className="text-[9px] text-slate-400 dark:text-slate-500">overall</span>
      </div>
    </div>
  );
}