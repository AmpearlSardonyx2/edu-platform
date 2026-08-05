import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const nodes = await prisma.node.findMany({
    select: { id: true, parentId: true, type: true, slug: true, title: true, orderIndex: true, lesson: { select: { id: true } } },
    orderBy: [{ orderIndex: "asc" }],
  });

  const shaped = nodes.map((n) => ({
    id: n.id,
    parentId: n.parentId,
    type: n.type.toLowerCase(),
    slug: n.slug,
    title: n.title,
    orderIndex: n.orderIndex,
    hasContent: !!n.lesson,
  }));

  return NextResponse.json({ nodes: shaped });
}