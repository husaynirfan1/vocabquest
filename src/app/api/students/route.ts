import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";

function rowToStudent(row: any) {
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const teacherId = searchParams.get("teacherId");
  const classId = searchParams.get("classId");
  const leaderboard = searchParams.get("leaderboard");
  const all = searchParams.get("all");

  let rows;

  if (teacherId) {
    rows = await db
      .select()
      .from(users)
      .where(and(eq(users.role, "student"), eq(users.teacherId, teacherId)));
  } else if (classId) {
    rows = await db
      .select()
      .from(users)
      .where(and(eq(users.role, "student"), eq(users.classId, classId)));
  } else if (leaderboard) {
    rows = await db.select().from(users).where(eq(users.role, "student"));
    const students = rows.map(rowToStudent);
    const entries = students
      .map((s: any) => ({
        studentId: s.id,
        name: s.name,
        avatar: s.avatar,
        xp: s.totalXP,
        level: s.currentLevel,
        streak: s.streak,
        rank: 0,
      }))
      .sort((a: any, b: any) => b.xp - a.xp);
    entries.forEach((e: any, i: number) => {
      e.rank = i + 1;
    });
    return NextResponse.json(entries);
  } else if (all) {
    rows = await db.select().from(users);
  } else {
    rows = await db.select().from(users).where(eq(users.role, "student"));
  }

  return NextResponse.json(rows.map(rowToStudent));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const password = body.password || "changeme123";
  const hashedPassword = await bcrypt.hash(password, 10);

  await db.insert(users).values({
    id: body.id || `student-${Date.now()}`,
    name: body.name,
    email: body.email.toLowerCase(),
    password: hashedPassword,
    role: "student",
    avatar:
      body.avatar ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(body.name)}&backgroundColor=ffdfbf`,
    teacherId: body.teacherId,
    classId: body.classId || null,
    currentLevel: 1,
    totalXP: 0,
    streak: 0,
    unlockedLevels: [1],
    completedGames: [],
    badges: [],
    vocabularyMastered: [],
    gameStats: [],
  });

  return NextResponse.json({ success: true });
}
