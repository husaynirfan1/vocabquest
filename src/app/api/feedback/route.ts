import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { feedback } from "@/lib/schema";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");

  let rows;
  if (studentId) {
    rows = await db
      .select()
      .from(feedback)
      .where(eq(feedback.studentId, studentId));
  } else {
    rows = await db.select().from(feedback);
  }

  return NextResponse.json(
    rows.map((r) => ({
      ...r,
      createdAt: r.createdAt?.toISOString?.() ?? r.createdAt,
    }))
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  await db.insert(feedback).values({
    id: body.id || `feedback-${Date.now()}`,
    teacherId: body.teacherId,
    studentId: body.studentId,
    message: body.message,
    type: body.type,
    read: false,
  });

  return NextResponse.json({ success: true });
}
