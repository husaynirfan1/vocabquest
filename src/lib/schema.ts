import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  serial,
  real,
} from "drizzle-orm/pg-core";

// ─── Users ───────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["teacher", "student"] }).notNull(),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // Teacher fields
  schoolName: text("school_name"),
  className: text("class_name"),
  subject: text("subject"),
  // Student fields
  teacherId: text("teacher_id"),
  classId: text("class_id"),
  currentLevel: integer("current_level").default(1),
  totalXP: integer("total_xp").default(0),
  streak: integer("streak").default(0),
  lastActive: timestamp("last_active").defaultNow(),
  unlockedLevels: jsonb("unlocked_levels").$type<number[]>().default([1]),
  completedGames: jsonb("completed_games").$type<string[]>().default([]),
  badges: jsonb("badges").$type<any[]>().default([]),
  vocabularyMastered: jsonb("vocabulary_mastered").$type<string[]>().default([]),
  gameStats: jsonb("game_stats").$type<any[]>().default([]),
});

// ─── Classes ─────────────────────────────────────────────────────────────────
export const classes = pgTable("classes", {
  id: text("id").primaryKey(),
  teacherId: text("teacher_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").notNull().default("#7c3aed"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Feedback ────────────────────────────────────────────────────────────────
export const feedback = pgTable("feedback", {
  id: text("id").primaryKey(),
  teacherId: text("teacher_id").notNull(),
  studentId: text("student_id").notNull(),
  message: text("message").notNull(),
  type: text("type", { enum: ["praise", "improvement", "reward"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  read: boolean("read").default(false),
});

// ─── Custom Levels ───────────────────────────────────────────────────────────
export const customLevels = pgTable("custom_levels", {
  id: serial("id").primaryKey(),
  teacherId: text("teacher_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  theme: text("theme").notNull(),
  color: text("color").notNull(),
  vocabulary: jsonb("vocabulary").$type<any[]>().notNull().default([]),
  requiredXP: integer("required_xp").default(0),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
