"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen,
  GraduationCap,
  User,
  Lock,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [teacherEmail, setTeacherEmail] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (email: string) => {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid credentials. Please check your email and password.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLogin(teacherEmail);
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLogin(studentEmail);
  };

  return (
    <div className="min-h-screen flex items-center justify-center animated-bg p-4">
      {/* Floating Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 text-white/20"
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <Star size={48} />
        </motion.div>
        <motion.div
          className="absolute top-40 right-20 text-white/20"
          animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          <Sparkles size={36} />
        </motion.div>
        <motion.div
          className="absolute bottom-32 left-20 text-white/20"
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 3.5, repeat: Infinity }}
        >
          <Zap size={40} />
        </motion.div>
        <motion.div
          className="absolute bottom-20 right-10 text-white/20"
          animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 4.5, repeat: Infinity }}
        >
          <BookOpen size={44} />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <motion.div
          className="text-center mb-8"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-2xl mb-4">
            <BookOpen className="w-10 h-10 text-violet-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">VocabQuest</h1>
          <p className="text-white/80">Learn. Play. Master.</p>
        </motion.div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8">
          <Tabs defaultValue="student" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="student" className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Student
              </TabsTrigger>
              <TabsTrigger value="teacher" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Teacher
              </TabsTrigger>
            </TabsList>

            <TabsContent value="student">
              <form onSubmit={handleStudentLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student-email">Email</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="student-email"
                      type="email"
                      placeholder="Enter your email"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="student-password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full gradient-purple text-white py-6 rounded-xl font-semibold text-lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Start Learning!"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="teacher">
              <form onSubmit={handleTeacherLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teacher-email">Email</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="teacher-email"
                      type="email"
                      placeholder="Enter your email"
                      value={teacherEmail}
                      onChange={(e) => setTeacherEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacher-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="teacher-password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full gradient-blue text-white py-6 rounded-xl font-semibold text-lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Access Dashboard"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <p className="text-center text-white/60 mt-6 text-sm">
          Making vocabulary learning fun and engaging!
        </p>
      </motion.div>
    </div>
  );
}
