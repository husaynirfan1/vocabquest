import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { customLevels } from "@/lib/schema";

function rowToLevel(row: any) {
  return {
    id: row.id,
    teacherId: row.teacherId,
    title: row.title,
    description: row.description,
    theme: row.theme,
    color: row.color,
    vocabulary: row.vocabulary ?? [],
    requiredXP: row.requiredXP ?? 0,
    image: row.image,
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
      .from(customLevels)
      .where(eq(customLevels.teacherId, teacherId));
  } else {
    rows = await db.select().from(customLevels);
  }

  return NextResponse.json(rows.map(rowToLevel));
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  await db.insert(customLevels).values({
    teacherId: body.teacherId,
    title: body.title,
    description: body.description || body.title,
    theme: body.theme || body.title.toLowerCase().replace(/\s+/g, "-"),
    color: body.color || "#7c3aed",
    vocabulary: body.vocabulary || [],
    requiredXP: body.requiredXP || 0,
    image: body.image,
  });

  return NextResponse.json({ success: true });
}
