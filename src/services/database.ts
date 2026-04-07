import type {
  User,
  Teacher,
  Student,
  GameStat,
  Feedback,
  Badge,
  LeaderboardEntry,
  Class,
  CustomLevel,
  Level,
  VocabularyWord,
} from "@/types";
export type { Student, Feedback, Class, CustomLevel };
import { badges, levels as builtInLevels, allVocabulary } from "@/data/vocabulary";

// ─── Helper ──────────────────────────────────────────────────────────────────

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || res.statusText);
  }
  return res.json();
}

// ─── User Management ─────────────────────────────────────────────────────────

export async function getAllUsers(): Promise<User[]> {
  return api<User[]>("/api/students?all=true");
}

export async function getUserById(id: string): Promise<User | undefined> {
  try {
    return await api<User>(`/api/students/${id}`);
  } catch {
    return undefined;
  }
}

export async function createUser(user: Partial<Student> & { password?: string }): Promise<void> {
  await api("/api/students", {
    method: "POST",
    body: JSON.stringify(user),
  });
}

export async function updateUser(updatedUser: User): Promise<void> {
  await api(`/api/students/${updatedUser.id}`, {
    method: "PUT",
    body: JSON.stringify(updatedUser),
  });
}

export async function deleteUser(id: string): Promise<void> {
  await api(`/api/students/${id}`, { method: "DELETE" });
}

// ─── Teacher Functions ───────────────────────────────────────────────────────

export async function getTeacherStudents(teacherId: string): Promise<Student[]> {
  return api<Student[]>(`/api/students?teacherId=${teacherId}`);
}

// ─── Class Functions ─────────────────────────────────────────────────────────

export async function getAllClasses(): Promise<Class[]> {
  return api<Class[]>("/api/classes");
}

export async function getTeacherClasses(teacherId: string): Promise<Class[]> {
  return api<Class[]>(`/api/classes?teacherId=${teacherId}`);
}

export async function getClassById(id: string): Promise<Class | undefined> {
  try {
    return await api<Class>(`/api/classes/${id}`);
  } catch {
    return undefined;
  }
}

export async function createClass(cls: Class): Promise<void> {
  await api("/api/classes", { method: "POST", body: JSON.stringify(cls) });
}

export async function updateClass(updated: Class): Promise<void> {
  await api(`/api/classes/${updated.id}`, {
    method: "PUT",
    body: JSON.stringify(updated),
  });
}

export async function deleteClass(id: string): Promise<void> {
  await api(`/api/classes/${id}`, { method: "DELETE" });
}

export async function assignStudentToClass(
  studentId: string,
  classId: string | null
): Promise<void> {
  await api(`/api/students/${studentId}`, {
    method: "PUT",
    body: JSON.stringify({ classId: classId ?? null }),
  });
}

export async function getClassStudents(classId: string): Promise<Student[]> {
  return api<Student[]>(`/api/students?classId=${classId}`);
}

// ─── Student Functions ───────────────────────────────────────────────────────

export async function getStudentById(id: string): Promise<Student | undefined> {
  try {
    return await api<Student>(`/api/students/${id}`);
  } catch {
    return undefined;
  }
}

export async function updateStudent(student: Student): Promise<void> {
  await api(`/api/students/${student.id}`, {
    method: "PUT",
    body: JSON.stringify(student),
  });
}

export async function addXP(studentId: string, xp: number): Promise<void> {
  await api(`/api/game`, {
    method: "PUT",
    body: JSON.stringify({ action: "addXP", studentId, xp }),
  });
}

export async function unlockLevel(
  studentId: string,
  levelId: number
): Promise<void> {
  await api(`/api/game`, {
    method: "PUT",
    body: JSON.stringify({ action: "unlockLevel", studentId, levelId }),
  });
}

export async function completeGame(
  studentId: string,
  gameId: string,
  score: number,
  xpEarned: number,
  timeSpent: number,
  accuracy: number
): Promise<void> {
  await api(`/api/game`, {
    method: "POST",
    body: JSON.stringify({
      studentId,
      gameId,
      score,
      xpEarned,
      timeSpent,
      accuracy,
    }),
  });
}

export async function masterVocabulary(
  studentId: string,
  vocabId: string
): Promise<void> {
  await api(`/api/game`, {
    method: "PUT",
    body: JSON.stringify({ action: "masterVocabulary", studentId, vocabId }),
  });
}

export async function awardBadge(
  studentId: string,
  badge: Badge
): Promise<void> {
  await api(`/api/game`, {
    method: "PUT",
    body: JSON.stringify({ action: "awardBadge", studentId, badge }),
  });
}

export async function updateStreak(studentId: string): Promise<void> {
  await api(`/api/game`, {
    method: "PUT",
    body: JSON.stringify({ action: "updateStreak", studentId }),
  });
}

// ─── Feedback Functions ──────────────────────────────────────────────────────

export async function getAllFeedback(): Promise<Feedback[]> {
  return api<Feedback[]>("/api/feedback");
}

export async function getStudentFeedback(studentId: string): Promise<Feedback[]> {
  return api<Feedback[]>(`/api/feedback?studentId=${studentId}`);
}

export async function createFeedback(fb: Feedback): Promise<void> {
  await api("/api/feedback", { method: "POST", body: JSON.stringify(fb) });
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  return api<LeaderboardEntry[]>("/api/students?leaderboard=true");
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface ClassAnalytics {
  totalStudents: number;
  totalClasses: number;
  averageXP: number;
  averageLevel: number;
  totalGamesCompleted: number;
  topPerformers: Student[];
  studentsNeedingHelp: Student[];
  levelDistribution: { level: number; count: number }[];
}

export async function getClassAnalytics(
  teacherId: string
): Promise<ClassAnalytics> {
  return api<ClassAnalytics>(`/api/analytics?teacherId=${teacherId}`);
}

// ─── Custom Levels ───────────────────────────────────────────────────────────

export async function getCustomLevels(): Promise<CustomLevel[]> {
  return api<CustomLevel[]>("/api/levels?custom=true");
}

export async function getCustomLevelsByTeacher(
  teacherId: string
): Promise<CustomLevel[]> {
  return api<CustomLevel[]>(`/api/levels?teacherId=${teacherId}`);
}

export async function createCustomLevel(level: CustomLevel): Promise<void> {
  await api("/api/levels", { method: "POST", body: JSON.stringify(level) });
}

export async function updateCustomLevel(updated: CustomLevel): Promise<void> {
  await api(`/api/levels/${updated.id}`, {
    method: "PUT",
    body: JSON.stringify(updated),
  });
}

export async function deleteCustomLevel(id: number): Promise<void> {
  await api(`/api/levels/${id}`, { method: "DELETE" });
}

/** Returns built-in levels + all teacher-created custom levels, sorted by id */
export async function getAllLevels(): Promise<Level[]> {
  const custom = await getCustomLevels();
  return [...builtInLevels, ...custom].sort((a, b) => a.id - b.id);
}

/** Get vocabulary for any level (built-in or custom) */
export async function getVocabForLevel(
  levelId: number
): Promise<VocabularyWord[]> {
  const custom = await getCustomLevels();
  const customLevel = custom.find((l) => l.id === levelId);
  if (customLevel) return customLevel.vocabulary;
  return allVocabulary.filter((v) => v.level === levelId);
}

/** Generate a safe numeric ID for a new custom level (max existing + 1) */
export async function nextCustomLevelId(): Promise<number> {
  const all = await getAllLevels();
  return all.length > 0 ? Math.max(...all.map((l) => l.id)) + 1 : 6;
}

// Re-export Level type for convenience
export type { Level, VocabularyWord };
