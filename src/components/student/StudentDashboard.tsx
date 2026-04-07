"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Gamepad2,
  Trophy,
  User,
  LogOut,
  Menu,
  Sparkles,
  Star,
  Zap,
  Moon,
  Sun
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useTheme } from '@/contexts/ThemeContext';
import { getStudentById, updateStreak } from '@/services/database';
import type { Student } from '@/types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StudentOverview } from './StudentOverview';
import { LevelMap } from './LevelMap';
import { GamesSection } from './GamesSection';
import { BadgesSection } from './BadgesSection';
import { ProfileSection } from './ProfileSection';

const menuItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'levels', label: 'Adventure', icon: Gamepad2 },
  { id: 'games', label: 'Games', icon: Sparkles },
  { id: 'badges', label: 'Badges', icon: Trophy },
  { id: 'profile', label: 'Profile', icon: User },
];

interface StudentDashboardProps {
  user: { id: string; name: string; email: string; role: string; image?: string };
}

export function StudentDashboard({ user }: StudentDashboardProps) {
  const { isDark, toggleTheme } = useTheme();
  const [student, setStudent] = useState<Student | null>(null);
  const [activeSection, setActiveSection] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user) {
      getStudentById(user.id).then((data) => {
        if (data) {
          setStudent(data);
          // Update streak on login
          updateStreak(data.id);
        }
      });
    }
  }, [user]);

  const refreshStudent = useCallback(() => {
    if (user) {
      getStudentById(user.id).then((data) => {
        if (data) {
          setStudent(data);
        }
      });
    }
  }, [user]);

  const renderSection = () => {
    if (!student) return null;

    switch (activeSection) {
      case 'home':
        return <StudentOverview student={student} onUpdate={refreshStudent} onNavigate={setActiveSection} />;
      case 'levels':
        return <LevelMap student={student} onUpdate={refreshStudent} onNavigate={setActiveSection} />;
      case 'games':
        return <GamesSection student={student} onUpdate={refreshStudent} />;
      case 'badges':
        return <BadgesSection student={student} />;
      case 'profile':
        return <ProfileSection student={student} onUpdate={refreshStudent} />;
      default:
        return <StudentOverview student={student} onUpdate={refreshStudent} onNavigate={setActiveSection} />;
    }
  };

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const SidebarLogo = () => (
    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 gradient-purple rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-900 dark:text-gray-100">VocabQuest</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Student Portal</p>
          </div>
        </div>
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-full gradient-purple flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 flex-shrink-0"
          aria-label="Toggle dark mode"
        >
          {isDark
            ? <Sun className="w-4 h-4 text-white" />
            : <Moon className="w-4 h-4 text-white" />
          }
        </button>
      </div>
    </div>
  );

  const NavItems = ({ onClickExtra }: { onClickExtra?: () => void }) => (
    <nav className="flex-1 p-4 space-y-1">
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => {
              setActiveSection(item.id);
              onClickExtra?.();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              activeSection === item.id
                ? 'bg-violet-100 text-violet-700 font-medium dark:bg-violet-900/50 dark:text-violet-300'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            <Icon className="w-5 h-5" />
            {item.label}
          </button>
        );
      })}
    </nav>
  );

  const ProfileFooter = () => (
    <div className="p-4 border-t border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
        <Avatar className="w-10 h-10">
          <AvatarImage src={student.avatar} />
          <AvatarFallback className="gradient-purple text-white">
            {student.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{student.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Level {student.currentLevel}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        className="w-full mt-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
        onClick={() => signOut()}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </div>
  );

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden">
      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3 }}
              className="fixed z-50 w-72 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col lg:hidden"
            >
              <SidebarLogo />
              <NavItems onClickExtra={() => setSidebarOpen(false)} />
              <ProfileFooter />
            </motion.div>
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
        <SidebarLogo />
        <NavItems />
        <ProfileFooter />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {menuItems.find((item) => item.id === activeSection)?.label}
              </h2>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-50 dark:bg-violet-900/30 rounded-lg">
              <Star className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span className="text-sm font-bold text-violet-700 dark:text-violet-300 hidden sm:inline">{student.totalXP} XP</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
              <Zap className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-bold text-orange-700 dark:text-orange-300 hidden sm:inline">{student.streak} day streak</span>
            </div>
            <Avatar className="w-9 h-9 lg:hidden">
              <AvatarImage src={student.avatar} />
              <AvatarFallback className="gradient-purple text-white text-sm">
                {student.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
