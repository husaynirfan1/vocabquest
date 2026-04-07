"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  Trophy,
  Target,
  Flame,
  ArrowRight,
  BookOpen,
  Gamepad2
} from 'lucide-react';
import type { Student, Class } from '@/types';
import { levels } from '@/data/vocabulary';
import { getClassById } from '@/services/database';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { GraduationCap } from 'lucide-react';

interface StudentOverviewProps {
  student: Student;
  onUpdate?: () => void;
  onNavigate?: (section: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function StudentOverview({ student, onUpdate: _onUpdate, onNavigate }: StudentOverviewProps) {
  const [studentClass, setStudentClass] = useState<Class | undefined>(undefined);

  useEffect(() => {
    if (student.classId) {
      getClassById(student.classId).then((cls) => {
        setStudentClass(cls);
      });
    }
  }, [student.classId]);

  const currentLevel = levels.find(l => l.id === student.currentLevel);
  const nextLevel = levels.find(l => l.id === student.currentLevel + 1);
  const xpToNextLevel = nextLevel ? nextLevel.requiredXP - student.totalXP : 0;
  const progressPercent = nextLevel
    ? Math.min((student.totalXP / nextLevel.requiredXP) * 100, 100)
    : 100;

  const recentBadges = student.badges.slice(-3);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Hero Welcome Banner */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl gradient-purple p-6 lg:p-10 text-white"
      >
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <Avatar className="w-24 h-24 lg:w-32 lg:h-32 border-4 border-white/30">
              <AvatarImage src={student.avatar} />
              <AvatarFallback className="bg-white text-violet-600 text-3xl lg:text-4xl font-bold">
                {student.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </motion.div>

          <div className="text-center lg:text-left flex-1">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl lg:text-4xl font-bold mb-2"
            >
              Welcome back, {student.name.split(' ')[0]}! 👋
            </motion.h2>
            {studentClass && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold mb-2 bg-white/20 backdrop-blur"
                style={{ color: 'white' }}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                {studentClass.name}
              </motion.div>
            )}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white/80 text-lg mb-4"
            >
              You're doing amazing! Keep up the great work on your vocabulary journey.
            </motion.p>

            {/* Progress to Next Level */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/10 backdrop-blur rounded-xl p-4"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progress to Level {student.currentLevel + 1}</span>
                <span className="text-sm font-bold">{Math.round(progressPercent)}%</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-white rounded-full"
                />
              </div>
              <p className="text-sm text-white/70 mt-2">
                {xpToNextLevel > 0 ? `${xpToNextLevel} XP needed for next level` : 'Max level reached! 🎉'}
              </p>
            </motion.div>
          </div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="flex lg:flex-col gap-3"
          >
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center min-w-[80px]">
              <Star className="w-6 h-6 mx-auto mb-1 text-yellow-300" />
              <p className="text-xl font-bold">{student.totalXP}</p>
              <p className="text-xs text-white/70">XP</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center min-w-[80px]">
              <Flame className="w-6 h-6 mx-auto mb-1 text-orange-300" />
              <p className="text-xl font-bold">{student.streak}</p>
              <p className="text-xs text-white/70">Streak</p>
            </div>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute right-0 top-0 w-64 h-full opacity-20 pointer-events-none">
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute right-10 top-10 w-20 h-20 bg-white rounded-full blur-2xl"
          />
          <motion.div
            animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute right-20 bottom-10 w-16 h-16 bg-yellow-300 rounded-full blur-xl"
          />
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-hover">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-violet-100 dark:bg-violet-900/40 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 lg:w-6 lg:h-6 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-xl lg:text-2xl font-bold text-violet-700">{student.currentLevel}</p>
                <p className="text-xs lg:text-sm text-gray-500">Current Level</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 lg:w-6 lg:h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xl lg:text-2xl font-bold text-green-700">{student.vocabularyMastered.length}</p>
                <p className="text-xs lg:text-sm text-gray-500">Words Learned</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xl lg:text-2xl font-bold text-blue-700">{student.completedGames.length}</p>
                <p className="text-xs lg:text-sm text-gray-500">Games Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-yellow-100 dark:bg-yellow-900/40 rounded-xl flex items-center justify-center">
                <Trophy className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-xl lg:text-2xl font-bold text-yellow-700">{student.badges.length}</p>
                <p className="text-xs lg:text-sm text-gray-500">Badges Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Current Level & Recent Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Level Card */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-4">Current Adventure</h3>
              {currentLevel && (
                <div className="flex items-start gap-4">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
                    style={{ backgroundColor: `${currentLevel.color}20` }}
                  >
                    {currentLevel.id === 1 && '🚨'}
                    {currentLevel.id === 2 && '📜'}
                    {currentLevel.id === 3 && '🏕️'}
                    {currentLevel.id === 4 && '💼'}
                    {currentLevel.id === 5 && '🚗'}
                  </div>
                  <div className="flex-1">
                    <Badge
                      className="mb-2 text-white"
                      style={{ backgroundColor: currentLevel.color }}
                    >
                      Level {currentLevel.id}
                    </Badge>
                    <h4 className="font-bold text-xl text-gray-900">{currentLevel.title}</h4>
                    <p className="text-gray-500 text-sm mt-1">{currentLevel.description}</p>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Level Progress</span>
                        <span className="font-medium text-gray-900">
                          {student.completedGames.filter(g => g.includes(`l${currentLevel.id}`)).length}/5 games
                        </span>
                      </div>
                      <Progress
                        value={(student.completedGames.filter(g => g.includes(`l${currentLevel.id}`)).length / 5) * 100}
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Badges */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-gray-900">Recent Badges</h3>
                {student.badges.length > 0 && (
                  <Badge variant="outline" className="text-violet-600">
                    {student.badges.length} total
                  </Badge>
                )}
              </div>

              {recentBadges.length > 0 ? (
                <div className="space-y-3">
                  {recentBadges.map((badge, index) => (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${badge.color}20` }}
                      >
                        <Trophy className="w-6 h-6" style={{ color: badge.color }} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-gray-100">{badge.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{badge.description}</p>
                      </div>
                      {badge.earnedAt && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(badge.earnedAt).toLocaleDateString()}
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Trophy className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No badges yet. Keep playing to earn them!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-lg text-gray-900 mb-4">Continue Learning</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button onClick={() => onNavigate?.('games')} className="flex items-center gap-4 p-4 bg-violet-50 dark:bg-violet-900/40 rounded-xl hover:bg-violet-100 dark:hover:bg-violet-900/60 transition-colors text-left">
                <div className="w-12 h-12 bg-violet-500 rounded-xl flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 dark:text-gray-100">Play Games</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Practice your vocabulary</p>
                </div>
                <ArrowRight className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </button>

              <button onClick={() => onNavigate?.('levels')} className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/40 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/60 transition-colors text-left">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 dark:text-gray-100">Review Words</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{student.vocabularyMastered.length} words learned</p>
                </div>
                <ArrowRight className="w-5 h-5 text-green-600 dark:text-green-400" />
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
