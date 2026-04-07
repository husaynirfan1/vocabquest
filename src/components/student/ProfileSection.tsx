"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Star,
  Trophy,
  Flame,
  Target,
  Calendar,
  Gamepad2,
  BookOpen,
  Edit2,
  CheckCircle2,
  Clock,
  Lock,
} from 'lucide-react';
import type { Student } from '@/types';
import { updateUser } from '@/services/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface ProfileSectionProps {
  student: Student;
  onUpdate: () => void;
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

export function ProfileSection({ student, onUpdate }: ProfileSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(student.name);
  const [email, setEmail] = useState(student.email);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSave = async () => {
    if (!name || !email) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    const updatedStudent: any = {
      ...student,
      name,
      email,
    };
    if (newPassword) {
      updatedStudent.password = newPassword;
    }

    await updateUser(updatedStudent);
    toast.success('Profile updated successfully!');
    setIsEditing(false);
    setNewPassword('');
    setConfirmPassword('');
    onUpdate();
  };

  const totalGamesPlayed = student.gameStats.length;
  const averageAccuracy = totalGamesPlayed > 0
    ? student.gameStats.reduce((acc, g) => acc + g.accuracy, 0) / totalGamesPlayed
    : 0;
  const totalTimeSpent = student.gameStats.reduce((acc, g) => acc + g.timeSpent, 0);

  // Format time spent
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Profile Header */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden">
          <div className="h-32 gradient-purple relative">
            <div className="absolute right-4 top-4">
              {!isEditing ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="bg-white/20 text-white hover:bg-white/30"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSave}
                  className="bg-white/20 text-white hover:bg-white/30"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Save
                </Button>
              )}
            </div>
          </div>
          <CardContent className="relative pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 mb-6 gap-4">
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                <AvatarImage src={student.avatar} />
                <AvatarFallback className="gradient-purple text-white text-4xl">
                  {student.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left flex-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="font-bold text-xl"
                    />
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email"
                      type="email"
                    />
                    <div className="flex gap-2 items-center pt-2">
                      <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <Input
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New password (optional)"
                        type="password"
                      />
                      <Input
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        type="password"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
                    <p className="text-gray-500 flex items-center justify-center sm:justify-start gap-1">
                      <Mail className="w-4 h-4" />
                      {student.email}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Level Badge */}
            <div className="flex justify-center sm:justify-start">
              <Badge className="gradient-purple text-white px-4 py-1 text-sm">
                <Target className="w-4 h-4 mr-1" />
                Level {student.currentLevel} Learner
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-violet-700">{student.totalXP}</p>
                <p className="text-xs text-gray-500">Total XP</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-orange-700">{student.streak}</p>
                <p className="text-xs text-gray-500">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-green-700">{totalGamesPlayed}</p>
                <p className="text-xs text-gray-500">Games Played</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-yellow-700">{student.badges.length}</p>
                <p className="text-xs text-gray-500">Badges</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learning Progress */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-violet-600" />
                Learning Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Vocabulary Mastered</span>
                  <span className="font-medium text-gray-900">
                    {student.vocabularyMastered.length} words
                  </span>
                </div>
                <Progress
                  value={(student.vocabularyMastered.length / 50) * 100}
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Levels Unlocked</span>
                  <span className="font-medium text-gray-900">
                    {student.unlockedLevels.length} / 5
                  </span>
                </div>
                <Progress
                  value={(student.unlockedLevels.length / 5) * 100}
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Games Completed</span>
                  <span className="font-medium text-gray-900">
                    {student.completedGames.length} / 25
                  </span>
                </div>
                <Progress
                  value={(student.completedGames.length / 25) * 100}
                  className="h-2"
                />
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Total Time Spent</span>
                  </div>
                  <span className="font-medium text-gray-900">{formatTime(totalTimeSpent)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Performance Stats */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div>
                  <p className="text-sm text-gray-500">Average Accuracy</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(averageAccuracy)}%
                  </p>
                </div>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Target className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div>
                  <p className="text-sm text-gray-500">Current Level</p>
                  <p className="text-2xl font-bold text-gray-900">
                    Level {student.currentLevel}
                  </p>
                </div>
                <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center">
                  <Star className="w-8 h-8 text-violet-600" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="text-lg font-bold text-gray-900">
                    {new Date(student.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {student.gameStats.length > 0 ? (
              <div className="space-y-3">
                {[...student.gameStats]
                  .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
                  .slice(0, 5)
                  .map((stat, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/40 rounded-lg flex items-center justify-center">
                          <Gamepad2 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {stat.gameId.split('-').slice(1).join(' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(stat.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-violet-600 dark:text-violet-400">+{stat.xpEarned} XP</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{stat.accuracy}% accuracy</p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Gamepad2 className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">No games played yet. Start learning!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
