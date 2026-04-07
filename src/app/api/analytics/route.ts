import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, classes } from "@/lib/schema";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const teacherId = searchParams.get("teacherId");

  if (!teacherId) {
    return NextResponse.json({ error: "teacherId required" }, { status: 400 });
  }

  const studentRows = await db
    .select()
    .from(users)
    .where(and(eq(users.role, "student"), eq(users.teacherId, teacherId)));

  const classRows = await db
    .select()
    .from(classes)
    .where(eq(classes.teacherId, teacherId));

  const students = studentRows.map((s) => ({
    ...s,
    totalXP: s.totalXP ?? 0,
    currentLevel: s.currentLevel ?? 1,
    completedGames: (s.completedGames as string[]) ?? [],
    badges: (s.badges as any[]) ?? [],
    vocabularyMastered: (s.vocabularyMastered as string[]) ?? [],
    gameStats: (s.gameStats as any[]) ?? [],
    createdAt: s.createdAt?.toISOString?.() ?? s.createdAt,
    lastActive: s.lastActive?.toISOString?.() ?? s.lastActive,
    unlockedLevels: (s.unlockedLevels as number[]) ?? [1],
    streak: s.streak ?? 0,
  }));

  const totalStudents = students.length;
  const totalClasses = classRows.length;
  const averageXP = totalStudents
    ? students.reduce((sum, s) => sum + s.totalXP, 0) / totalStudents
    : 0;
  const averageLevel = totalStudents
    ? students.reduce((sum, s) => sum + s.currentLevel, 0) / totalStudents
    : 0;
  const totalGamesCompleted = students.reduce(
    (sum, s) => sum + s.completedGames.length,
    0
  );

  const topPerformers = [...students]
    .sort((a, b) => b.totalXP - a.totalXP)
    .slice(0, 5);
  const studentsNeedingHelp = students
    .filter((s) => s.currentLevel <= 2 && s.totalXP < 500)
    .slice(0, 5);
  const levelDistribution = [1, 2, 3, 4, 5].map((level) => ({
    level,
    count: students.filter((s) => s.currentLevel === level).length,
  }));

  return NextResponse.json({
    totalStudents,
    totalClasses,
    averageXP,
    averageLevel,
    totalGamesCompleted,
    topPerformers,
    studentsNeedingHelp,
    levelDistribution,
  });
}
