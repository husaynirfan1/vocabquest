// User Roles
export type UserRole = "teacher" | "student";

// User Base Interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

// Teacher Interface
export interface Teacher extends User {
  role: "teacher";
  schoolName: string;
  className: string;
  subject: string;
}

// Class Interface
export interface Class {
  id: string;
  teacherId: string;
  name: string;
  description?: string;
  color: string;
  createdAt: string;
}

// Student Interface
export interface Student extends User {
  role: "student";
  teacherId: string;
  classId?: string;
  currentLevel: number;
  totalXP: number;
  streak: number;
  lastActive: string;
  unlockedLevels: number[];
  completedGames: string[];
  badges: Badge[];
  vocabularyMastered: string[];
  gameStats: GameStat[];
}

// Vocabulary Word
export interface VocabularyWord {
  id: string;
  word: string;
  meaning: string;
  example: string;
  level: number;
  image?: string;
  audio?: string;
  difficulty: "easy" | "medium" | "hard";
}

// Level Interface
export interface Level {
  id: number;
  title: string;
  description: string;
  theme: string;
  color: string;
  vocabulary: VocabularyWord[];
  requiredXP: number;
  image: string;
}

// Game Types
export type GameType =
  | "word-match"
  | "fill-blanks"
  | "picture-match"
  | "spelling"
  | "quiz";

// Game Interface
export interface Game {
  id: string;
  type: GameType;
  title: string;
  description: string;
  levelId: number;
  xpReward: number;
  timeLimit?: number;
  questions: Question[];
}

// Question Interface
export interface Question {
  id: string;
  type: GameType;
  word?: VocabularyWord;
  question: string;
  options?: string[];
  correctAnswer: string;
  hint?: string;
  image?: string;
}

// Game Stat
export interface GameStat {
  gameId: string;
  completedAt: string;
  score: number;
  xpEarned: number;
  timeSpent: number;
  accuracy: number;
}

// Badge Interface
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt?: string;
  requirement: number;
  type: "xp" | "streak" | "level" | "accuracy" | "completion";
}

// Progress Tracking
export interface StudentProgress {
  studentId: string;
  levelProgress: LevelProgress[];
  totalGamesCompleted: number;
  averageAccuracy: number;
  totalTimeSpent: number;
  weakAreas: string[];
}

export interface LevelProgress {
  levelId: number;
  completed: boolean;
  vocabularyMastered: string[];
  gamesCompleted: string[];
  accuracy: number;
}

// Feedback
export interface Feedback {
  id: string;
  teacherId: string;
  studentId: string;
  message: string;
  type: "praise" | "improvement" | "reward";
  createdAt: string;
  read: boolean;
}

// Custom Level (teacher-created)
export interface CustomLevel extends Level {
  teacherId: string;
  createdAt: string;
}

// Auth State
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Leaderboard Entry
export interface LeaderboardEntry {
  studentId: string;
  name: string;
  avatar?: string;
  xp: number;
  level: number;
  streak: number;
  rank: number;
}

// Next-Auth session extension
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string;
}
