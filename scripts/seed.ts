import "dotenv/config";
import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import bcrypt from "bcryptjs";
import * as schema from "../src/lib/schema";

async function seed() {
  const db = drizzle(sql, { schema });

  console.log("Seeding database...");

  // Hash passwords
  const teacherPassword = await bcrypt.hash("teacher123", 10);
  const studentPassword = await bcrypt.hash("student123", 10);

  // ─── Create Teacher ──────────────────────────────────────────────
  console.log("Creating teacher...");
  await db
    .insert(schema.users)
    .values({
      id: "teacher-1",
      name: "Ms. Johnson",
      email: "teacher@vocabquest.com",
      password: teacherPassword,
      role: "teacher",
      schoolName: "Sunshine Primary School",
      className: "Year 6",
      subject: "English",
      avatar:
        "https://api.dicebear.com/7.x/avataaars/svg?seed=teacher&backgroundColor=c0aede",
    })
    .onConflictDoNothing();

  // ─── Create Classes ──────────────────────────────────────────────
  console.log("Creating classes...");
  const classesData = [
    {
      id: "class-1",
      teacherId: "teacher-1",
      name: "Year 6A",
      description: "Morning English class",
      color: "#7c3aed",
    },
    {
      id: "class-2",
      teacherId: "teacher-1",
      name: "Year 6B",
      description: "Afternoon English class",
      color: "#3b82f6",
    },
  ];

  for (const cls of classesData) {
    await db.insert(schema.classes).values(cls).onConflictDoNothing();
  }

  // ─── Create Students ─────────────────────────────────────────────
  console.log("Creating students...");
  const studentsData = [
    {
      id: "student-1",
      name: "Emma Wilson",
      email: "emma@vocabquest.com",
      classId: "class-1",
      currentLevel: 2,
      totalXP: 750,
      streak: 5,
      unlockedLevels: [1, 2],
      completedGames: ["l1-word-match", "l1-fill-blanks", "l2-word-match"],
      badges: [
        {
          id: "badge-1",
          name: "Word Wizard",
          description: "Master 50 vocabulary words",
          icon: "Sparkles",
          color: "#fbbf24",
          requirement: 50,
          type: "completion",
          earnedAt: new Date().toISOString(),
        },
      ],
      vocabularyMastered: ["l1-1", "l1-2", "l1-3", "l1-4", "l1-5"],
      avatar:
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma&backgroundColor=ffdfbf",
    },
    {
      id: "student-2",
      name: "Oliver Brown",
      email: "oliver@vocabquest.com",
      classId: "class-1",
      currentLevel: 3,
      totalXP: 1500,
      streak: 12,
      unlockedLevels: [1, 2, 3],
      completedGames: [
        "l1-word-match",
        "l1-fill-blanks",
        "l1-picture-match",
        "l2-word-match",
        "l2-fill-blanks",
      ],
      badges: [
        {
          id: "badge-1",
          name: "Word Wizard",
          description: "Master 50 vocabulary words",
          icon: "Sparkles",
          color: "#fbbf24",
          requirement: 50,
          type: "completion",
          earnedAt: new Date().toISOString(),
        },
        {
          id: "badge-3",
          name: "Perfect Score",
          description: "Get 100% on any game",
          icon: "Target",
          color: "#22c55e",
          requirement: 1,
          type: "accuracy",
          earnedAt: new Date().toISOString(),
        },
        {
          id: "badge-5",
          name: "Streak Champion",
          description: "Maintain a 7-day learning streak",
          icon: "Flame",
          color: "#ef4444",
          requirement: 7,
          type: "streak",
          earnedAt: new Date().toISOString(),
        },
      ],
      vocabularyMastered: [
        "l1-1", "l1-2", "l1-3", "l1-4", "l1-5", "l1-6", "l1-7",
        "l2-1", "l2-2", "l2-3",
      ],
      avatar:
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver&backgroundColor=b6e3f4",
    },
    {
      id: "student-3",
      name: "Sophia Lee",
      email: "sophia@vocabquest.com",
      classId: "class-1",
      currentLevel: 1,
      totalXP: 250,
      streak: 2,
      unlockedLevels: [1],
      completedGames: ["l1-word-match"],
      badges: [],
      vocabularyMastered: ["l1-1", "l1-2"],
      avatar:
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia&backgroundColor=ffd5dc",
    },
    {
      id: "student-4",
      name: "James Miller",
      email: "james@vocabquest.com",
      classId: "class-2",
      currentLevel: 4,
      totalXP: 2200,
      streak: 8,
      unlockedLevels: [1, 2, 3, 4],
      completedGames: [
        "l1-word-match", "l1-fill-blanks", "l1-picture-match", "l1-spelling",
        "l2-word-match", "l2-fill-blanks", "l2-picture-match", "l3-word-match",
      ],
      badges: [
        {
          id: "badge-1",
          name: "Word Wizard",
          description: "Master 50 vocabulary words",
          icon: "Sparkles",
          color: "#fbbf24",
          requirement: 50,
          type: "completion",
          earnedAt: new Date().toISOString(),
        },
        {
          id: "badge-2",
          name: "Speedster",
          description: "Complete a game in under 30 seconds with 100% accuracy",
          icon: "Zap",
          color: "#3b82f6",
          requirement: 1,
          type: "accuracy",
          earnedAt: new Date().toISOString(),
        },
        {
          id: "badge-3",
          name: "Perfect Score",
          description: "Get 100% on any game",
          icon: "Target",
          color: "#22c55e",
          requirement: 1,
          type: "accuracy",
          earnedAt: new Date().toISOString(),
        },
        {
          id: "badge-4",
          name: "Level Master",
          description: "Complete all games in a level",
          icon: "Trophy",
          color: "#f59e0b",
          requirement: 1,
          type: "completion",
          earnedAt: new Date().toISOString(),
        },
        {
          id: "badge-6",
          name: "XP Collector",
          description: "Earn 1000 XP",
          icon: "Star",
          color: "#8b5cf6",
          requirement: 1000,
          type: "xp",
          earnedAt: new Date().toISOString(),
        },
      ],
      vocabularyMastered: [
        "l1-1", "l1-2", "l1-3", "l1-4", "l1-5", "l1-6", "l1-7", "l1-8", "l1-9", "l1-10",
        "l2-1", "l2-2", "l2-3", "l2-4", "l2-5",
      ],
      avatar:
        "https://api.dicebear.com/7.x/avataaars/svg?seed=James&backgroundColor=d1d4f9",
    },
    {
      id: "student-5",
      name: "Ava Garcia",
      email: "ava@vocabquest.com",
      classId: "class-2",
      currentLevel: 2,
      totalXP: 600,
      streak: 3,
      unlockedLevels: [1, 2],
      completedGames: ["l1-word-match", "l1-fill-blanks"],
      badges: [
        {
          id: "badge-1",
          name: "Word Wizard",
          description: "Master 50 vocabulary words",
          icon: "Sparkles",
          color: "#fbbf24",
          requirement: 50,
          type: "completion",
          earnedAt: new Date().toISOString(),
        },
      ],
      vocabularyMastered: ["l1-1", "l1-2", "l1-3", "l1-4"],
      avatar:
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Ava&backgroundColor=c0aede",
    },
  ];

  for (const student of studentsData) {
    await db
      .insert(schema.users)
      .values({
        id: student.id,
        name: student.name,
        email: student.email,
        password: studentPassword,
        role: "student",
        teacherId: "teacher-1",
        classId: student.classId,
        currentLevel: student.currentLevel,
        totalXP: student.totalXP,
        streak: student.streak,
        unlockedLevels: student.unlockedLevels,
        completedGames: student.completedGames,
        badges: student.badges,
        vocabularyMastered: student.vocabularyMastered,
        gameStats: [],
        avatar: student.avatar,
      })
      .onConflictDoNothing();
  }

  console.log("Seed complete!");
  console.log("");
  console.log("Login credentials:");
  console.log("  Teacher: teacher@vocabquest.com / teacher123");
  console.log("  Students: emma@vocabquest.com / student123");
  console.log("            oliver@vocabquest.com / student123");
  console.log("            sophia@vocabquest.com / student123");
  console.log("            james@vocabquest.com / student123");
  console.log("            ava@vocabquest.com / student123");

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
