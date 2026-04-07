import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { classes } from "@/lib/schema";

function rowToClass(row: any) {
  return {
    id: row.id,
    teacherId: row.teacherId,
    name: row.name,
    description: row.description,
    color: row.color,
    createdAt: row.createdAt?.toISOString?.() ?? row.createdAt,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const teacherId = searchParams.get("teacherId");

  let rows;
  if (teacherId) {
    rows = await db
      .select()
      .from(classes)
      .where(eq(classes.teacherId, teacherId));
  } else {
    rows = await db.select().from(classes);
  }

  return NextResponse.json(rows.map(rowToClass));
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  await db.insert(classes).values({
    id: body.id || `class-${Date.now()}`,
    teacherId: body.teacherId,
    name: body.name,
    description: body.description || null,
    color: body.color || "#7c3aed",
  });

  return NextResponse.json({ success: true });
}
