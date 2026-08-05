import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!hasPermission(session?.user.role, "EDIT_CONTENT")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const nodes = await prisma.node.findMany({
    include: { lesson: true },
    orderBy: [{ orderIndex: "asc" }],
  });

  const shaped = nodes.map((n) => ({
    id: n.id,
    parentId: n.parentId,
    type: n.type.toLowerCase(),
    slug: n.slug,
    title: n.title,
    orderIndex: n.orderIndex,
    lesson: n.lesson
      ? {
          entryFunctionName: n.lesson.entryFunctionName,
          defaultCode: n.lesson.defaultCode,
          explanationStart: n.lesson.explanationStart,
          explanationCompareGreater: n.lesson.explanationCompareGreater,
          explanationCompareLess: n.lesson.explanationCompareLess,
          explanationSwap: n.lesson.explanationSwap,
          explanationMarkSorted: n.lesson.explanationMarkSorted,
          explanationDone: n.lesson.explanationDone,
        }
      : null,
  }));

  return NextResponse.json({ nodes: shaped });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!hasPermission(session?.user.role, "CREATE_CONTENT")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  const node = await prisma.node.create({
    data: {
      parentId: body.parentId || null,
      type: body.type.toUpperCase(),
      slug: body.slug,
      title: body.title,
      orderIndex: body.orderIndex ?? 0,
    },
  });

  if (body.lesson) {
    await prisma.lesson.create({
      data: { nodeId: node.id, ...body.lesson },
    });
  }

  return NextResponse.json({ node }, { status: 201 });
}