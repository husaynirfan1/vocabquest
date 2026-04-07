"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Gamepad2,
  MessageSquare,
  LogOut,
  Menu,
  X,
  School,
  User,
  Moon,
  Sun,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TeacherOverview } from "./TeacherOverview";
import { ClassManagement } from "./ClassManagement";
import { LevelManagement } from "./LevelManagement";
import { StudentManagement } from "./StudentManagement";
import { ProgressAnalytics } from "./ProgressAnalytics";
import { GameMonitoring } from "./GameMonitoring";
import { FeedbackSection } from "./FeedbackSection";
import type { SessionUser } from "@/types";

const menuItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "classes", label: "Classes", icon: GraduationCap },
  { id: "students", label: "Students", icon: Users },
  { id: "levels", label: "Levels", icon: BookOpen },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "games", label: "Game Monitor", icon: Gamepad2 },
  { id: "feedback", label: "Feedback", icon: MessageSquare },
];

interface Props {
  user: SessionUser;
}

export function TeacherDashboard({ user }: Props) {
  const { isDark, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [teacher, setTeacher] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/students/${user.id}`)
      .then((r) => r.json())
      .then(setTeacher);
  }, [user.id]);

  const renderSection = () => {
    if (!teacher) return null;
    switch (activeSection) {
      case "overview":
        return <TeacherOverview teacher={teacher} />;
      case "classes":
        return <ClassManagement teacher={teacher} />;
      case "levels":
        return <LevelManagement teacher={teacher} />;
      case "students":
        return <StudentManagement teacher={teacher} />;
      case "analytics":
        return <ProgressAnalytics teacher={teacher} />;
      case "games":
        return <GameMonitoring teacher={teacher} />;
      case "feedback":
        return <FeedbackSection teacher={teacher} />;
      default:
        return <TeacherOverview teacher={teacher} />;
    }
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ duration: 0.3 }}
        className="fixed lg:relative z-50 w-72 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col"
      >
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-purple rounded-xl flex items-center justify-center">
                <School className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                  VocabQuest
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Teacher Portal
                </p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full gradient-purple flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 flex-shrink-0"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-white" />
              ) : (
                <Moon className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  activeSection === item.id
                    ? "bg-violet-100 text-violet-700 font-medium dark:bg-violet-900/50 dark:text-violet-300"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <Avatar className="w-10 h-10">
              <AvatarImage src={teacher?.avatar} />
              <AvatarFallback className="gradient-purple text-white">
                {teacher?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                {teacher?.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {teacher?.className}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full mt-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {menuItems.find((item) => item.id === activeSection)?.label}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {teacher?.schoolName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-violet-50 dark:bg-violet-900/30 rounded-lg">
              <User className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
                {teacher?.className || "Teacher"}
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderSection()}
          </motion.div>
        </div>
      </main>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
