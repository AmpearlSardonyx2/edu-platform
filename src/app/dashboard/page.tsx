import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArrowRight } from "lucide-react";
import AppShell from "@/components/AppShell";

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

  return (
    <AppShell>
      <main className="max-w-3xl mx-auto py-12 px-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Welcome back{session.user.name ? `, ${session.user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-sm text-slate-500 mt-1">Here's where you left off.</p>
        </div>

        <Link href="/learn/bubble-sort" className="block bg-indigo-600 text-white rounded-xl p-5 hover:bg-indigo-700 transition">
          <p className="text-xs uppercase tracking-wide text-indigo-200 mb-1">Continue Learning</p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium">Bubble Sort</span>
            <ArrowRight size={18} />
          </div>
        </Link>

        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2 text-sm">
          <p><span className="text-slate-500">Name:</span> {session.user.name}</p>
          <p><span className="text-slate-500">Email:</span> {session.user.email}</p>
          <p><span className="text-slate-500">Role:</span> {session.user.role}</p>
          <p><span className="text-slate-500">College:</span> {collegeName ?? "Not affiliated"}</p>
        </div>

        <Link href="/learn" className="inline-block text-sm text-indigo-600 font-medium hover:underline">
          Browse all topics →
        </Link>
      </main>
    </AppShell>
  );
}