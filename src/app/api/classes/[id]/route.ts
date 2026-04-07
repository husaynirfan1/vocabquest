import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { classes, users } from "@/lib/schema";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [row] = await db
    .select()
    .from(classes)
    .where(eq(classes.id, id))
    .limit(1);
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    ...row,
    createdAt: row.createdAt?.toISOString?.() ?? row.createdAt,
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  await db
    .update(classes)
    .set({
      name: body.name,
      description: body.description,
      color: body.color,
    })
    .where(eq(classes.id, id));

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Unassign students from this class
  await db
    .update(users)
    .set({ classId: null })
    .where(eq(users.classId, id));

  await db.delete(classes).where(eq(classes.id, id));

  return NextResponse.json({ success: true });
}
