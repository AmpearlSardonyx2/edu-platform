import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const node = await prisma.node.findUnique({
    where: { slug: params.slug },
    include: { lesson: true },
  });

  if (!node || !node.lesson) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    lesson: {
      slug: node.slug,
      title: node.title,
      entryFunctionName: node.lesson.entryFunctionName,
      defaultCode: node.lesson.defaultCode,
      explanations: {
        start: node.lesson.explanationStart,
        compareGreater: node.lesson.explanationCompareGreater,
        compareLess: node.lesson.explanationCompareLess,
        swap: node.lesson.explanationSwap,
        markSorted: node.lesson.explanationMarkSorted,
        done: node.lesson.explanationDone,
      },
    },
  });
}