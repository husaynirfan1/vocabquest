"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Gamepad2,
  Target,
  TrendingUp,
  AlertCircle,
  Timer,
  BarChart3,
  Clock,
  CheckCircle2,
  GraduationCap,
} from 'lucide-react';
import { getTeacherStudents, getTeacherClasses } from '@/services/database';
import type { Student, Class } from '@/types';
import { levels } from '@/data/vocabulary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const gameTypes = [
  { id: 'word-match', name: 'Word Match', icon: '🎯', color: 'bg-violet-500' },
  { id: 'fill-blanks', name: 'Fill Blanks', icon: '✏️', color: 'bg-blue-500' },
  { id: 'picture-match', name: 'Picture Match', icon: '🖼️', color: 'bg-green-500' },
  { id: 'spelling', name: 'Spelling', icon: '🔤', color: 'bg-yellow-500' },
  { id: 'quiz', name: 'Quiz', icon: '❓', color: 'bg-pink-500' },
];

// Mock recent activity with student names so we can filter later
const MOCK_ACTIVITY = [
  { student: 'Emma Wilson', game: 'Word Match', level: 1, score: 95, time: '2 min ago', accuracy: 100 },
  { student: 'Oliver Brown', game: 'Fill Blanks', level: 2, score: 88, time: '5 min ago', accuracy: 90 },
  { student: 'James Miller', game: 'Spelling', level: 3, score: 92, time: '12 min ago', accuracy: 95 },
  { student: 'Ava Garcia', game: 'Picture Match', level: 1, score: 78, time: '18 min ago', accuracy: 80 },
  { student: 'Sophia Lee', game: 'Quiz', level: 1, score: 85, time: '25 min ago', accuracy: 85 },
];

export function GameMonitoring({ teacher }: { teacher: any }) {
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('all');

  useEffect(() => {
    if (teacher) {
      getTeacherStudents(teacher.id).then(setAllStudents);
      getTeacherClasses(teacher.id).then(setClasses);
    }
  }, [teacher]);

  // Class-filtered students
  const students: Student[] =
    selectedClass === 'all'
      ? allStudents
      : allStudents.filter((s) => s.classId === selectedClass);

  // Stats — computed from filtered students
  const totalGamesCompleted = students.reduce((acc, s) => acc + s.completedGames.length, 0);
  const averageAccuracy =
    students.length > 0
      ? students.reduce(
          (acc, s) =>
            acc +
            s.gameStats.reduce((sum, g) => sum + g.accuracy, 0) / (s.gameStats.length || 1),
          0
        ) / students.length
      : 0;

  // Level stats — filtered
  const levelStats = levels.map((level) => {
    const studentsAtLevel = students.filter((s) => s.currentLevel >= level.id).length;
    return {
      ...level,
      studentsAtLevel,
      completionRate: students.length ? (studentsAtLevel / students.length) * 100 : 0,
    };
  });

  // Activity filtered by student names in selected class
  const studentNames = new Set(students.map((s) => s.name));
  const recentActivity =
    selectedClass === 'all'
      ? MOCK_ACTIVITY
      : MOCK_ACTIVITY.filter((a) => studentNames.has(a.student));

  const activeClass = classes.find((c) => c.id === selectedClass);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Class Filter Tabs */}
      <motion.div variants={itemVariants} className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-violet-500" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filter by Class</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'all', label: `All Classes (${allStudents.length})`, color: null },
            ...classes.map((c) => ({
              id: c.id,
              label: `${c.name} (${allStudents.filter((s) => s.classId === c.id).length})`,
              color: c.color,
            })),
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedClass(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedClass === tab.id
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {tab.color && (
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tab.color }} />
              )}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active class badge */}
        {activeClass && (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-white text-sm font-semibold w-fit"
            style={{ backgroundColor: activeClass.color }}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            {activeClass.name} — {students.length} student{students.length !== 1 ? 's' : ''}
          </div>
        )}
      </motion.div>

      {/* Overview Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Games Played</p>
                <p className="text-3xl font-bold text-violet-600 dark:text-violet-400">{totalGamesCompleted}</p>
              </div>
              <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Average Accuracy</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{Math.round(averageAccuracy)}%</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Time/Game</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">4.5m</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Timer className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Students</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{students.length}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Tabs */}
      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="levels">Level Progress</TabsTrigger>
          <TabsTrigger value="games">Game Types</TabsTrigger>
        </TabsList>

        {/* Recent Activity */}
        <TabsContent value="activity">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-violet-600" />
                  Recent Game Activity
                  {activeClass && (
                    <span
                      className="ml-2 px-2 py-0.5 rounded-full text-white text-xs font-semibold"
                      style={{ backgroundColor: activeClass.color }}
                    >
                      {activeClass.name}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <p className="text-center text-gray-400 dark:text-gray-500 py-8 text-sm">
                    No recent activity for this class
                  </p>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                      >
                        <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                          <Gamepad2 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-gray-100">{activity.student}</span>
                            <span className="text-gray-500 dark:text-gray-400">completed</span>
                            <Badge variant="outline" className="text-violet-600 border-violet-200">
                              {activity.game}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                            <span>Level {activity.level}</span>
                            <span>•</span>
                            <span>{activity.time}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-violet-600 dark:text-violet-400">{activity.score}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">pts</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{activity.accuracy}% accuracy</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Level Progress */}
        <TabsContent value="levels">
          <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4">
            {levelStats.map((level, index) => (
              <Card key={level.id}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${level.color}20` }}
                    >
                      {level.id === 1 && '🚨'}
                      {level.id === 2 && '📜'}
                      {level.id === 3 && '🏕️'}
                      {level.id === 4 && '💼'}
                      {level.id === 5 && '🚗'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-gray-100">{level.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {level.studentsAtLevel} / {students.length} students unlocked
                          </p>
                        </div>
                        <Badge className="text-white" style={{ backgroundColor: level.color }}>
                          {Math.round(level.completionRate)}%
                        </Badge>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${level.completionRate}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: level.color }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </TabsContent>

        {/* Game Types */}
        <TabsContent value="games">
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gameTypes.map((game, idx) => {
              const completedCount = students.reduce(
                (acc, s) => acc + s.completedGames.filter((g) => g.includes(game.id)).length,
                0
              );
              const avgScore = 75 + ((idx * 7) % 20); // stable pseudo-random per game type

              return (
                <Card key={game.id} className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 ${game.color} rounded-xl flex items-center justify-center text-2xl`}>
                        {game.icon}
                      </div>
                      <Badge variant="outline" className="text-gray-600 dark:text-gray-300">
                        {completedCount} play{completedCount !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">{game.name}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Avg. Score</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{avgScore}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${avgScore}%` }}
                          transition={{ duration: 0.8, delay: idx * 0.1 }}
                          className={`h-full rounded-full ${game.color}`}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Weak Areas Alert */}
      <motion.div variants={itemVariants}>
        <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-900/10 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <AlertCircle className="w-5 h-5" />
              Areas Needing Attention
              {activeClass && (
                <span
                  className="ml-1 px-2 py-0.5 rounded-full text-white text-xs font-semibold"
                  style={{ backgroundColor: activeClass.color }}
                >
                  {activeClass.name}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Spelling Challenge</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {students.filter((s) => s.currentLevel <= 2).length} students may be struggling
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Level 4 Vocabulary</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {students.filter((s) => s.currentLevel < 4).length} students not yet at level 4
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
