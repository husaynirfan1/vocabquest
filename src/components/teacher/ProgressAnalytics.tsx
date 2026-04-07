"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Clock,
  Award,
  BookOpen,
  GraduationCap,
} from 'lucide-react';
import { getTeacherStudents, getTeacherClasses } from '@/services/database';
import type { Student, Class } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const COLORS = ['#7c3aed', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444'];

export function ProgressAnalytics({ teacher }: { teacher: any }) {
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<string>('all');

  useEffect(() => {
    if (teacher) {
      getTeacherStudents(teacher.id).then(setAllStudents);
      getTeacherClasses(teacher.id).then(setClasses);
    }
  }, [teacher]);

  // Apply class filter first, then student filter
  const students: Student[] =
    selectedClass === 'all'
      ? allStudents
      : allStudents.filter((s) => s.classId === selectedClass);

  // Reset student filter when class changes
  const handleClassChange = (val: string) => {
    setSelectedClass(val);
    setSelectedStudent('all');
  };

  // Stats computed from class-filtered students
  const averageXP = students.length
    ? students.reduce((sum, s) => sum + s.totalXP, 0) / students.length
    : 0;
  const totalGamesCompleted = students.reduce((sum, s) => sum + s.completedGames.length, 0);
  const averageLevel = students.length
    ? students.reduce((sum, s) => sum + s.currentLevel, 0) / students.length
    : 0;

  const selectedStudentData =
    selectedStudent !== 'all' ? students.find((s) => s.id === selectedStudent) : null;

  // Vocabulary mastery by level — computed from filtered students
  const vocabularyData = [1, 2, 3, 4, 5].map((lvl) => {
    const prefix = `l${lvl}-`;
    const mastered = students.reduce(
      (sum, s) => sum + s.vocabularyMastered.filter((v) => v.startsWith(prefix)).length,
      0
    );
    return { level: `Level ${lvl}`, mastered, total: students.length * 10 || 10 };
  });

  // Badge distribution — computed from filtered students
  const badgeCounts: Record<string, number> = {};
  students.forEach((s) =>
    s.badges.forEach((b) => {
      badgeCounts[b.name] = (badgeCounts[b.name] || 0) + 1;
    })
  );
  const badgeData = Object.entries(badgeCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Game performance — computed from filtered students
  const gamePerformanceData = [
    { name: 'Word Match', id: 'word-match' },
    { name: 'Fill Blanks', id: 'fill-blanks' },
    { name: 'Picture Match', id: 'picture-match' },
    { name: 'Spelling', id: 'spelling' },
    { name: 'Quiz', id: 'quiz' },
  ].map(({ name, id }) => ({
    name,
    completed: students.reduce(
      (sum, s) => sum + s.completedGames.filter((g) => g.includes(id)).length,
      0
    ),
    avgScore: 70 + Math.floor(Math.random() * 20), // mock avg score
  }));

  // Weekly activity — mock (relative to student count)
  const weeklyActivityData = [
    { day: 'Mon', students: Math.round(students.length * 0.72), games: Math.round(students.length * 1.8) },
    { day: 'Tue', students: Math.round(students.length * 0.88), games: Math.round(students.length * 2.5) },
    { day: 'Wed', students: Math.round(students.length * 0.80), games: Math.round(students.length * 2.3) },
    { day: 'Thu', students: Math.round(students.length * 0.96), games: Math.round(students.length * 2.8) },
    { day: 'Fri', students: Math.round(students.length * 1.0), games: Math.round(students.length * 3.1) },
    { day: 'Sat', students: Math.round(students.length * 0.60), games: Math.round(students.length * 1.3) },
    { day: 'Sun', students: Math.round(students.length * 0.48), games: Math.round(students.length * 1.1) },
  ];

  const activeClass = classes.find((c) => c.id === selectedClass);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Progress Analytics</h2>
          <p className="text-gray-500 dark:text-gray-400">Track student performance and learning outcomes</p>
        </div>

        {/* Filters row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Class filter */}
          <Select value={selectedClass} onValueChange={handleClassChange}>
            <SelectTrigger className="w-44">
              <GraduationCap className="w-4 h-4 mr-1 text-violet-500 flex-shrink-0" />
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: c.color }} />
                    {c.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Student filter */}
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Students" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              {students.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Active class indicator */}
      {activeClass && (
        <motion.div variants={itemVariants}>
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold w-fit"
            style={{ backgroundColor: activeClass.color }}
          >
            <GraduationCap className="w-4 h-4" />
            Filtering: {activeClass.name} — {students.length} student{students.length !== 1 ? 's' : ''}
          </div>
        </motion.div>
      )}

      {/* Selected Student Card */}
      {selectedStudentData && (
        <motion.div variants={itemVariants}>
          <Card className="border-violet-200 bg-violet-50/50 dark:bg-violet-900/10 dark:border-violet-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={selectedStudentData.avatar} />
                  <AvatarFallback className="bg-violet-200 text-violet-700 text-2xl">
                    {selectedStudentData.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedStudentData.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">{selectedStudentData.email}</p>
                  <div className="flex flex-wrap gap-6">
                    {[
                      { label: 'Total XP', value: selectedStudentData.totalXP, color: 'violet', icon: TrendingUp },
                      { label: 'Current Level', value: selectedStudentData.currentLevel, color: 'blue', icon: Target },
                      { label: 'Words Mastered', value: selectedStudentData.vocabularyMastered.length, color: 'green', icon: BookOpen },
                      { label: 'Badges', value: selectedStudentData.badges.length, color: 'yellow', icon: Award },
                    ].map(({ label, value, color, icon: Icon }) => (
                      <div key={label} className="flex items-center gap-2">
                        <div className={`w-10 h-10 bg-${color}-100 dark:bg-${color}-900/30 rounded-lg flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
                        </div>
                        <div>
                          <p className={`text-2xl font-bold text-${color}-700 dark:text-${color}-300`}>{value}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats Overview — shown when not filtered to individual student */}
      {!selectedStudentData && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Avg XP', value: Math.round(averageXP), color: 'violet', icon: TrendingUp },
            { label: 'Games Completed', value: totalGamesCompleted, color: 'blue', icon: BarChart3 },
            { label: 'Students', value: students.length, color: 'green', icon: Users },
            { label: 'Avg Level', value: Math.round(averageLevel * 10) / 10, color: 'yellow', icon: Target },
          ].map(({ label, value, color, icon: Icon }) => (
            <Card key={label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                    <p className={`text-3xl font-bold text-${color}-600 dark:text-${color}-400`}>{value}</p>
                  </div>
                  <div className={`w-12 h-12 bg-${color}-100 dark:bg-${color}-900/30 rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-violet-600" />
                Weekly Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyActivityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="students" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Active Students" />
                    <Bar dataKey="games" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Games Played" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Game Performance */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Game Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gamePerformanceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" stroke="#888" />
                    <YAxis dataKey="name" type="category" stroke="#888" width={100} />
                    <Tooltip contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="completed" fill="#22c55e" radius={[0, 4, 4, 0]} name="Completed" />
                    <Bar dataKey="avgScore" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Avg Score" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Vocabulary Mastery */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-green-600" />
                Vocabulary Mastery by Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vocabularyData.map((item, index) => (
                  <div key={item.level}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.level}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {item.mastered}/{item.total} words
                      </span>
                    </div>
                    <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.total > 0 ? (item.mastered / item.total) * 100 : 0}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: COLORS[index] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Badge Distribution */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-600" />
                Badge Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {badgeData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={badgeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {badgeData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                  No badges earned yet in this view
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
