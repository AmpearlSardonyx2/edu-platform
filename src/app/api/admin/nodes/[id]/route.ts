import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!hasPermission(session?.user.role, "EDIT_CONTENT")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  const node = await prisma.node.update({
    where: { id: params.id },
    data: {
      parentId: body.parentId || null,
      type: body.type.toUpperCase(),
      slug: body.slug,
      title: body.title,
      orderIndex: body.orderIndex ?? 0,
    },
  });

  if (body.lesson) {
    await prisma.lesson.upsert({
      where: { nodeId: params.id },
      update: { ...body.lesson },
      create: { nodeId: params.id, ...body.lesson },
    });
  } else {
    await prisma.lesson.deleteMany({ where: { nodeId: params.id } });
  }

  return NextResponse.json({ node });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!hasPermission(session?.user.role, "EDIT_CONTENT")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await prisma.node.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}