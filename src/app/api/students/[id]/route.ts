import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";

function rowToUser(row: any) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    avatar: row.avatar,
    createdAt: row.createdAt?.toISOString?.() ?? row.createdAt,
    schoolName: row.schoolName,
    className: row.className,
    subject: row.subject,
    teacherId: row.teacherId,
    classId: row.classId,
    currentLevel: row.currentLevel ?? 1,
    totalXP: row.totalXP ?? 0,
    streak: row.streak ?? 0,
    lastActive: row.lastActive?.toISOString?.() ?? row.lastActive,
    unlockedLevels: row.unlockedLevels ?? [1],
    completedGames: row.completedGames ?? [],
    badges: row.badges ?? [],
    vocabularyMastered: row.vocabularyMastered ?? [],
    gameStats: row.gameStats ?? [],
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(rowToUser(row));
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  // Build update object, excluding fields that shouldn't be directly updated
  const updateData: Record<string, any> = {};

  if (body.name !== undefined) updateData.name = body.name;
  if (body.email !== undefined) updateData.email = body.email;
  if (body.avatar !== undefined) updateData.avatar = body.avatar;
  if (body.classId !== undefined) updateData.classId = body.classId;
  if (body.currentLevel !== undefined) updateData.currentLevel = body.currentLevel;
  if (body.totalXP !== undefined) updateData.totalXP = body.totalXP;
  if (body.streak !== undefined) updateData.streak = body.streak;
  if (body.lastActive !== undefined)
    updateData.lastActive = new Date(body.lastActive);
  if (body.unlockedLevels !== undefined)
    updateData.unlockedLevels = body.unlockedLevels;
  if (body.completedGames !== undefined)
    updateData.completedGames = body.completedGames;
  if (body.badges !== undefined) updateData.badges = body.badges;
  if (body.vocabularyMastered !== undefined)
    updateData.vocabularyMastered = body.vocabularyMastered;
  if (body.gameStats !== undefined) updateData.gameStats = body.gameStats;
  if (body.schoolName !== undefined) updateData.schoolName = body.schoolName;
  if (body.className !== undefined) updateData.className = body.className;
  if (body.subject !== undefined) updateData.subject = body.subject;
  if (body.password) updateData.password = await bcrypt.hash(body.password, 10);

  if (Object.keys(updateData).length > 0) {
    await db.update(users).set(updateData).where(eq(users.id, id));
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(users).where(eq(users.id, id));
  return NextResponse.json({ success: true });
}
