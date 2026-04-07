"use client";

import { motion } from 'framer-motion';
import {
  Trophy,
  Star,
  Zap,
  Target,
  Flame,
  Crown,
  Sparkles,
  Lock,
  CheckCircle2
} from 'lucide-react';
import type { Student } from '@/types';
import { badges } from '@/data/vocabulary';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface BadgesSectionProps {
  student: Student;
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

const getBadgeIcon = (iconName: string) => {
  switch (iconName) {
    case 'Sparkles':
      return Sparkles;
    case 'Zap':
      return Zap;
    case 'Target':
      return Target;
    case 'Trophy':
      return Trophy;
    case 'Flame':
      return Flame;
    case 'Star':
      return Star;
    case 'Crown':
      return Crown;
    case 'BookOpen':
      return Star;
    default:
      return Trophy;
  }
};

export function BadgesSection({ student }: BadgesSectionProps) {
  const earnedBadgeIds = student.badges.map(b => b.id);

  const getBadgeProgress = (badge: typeof badges[0]) => {
    switch (badge.type) {
      case 'xp':
        return Math.min((student.totalXP / badge.requirement) * 100, 100);
      case 'streak':
        return Math.min((student.streak / badge.requirement) * 100, 100);
      case 'level':
        return Math.min((student.currentLevel / badge.requirement) * 100, 100);
      case 'completion':
        return Math.min((student.vocabularyMastered.length / badge.requirement) * 100, 100);
      default:
        return 0;
    }
  };

  const getProgressText = (badge: typeof badges[0]) => {
    switch (badge.type) {
      case 'xp':
        return `${student.totalXP}/${badge.requirement} XP`;
      case 'streak':
        return `${student.streak}/${badge.requirement} days`;
      case 'level':
        return `Level ${student.currentLevel}/${badge.requirement}`;
      case 'completion':
        return `${student.vocabularyMastered.length}/${badge.requirement} words`;
      default:
        return '';
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
          Your Badges Collection 🏆
        </h2>
        <p className="text-gray-500">
          Collect badges by completing challenges and reaching milestones!
        </p>
      </motion.div>

      {/* Stats Overview */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-violet-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Trophy className="w-8 h-8 text-yellow-300" />
                </div>
                <p className="text-3xl font-bold">{student.badges.length}</p>
                <p className="text-sm text-white/80">Badges Earned</p>
              </div>
              <div className="hidden sm:block w-px h-20 bg-white/20" />
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Target className="w-8 h-8 text-green-300" />
                </div>
                <p className="text-3xl font-bold">
                  {Math.round((student.badges.length / badges.length) * 100)}%
                </p>
                <p className="text-sm text-white/80">Collection Complete</p>
              </div>
              <div className="hidden sm:block w-px h-20 bg-white/20" />
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Star className="w-8 h-8 text-yellow-300" />
                </div>
                <p className="text-3xl font-bold">{badges.length - student.badges.length}</p>
                <p className="text-sm text-white/80">Badges to Unlock</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Badges Grid */}
      <motion.div variants={itemVariants}>
        <h3 className="font-bold text-lg text-gray-900 mb-4">All Badges</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {badges.map((badge, index) => {
            const isEarned = earnedBadgeIds.includes(badge.id);
            const earnedBadge = student.badges.find(b => b.id === badge.id);
            const Icon = getBadgeIcon(badge.icon);

            return (
              <motion.div
                key={badge.id}
                variants={itemVariants}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={`h-full transition-all duration-300 ${
                    isEarned
                      ? 'border-2 border-yellow-300 shadow-lg'
                      : 'opacity-70 grayscale'
                  }`}
                >
                  <CardContent className="p-5">
                    {/* Badge Icon */}
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                          isEarned ? '' : 'bg-gray-100'
                        }`}
                        style={{ backgroundColor: isEarned ? `${badge.color}20` : undefined }}
                      >
                        <Icon
                          className="w-7 h-7"
                          style={{ color: isEarned ? badge.color : '#9ca3af' }}
                        />
                      </div>
                      {isEarned ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <Lock className="w-5 h-5 text-gray-400" />
                      )}
                    </div>

                    {/* Badge Info */}
                    <h4 className="font-bold text-gray-900 mb-1">{badge.name}</h4>
                    <p className="text-sm text-gray-500 mb-3">{badge.description}</p>

                    {/* Progress or Earned Date */}
                    {isEarned ? (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <Star className="w-4 h-4" />
                        <span>
                          Earned {earnedBadge?.earnedAt
                            ? new Date(earnedBadge.earnedAt).toLocaleDateString()
                            : ''}
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Progress</span>
                          <span className="font-medium text-gray-700">
                            {getProgressText(badge)}
                          </span>
                        </div>
                        <Progress value={getBadgeProgress(badge)} className="h-1.5" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Achievements */}
      {student.badges.length > 0 && (
        <motion.div variants={itemVariants}>
          <h3 className="font-bold text-lg text-gray-900 mb-4">Recent Achievements</h3>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[...student.badges]
                  .sort((a, b) => new Date(b.earnedAt || 0).getTime() - new Date(a.earnedAt || 0).getTime())
                  .slice(0, 5)
                  .map((badge, index) => {
                    const Icon = getBadgeIcon(badge.icon);
                    return (
                      <motion.div
                        key={badge.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                      >
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${badge.color}20` }}
                        >
                          <Icon className="w-6 h-6" style={{ color: badge.color }} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-gray-100">{badge.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{badge.description}</p>
                        </div>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {badge.earnedAt ? new Date(badge.earnedAt).toLocaleDateString() : ''}
                        </span>
                      </motion.div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Motivation */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-yellow-100" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">Keep Earning! ✨</h3>
                <p className="text-white/80">
                  Complete more games and maintain your streak to unlock all badges!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
