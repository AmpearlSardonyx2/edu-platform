"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronDown, Circle, CheckCircle2 } from "lucide-react";
import { ContentNode } from "@/lib/nodes";

function TreeNode({ node, depth }: { node: ContentNode; depth: number }) {
  const children = (node.children as ContentNode[]) || [];
  const hasChildren = children.length > 0;
  const [isOpen, setIsOpen] = useState(depth < 1); // top level open by default

  const isLeaf = !hasChildren;

  const rowContent = (
    <div
      className="flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-slate-50 transition cursor-pointer text-sm"
      style={{ paddingLeft: `${depth * 18 + 8}px` }}
    >
      {hasChildren ? (
        isOpen ? (
          <ChevronDown size={15} className="text-slate-400 shrink-0" />
        ) : (
          <ChevronRight size={15} className="text-slate-400 shrink-0" />
        )
      ) : (
        <span className="w-[15px] shrink-0" />
      )}

      {isLeaf &&
        (node.hasContent ? (
          <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
        ) : (
          <Circle size={14} className="text-slate-300 shrink-0" />
        ))}

      <span className={depth === 0 ? "font-semibold text-slate-900" : "text-slate-700"}>
        {node.title}
      </span>

      {isLeaf && !node.hasContent && (
        <span className="ml-auto text-[10px] uppercase tracking-wide text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          Coming soon
        </span>
      )}
    </div>
  );

  return (
    <div>
      {isLeaf ? (
        <Link href={`/learn/${node.slug}`}>{rowContent}</Link>
      ) : (
        <div onClick={() => setIsOpen((v) => !v)}>{rowContent}</div>
      )}

      {hasChildren && isOpen && (
        <div>
          {children.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function NodeTree({ roots }: { roots: ContentNode[] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3">
      {roots.map((root) => (
        <TreeNode key={root.id} node={root} depth={0} />
      ))}
    </div>
  );
}
