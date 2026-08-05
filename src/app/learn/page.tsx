import { Suspense } from "react";
import AppShell from "@/components/AppShell";
import NodeGraph from "@/components/NodeGraph";

export default function LearnPage() {
  return (
    <AppShell>
      <main className="max-w-4xl mx-auto py-10 px-6 space-y-5">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Learn</h1>
          <p className="text-sm text-slate-500 mt-1">Search what you want to learn, or click through the tree.</p>
        </div>
        <Suspense fallback={null}>
          <NodeGraph />
        </Suspense>
      </main>
    </AppShell>
  );
}