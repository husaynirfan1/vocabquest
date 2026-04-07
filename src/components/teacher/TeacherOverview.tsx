"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  TrendingUp,
  Gamepad2,
  Award,
  ArrowUpRight,
  Clock,
  GraduationCap,
} from "lucide-react";
import { getClassAnalytics, type ClassAnalytics } from "@/services/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Teacher } from "@/types";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function TeacherOverview({ teacher }: { teacher: Teacher }) {
  const [analytics, setAnalytics] = useState<ClassAnalytics | null>(null);

  useEffect(() => {
    getClassAnalytics(teacher.id).then(setAnalytics);
  }, [teacher.id]);

  const statsCards = [
    { title: "Total Students", value: analytics?.totalStudents || 0, icon: Users, color: "bg-blue-500", trend: "Active", trendUp: true },
    { title: "Total Classes", value: analytics?.totalClasses || 0, icon: GraduationCap, color: "bg-violet-500", trend: "Grouped", trendUp: true },
    { title: "Games Completed", value: analytics?.totalGamesCompleted || 0, icon: Gamepad2, color: "bg-purple-500", trend: "Total", trendUp: true },
    { title: "Badges Earned", value: analytics?.topPerformers.reduce((acc, s: any) => acc + (s.badges?.length || 0), 0) || 0, icon: Award, color: "bg-yellow-500", trend: "Earned", trendUp: true },
  ];

  const progressData = [
    { day: "Mon", xp: 450 }, { day: "Tue", xp: 620 }, { day: "Wed", xp: 580 },
    { day: "Thu", xp: 750 }, { day: "Fri", xp: 890 }, { day: "Sat", xp: 420 }, { day: "Sun", xp: 380 },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl gradient-purple p-8 text-white">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {teacher?.name}!</h2>
          <p className="text-white/80 text-lg">Here&apos;s what&apos;s happening in your class today.</p>
        </div>
        <div className="absolute right-0 top-0 w-64 h-full opacity-20">
          <div className="absolute right-10 top-10 w-32 h-32 bg-white rounded-full blur-3xl" />
          <div className="absolute right-20 bottom-10 w-24 h-24 bg-yellow-300 rounded-full blur-2xl" />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                    <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                    <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                      <ArrowUpRight className="w-4 h-4" />
                      <span>{stat.trend}</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-violet-600" />
                Class Activity This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip contentStyle={{ backgroundColor: "white", border: "none", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                    <Line type="monotone" dataKey="xp" stroke="#7c3aed" strokeWidth={3} dot={{ fill: "#7c3aed", strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: "#7c3aed" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.topPerformers.slice(0, 5).map((student: any, index: number) => (
                  <div key={student.id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? "bg-yellow-100 text-yellow-700" : index === 1 ? "bg-gray-100 text-gray-700" : index === 2 ? "bg-orange-100 text-orange-700" : "bg-violet-50 text-violet-700"}`}>
                      {index + 1}
                    </div>
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback className="bg-violet-100 text-violet-700">{student.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{student.name}</p>
                      <p className="text-xs text-gray-500">Level {student.currentLevel}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-violet-600">{student.totalXP}</p>
                      <p className="text-xs text-gray-500">XP</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader><CardTitle>Level Distribution</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.levelDistribution.map((item) => (
                  <div key={item.level}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Level {item.level}</span>
                      <span className="text-sm text-gray-500">{item.count} students</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(item.count / (analytics?.totalStudents || 1)) * 100}%` }} transition={{ duration: 0.8, delay: item.level * 0.1 }} className="h-full rounded-full" style={{ backgroundColor: ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6"][item.level - 1] }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <Clock className="w-5 h-5" />Students Needing Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics?.studentsNeedingHelp.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">All students are doing great!</p>
                ) : (
                  analytics?.studentsNeedingHelp.map((student: any) => (
                    <div key={student.id} className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={student.avatar} />
                        <AvatarFallback className="bg-orange-200 text-orange-700">{student.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900">{student.name}</p>
                        <p className="text-xs text-orange-600">Level {student.currentLevel} - {student.totalXP} XP</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
