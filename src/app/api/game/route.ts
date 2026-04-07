import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { studentId, gameId, score, xpEarned, timeSpent, accuracy } = body;

  const [student] = await db
    .select()
    .from(users)
    .where(eq(users.id, studentId))
    .limit(1);
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const completedGames = (student.completedGames as string[]) || [];
  if (!completedGames.includes(gameId)) {
    completedGames.push(gameId);
  }

  const gameStats = (student.gameStats as any[]) || [];
  gameStats.push({
    gameId,
    completedAt: new Date().toISOString(),
    score,
    xpEarned,
    timeSpent,
    accuracy,
  });

  await db
    .update(users)
    .set({
      completedGames,
      gameStats,
      totalXP: (student.totalXP ?? 0) + xpEarned,
      lastActive: new Date(),
    })
    .where(eq(users.id, studentId));

  return NextResponse.json({ success: true });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { action, studentId } = body;

  const [student] = await db
    .select()
    .from(users)
    .where(eq(users.id, studentId))
    .limit(1);
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  switch (action) {
    case "addXP": {
      await db
        .update(users)
        .set({
          totalXP: (student.totalXP ?? 0) + body.xp,
          lastActive: new Date(),
        })
        .where(eq(users.id, studentId));
      break;
    }

    case "unlockLevel": {
      const unlockedLevels = (student.unlockedLevels as number[]) || [];
      if (!unlockedLevels.includes(body.levelId)) {
        unlockedLevels.push(body.levelId);
      }
      const currentLevel =
        body.levelId > (student.currentLevel ?? 1)
          ? body.levelId
          : student.currentLevel;
      await db
        .update(users)
        .set({ unlockedLevels, currentLevel })
        .where(eq(users.id, studentId));
      break;
    }

    case "masterVocabulary": {
      const mastered = (student.vocabularyMastered as string[]) || [];
      if (!mastered.includes(body.vocabId)) {
        mastered.push(body.vocabId);
      }
      await db
        .update(users)
        .set({ vocabularyMastered: mastered })
        .where(eq(users.id, studentId));
      break;
    }

    case "awardBadge": {
      const badgesList = (student.badges as any[]) || [];
      if (!badgesList.find((b: any) => b.id === body.badge.id)) {
        badgesList.push({
          ...body.badge,
          earnedAt: new Date().toISOString(),
        });
      }
      await db
        .update(users)
        .set({ badges: badgesList })
        .where(eq(users.id, studentId));
      break;
    }

    case "updateStreak": {
      const lastActive = student.lastActive
        ? new Date(student.lastActive)
        : new Date();
      const today = new Date();
      const diffDays = Math.ceil(
        Math.abs(today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
      );

      let streak = student.streak ?? 0;
      if (diffDays === 1) {
        streak += 1;
      } else if (diffDays > 1) {
        streak = 1;
      }

      await db
        .update(users)
        .set({ streak, lastActive: today })
        .where(eq(users.id, studentId));
      break;
    }

    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
