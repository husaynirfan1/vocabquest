"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Lock,
  Unlock,
  Star,
  CheckCircle2,
  ArrowRight,
  Trophy,
  Flame
} from 'lucide-react';
import type { Student, Level } from '@/types';
import { unlockLevel, getAllLevels } from '@/services/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface LevelMapProps {
  student: Student;
  onUpdate: () => void;
  onNavigate: (section: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};



export function LevelMap({ student, onUpdate, onNavigate }: LevelMapProps) {
  const [levels, setLevels] = useState<Level[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  useEffect(() => {
    getAllLevels().then(setLevels);
  }, []);

  const isLevelUnlocked = (levelId: number) => {
    return student.unlockedLevels.includes(levelId);
  };

  const isLevelCompleted = (levelId: number) => {
    const levelGames = student.completedGames.filter(g => g.includes(`l${levelId}`));
    return levelGames.length >= 5;
  };

  const getLevelProgress = (levelId: number) => {
    const levelGames = student.completedGames.filter(g => g.includes(`l${levelId}`));
    return (levelGames.length / 5) * 100;
  };

  const handleUnlockLevel = async (levelId: number) => {
    const level = levels.find(l => l.id === levelId);
    if (!level) return;

    if (student.totalXP >= level.requiredXP) {
      await unlockLevel(student.id, levelId);
      toast.success(`Level ${levelId} unlocked! 🎉`);
      onUpdate();
    } else {
      toast.error(`You need ${level.requiredXP} XP to unlock this level!`);
    }
  };

  const getLevelIcon = (levelId: number) => {
    switch (levelId) {
      case 1: return '🚨';
      case 2: return '📜';
      case 3: return '🏕️';
      case 4: return '💼';
      case 5: return '🚗';
      default: return '📚';
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          Your Adventure Path 🗺️
        </h2>
        <p className="text-gray-500">
          Complete levels to unlock new vocabulary adventures!
        </p>
      </motion.div>

      {/* Progress Overview */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500" />
                <span className="text-sm text-gray-600">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-violet-500" />
                <span className="text-sm text-gray-600">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-300" />
                <span className="text-sm text-gray-600">Locked</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Level Path */}
      <div className="relative">
        {/* Connecting Line (Desktop) */}
        <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0" />

        {/* Levels Grid */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 relative z-10"
        >
          {levels.map((level, index) => {
            const unlocked = isLevelUnlocked(level.id);
            const completed = isLevelCompleted(level.id);
            const progress = getLevelProgress(level.id);
            const canUnlock = student.totalXP >= level.requiredXP && !unlocked;

            return (
              <motion.div
                key={level.id}
                variants={itemVariants}
                className="relative"
              >
                <Card
                  className={`h-full transition-all duration-500 ${
                    unlocked
                      ? 'cursor-pointer hover:shadow-xl hover:-translate-y-2'
                      : 'opacity-70'
                  }`}
                  onClick={() => unlocked && setSelectedLevel(level.id)}
                >
                  <CardContent className="p-6">
                    {/* Level Header */}
                    <div className="flex items-center justify-between mb-4">
                      <Badge
                        className={`text-white ${
                          completed ? 'bg-green-500' :
                          unlocked ? 'bg-violet-500' : 'bg-gray-400'
                        }`}
                      >
                        Level {level.id}
                      </Badge>
                      {completed && (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      )}
                      {!unlocked && (
                        <Lock className="w-5 h-5 text-gray-400" />
                      )}
                    </div>

                    {/* Level Icon */}
                    <div
                      className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-4xl mb-4 transition-all ${
                        unlocked
                          ? 'bg-gradient-to-br from-violet-100 to-purple-100'
                          : 'bg-gray-100'
                      }`}
                    >
                      {getLevelIcon(level.id)}
                    </div>

                    {/* Level Info */}
                    <h3 className="font-bold text-lg text-center text-gray-900 mb-1">
                      {level.title}
                    </h3>
                    <p className="text-sm text-gray-500 text-center mb-4 line-clamp-2">
                      {level.description}
                    </p>

                    {/* Progress or Unlock Requirement */}
                    {unlocked ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Progress</span>
                          <span className="font-medium text-gray-900">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-center text-gray-500">
                          {student.completedGames.filter(g => g.includes(`l${level.id}`)).length}/5 games
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{level.requiredXP} XP needed</span>
                        </div>
                        {canUnlock && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnlockLevel(level.id);
                            }}
                            className="w-full gradient-purple text-white"
                          >
                            <Unlock className="w-4 h-4 mr-1" />
                            Unlock
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Arrow Connector (Desktop) */}
                {index < levels.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-20">
                    <ArrowRight className="w-6 h-6 text-gray-300" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Selected Level Details */}
      {selectedLevel && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          {(() => {
            const level = levels.find(l => l.id === selectedLevel);
            if (!level) return null;

            return (
              <Card className="border-2 border-violet-200">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div
                      className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl flex-shrink-0"
                      style={{ backgroundColor: `${level.color}20` }}
                    >
                      {getLevelIcon(level.id)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-gray-900">{level.title}</h3>
                        <Badge style={{ backgroundColor: level.color }}>
                          Level {level.id}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-4">{level.description}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {level.vocabulary.slice(0, 5).map((vocab) => (
                          <span
                            key={vocab.id}
                            className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                          >
                            {vocab.word}
                          </span>
                        ))}
                        {level.vocabulary.length > 5 && (
                          <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-500">
                            +{level.vocabulary.length - 5} more
                          </span>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <Button
                          className="gradient-purple text-white"
                          onClick={() => {
                            setSelectedLevel(null);
                            onNavigate('games');
                          }}
                        >
                          <Flame className="w-4 h-4 mr-2" />
                          Start Playing
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedLevel(null)}
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })()}
        </motion.div>
      )}

      {/* Motivation Card */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-violet-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <Trophy className="w-8 h-8 text-yellow-300" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">Keep Going! 🌟</h3>
                <p className="text-white/80">
                  You're making great progress! Complete more games to unlock new levels and earn badges.
                </p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-3xl font-bold">{student.totalXP}</p>
                <p className="text-sm text-white/70">Total XP</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
