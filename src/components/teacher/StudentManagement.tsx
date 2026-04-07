"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Plus,
  MoreHorizontal,
  TrendingUp,
  Award,
  Gamepad2,
  Mail,
  Edit2,
  Trash2,
  UserPlus,
  GraduationCap,
} from 'lucide-react';
import {
  getTeacherStudents,
  getTeacherClasses,
  createUser,
  updateUser,
  deleteUser,
  assignStudentToClass,
} from '@/services/database';
import type { Student, Class } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export function StudentManagement({ teacher }: { teacher: any }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeClassFilter, setActiveClassFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [formData, setFormData] = useState({ name: '', email: '', classId: '', password: '' });

  useEffect(() => {
    if (teacher) loadData();
  }, [teacher]);

  const loadData = () => {
    if (!teacher) return;
    getTeacherStudents(teacher.id).then(setStudents);
    getTeacherClasses(teacher.id).then(setClasses);
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass =
      activeClassFilter === 'all'
        ? true
        : activeClassFilter === 'unassigned'
        ? !s.classId
        : s.classId === activeClassFilter;
    return matchesSearch && matchesClass;
  });

  const handleAddStudent = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    const newStudent = {
      id: `student-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      role: 'student',
      teacherId: teacher?.id || '',
      classId: formData.classId || undefined,
      currentLevel: 1,
      totalXP: 0,
      streak: 0,
      lastActive: new Date().toISOString(),
      unlockedLevels: [1],
      completedGames: [],
      badges: [],
      vocabularyMastered: [],
      gameStats: [],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}&backgroundColor=${
        ['ffdfbf', 'b6e3f4', 'ffd5dc', 'c0aede', 'd1d4f9'][Math.floor(Math.random() * 5)]
      }`,
      createdAt: new Date().toISOString(),
      password: formData.password,
    } as any;
    await createUser(newStudent);
    toast.success('Student added successfully!');
    setFormData({ name: '', email: '', classId: '', password: '' });
    setIsAddDialogOpen(false);
    loadData();
  };

  const handleEditStudent = async () => {
    if (!editingStudent || !formData.name || !formData.email) {
      toast.error('Please fill in all fields');
      return;
    }
    const updated = { ...editingStudent, name: formData.name, email: formData.email };
    await updateUser(updated);
    // Update class assignment separately
    await assignStudentToClass(editingStudent.id, formData.classId || null);
    toast.success('Student updated successfully!');
    setEditingStudent(null);
    setFormData({ name: '', email: '', classId: '', password: '' });
    loadData();
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (confirm('Are you sure you want to delete this student?')) {
      await deleteUser(studentId);
      toast.success('Student deleted successfully!');
      loadData();
    }
  };

  const openEditDialog = (student: Student) => {
    setEditingStudent(student);
    setFormData({ name: student.name, email: student.email, classId: student.classId ?? '', password: '' });
  };

  const getClassForStudent = (student: Student) =>
    classes.find((c) => c.id === student.classId);

  const renderForm = (onSubmit: () => void, submitLabel: string, showPasswordRequired: boolean) => (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="form-name">Full Name</Label>
        <Input
          id="form-name"
          placeholder="Enter student name"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="form-email">Email</Label>
        <Input
          id="form-email"
          type="email"
          placeholder="Enter student email"
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="form-password">
          Password{!showPasswordRequired && ' (leave blank to keep current)'}
        </Label>
        <Input
          id="form-password"
          type="password"
          placeholder={showPasswordRequired ? 'Set student password' : 'Enter new password'}
          value={formData.password}
          onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label>Class (optional)</Label>
        <Select
          value={formData.classId || 'none'}
          onValueChange={(v) => setFormData((prev) => ({ ...prev, classId: v === 'none' ? '' : v }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="No class assigned" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No class</SelectItem>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                <span className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: c.color }}
                  />
                  {c.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={onSubmit} className="w-full gradient-purple text-white">
        <UserPlus className="w-4 h-4 mr-2" />
        {submitLabel}
      </Button>
    </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header Actions */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-purple text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
            </DialogHeader>
            {renderForm(handleAddStudent, "Add Student", true)}
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Class Filter Tabs */}
      <motion.div variants={itemVariants} className="flex gap-2 flex-wrap">
        {[
          { id: 'all', label: `All (${students.length})`, color: null },
          { id: 'unassigned', label: `Unassigned (${students.filter((s) => !s.classId).length})`, color: null },
          ...classes.map((c) => ({
            id: c.id,
            label: `${c.name} (${students.filter((s) => s.classId === c.id).length})`,
            color: c.color,
          })),
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveClassFilter(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeClassFilter === tab.id
                ? 'bg-violet-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {tab.color && (
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: tab.color }}
              />
            )}
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Students Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredStudents.map((student) => {
          const cls = getClassForStudent(student);
          return (
            <Card key={student.id} className="card-hover overflow-hidden">
              <CardContent className="p-0">
                {/* Header with gradient */}
                <div className="h-20 gradient-purple relative">
                  <div className="absolute -bottom-8 left-4">
                    <Avatar className="w-16 h-16 border-4 border-white dark:border-gray-800">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback className="bg-violet-100 text-violet-700 text-xl">
                        {student.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  {cls && (
                    <div
                      className="absolute top-2 left-4 px-2 py-0.5 rounded-full text-white text-xs font-semibold flex items-center gap-1"
                      style={{ backgroundColor: cls.color }}
                    >
                      <GraduationCap className="w-3 h-3" />
                      {cls.name}
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                          <MoreHorizontal className="w-4 h-4 text-white" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(student)}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteStudent(student.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Content */}
                <div className="pt-10 px-4 pb-4">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{student.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-4">
                    <Mail className="w-3 h-3" />
                    {student.email}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-2 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-violet-600 dark:text-violet-400 mx-auto mb-1" />
                      <p className="text-lg font-bold text-violet-700 dark:text-violet-300">{student.totalXP}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">XP</p>
                    </div>
                    <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Gamepad2 className="w-4 h-4 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                      <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{student.completedGames.length}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Games</p>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <Award className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mx-auto mb-1" />
                      <p className="text-lg font-bold text-yellow-700 dark:text-yellow-300">{student.badges.length}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Badges</p>
                    </div>
                  </div>

                  {/* Level & Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="text-violet-600 border-violet-200">
                        Level {student.currentLevel}
                      </Badge>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {student.vocabularyMastered.length} words mastered
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((student.totalXP / 5000) * 100, 100)}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Edit Dialog */}
      <Dialog open={!!editingStudent} onOpenChange={() => setEditingStudent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          {renderForm(handleEditStudent, "Update Student", false)}
        </DialogContent>
      </Dialog>

      {/* Empty State */}
      {filteredStudents.length === 0 && (
        <motion.div variants={itemVariants} className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">No students found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filter.</p>
        </motion.div>
      )}
    </motion.div>
  );
}
