"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  Users,
  GraduationCap,
  ChevronRight,
  X,
  UserPlus,
  UserMinus,
} from 'lucide-react';
import {
  getTeacherClasses,
  getClassStudents,
  getTeacherStudents,
  createClass,
  updateClass,
  deleteClass,
  assignStudentToClass,
} from '@/services/database';
import type { Class, Student } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const CLASS_COLORS = [
  '#7c3aed', '#3b82f6', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#06b6d4', '#8b5cf6',
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export function ClassManagement({ teacher }: { teacher: any }) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);

  // Create / Edit dialog
  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', color: CLASS_COLORS[0] });

  // Manage-students dialog
  const [managingClass, setManagingClass] = useState<Class | null>(null);
  const [classStudents, setClassStudents] = useState<Student[]>([]);

  // Per-class student counts for the grid cards
  const [classStudentMap, setClassStudentMap] = useState<Record<string, Student[]>>({});

  useEffect(() => {
    if (teacher) {
      loadData();
    }
  }, [teacher]);

  const loadData = () => {
    if (!teacher) return;
    getTeacherClasses(teacher.id).then((cls) => {
      setClasses(cls);
      // Load students per class for the card display
      const map: Record<string, Student[]> = {};
      Promise.all(
        cls.map((c: Class) =>
          getClassStudents(c.id).then((students: Student[]) => {
            map[c.id] = students;
          })
        )
      ).then(() => setClassStudentMap({ ...map }));
    });
    getTeacherStudents(teacher.id).then(setAllStudents);
  };

  const openCreateDialog = () => {
    setEditingClass(null);
    setFormData({ name: '', description: '', color: CLASS_COLORS[0] });
    setClassDialogOpen(true);
  };

  const openEditDialog = (cls: Class) => {
    setEditingClass(cls);
    setFormData({ name: cls.name, description: cls.description ?? '', color: cls.color });
    setClassDialogOpen(true);
  };

  const openManageDialog = async (cls: Class) => {
    setManagingClass(cls);
    const students = await getClassStudents(cls.id);
    setClassStudents(students);
  };

  const handleSaveClass = async () => {
    if (!formData.name.trim()) {
      toast.error('Class name is required');
      return;
    }
    if (editingClass) {
      await updateClass({ ...editingClass, name: formData.name.trim(), description: formData.description.trim(), color: formData.color });
      toast.success('Class updated!');
    } else {
      const newClass: Class = {
        id: `class-${Date.now()}`,
        teacherId: teacher!.id,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        color: formData.color,
        createdAt: new Date().toISOString(),
      };
      await createClass(newClass);
      toast.success('Class created!');
    }
    setClassDialogOpen(false);
    loadData();
  };

  const handleDeleteClass = async (cls: Class) => {
    if (!confirm(`Delete "${cls.name}"? Students will be unassigned.`)) return;
    await deleteClass(cls.id);
    toast.success('Class deleted');
    loadData();
  };

  const handleAssign = async (studentId: string) => {
    if (!managingClass) return;
    await assignStudentToClass(studentId, managingClass.id);
    const updatedClassStudents = await getClassStudents(managingClass.id);
    setClassStudents(updatedClassStudents);
    const updatedAll = await getTeacherStudents(teacher!.id);
    setAllStudents(updatedAll);
    toast.success('Student added to class');
  };

  const handleUnassign = async (studentId: string) => {
    await assignStudentToClass(studentId, null);
    if (managingClass) {
      const updatedClassStudents = await getClassStudents(managingClass.id);
      setClassStudents(updatedClassStudents);
    }
    const updatedAll = await getTeacherStudents(teacher!.id);
    setAllStudents(updatedAll);
    toast.success('Student removed from class');
  };

  const unassignedStudents = allStudents.filter((s) => !s.classId);
  const otherClassStudents = allStudents.filter((s) => s.classId && s.classId !== managingClass?.id);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Classes
            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
              ({classes.length})
            </span>
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Organise your students into classes</p>
        </div>
        <Button onClick={openCreateDialog} className="gradient-purple text-white">
          <Plus className="w-4 h-4 mr-2" />
          Create Class
        </Button>
      </motion.div>

      {/* Class Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {classes.map((cls) => {
          const students = classStudentMap[cls.id] || [];
          return (
            <Card key={cls.id} className="overflow-hidden card-hover">
              <CardContent className="p-0">
                {/* Coloured header */}
                <div
                  className="h-24 flex items-end px-5 pb-4 relative"
                  style={{ backgroundColor: cls.color }}
                >
                  <div className="absolute top-3 right-3 flex gap-1">
                    <button
                      onClick={() => openEditDialog(cls)}
                      className="p-1.5 bg-white/20 hover:bg-white/40 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-white" />
                    </button>
                    <button
                      onClick={() => handleDeleteClass(cls)}
                      className="p-1.5 bg-white/20 hover:bg-white/40 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Body */}
                <div className="p-5">
                  <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100">{cls.name}</h4>
                  {cls.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 mb-3">{cls.description}</p>
                  )}

                  {/* Student avatars */}
                  <div className="flex items-center gap-2 mt-3 mb-4">
                    <div className="flex -space-x-2">
                      {students.slice(0, 4).map((s) => (
                        <Avatar key={s.id} className="w-8 h-8 border-2 border-white dark:border-gray-800">
                          <AvatarImage src={s.avatar} />
                          <AvatarFallback className="text-xs" style={{ backgroundColor: `${cls.color}30`, color: cls.color }}>
                            {s.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {students.length > 4 && (
                        <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
                          +{students.length - 4}
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {students.length} student{students.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => openManageDialog(cls)}
                  >
                    Manage Students
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Empty state */}
        {classes.length === 0 && (
          <div className="col-span-full text-center py-16">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">No classes yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Create your first class to group students together.</p>
            <Button onClick={openCreateDialog} className="gradient-purple text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Class
            </Button>
          </div>
        )}
      </motion.div>

      {/* Create / Edit Class Dialog */}
      <Dialog open={classDialogOpen} onOpenChange={setClassDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingClass ? 'Edit Class' : 'Create New Class'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="cls-name">Class Name</Label>
              <Input
                id="cls-name"
                placeholder="e.g. Year 6A"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cls-desc">Description (optional)</Label>
              <Input
                id="cls-desc"
                placeholder="e.g. Morning English class"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Class Colour</Label>
              <div className="flex gap-2 flex-wrap">
                {CLASS_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setFormData({ ...formData, color })}
                    className="w-8 h-8 rounded-full transition-all hover:scale-110"
                    style={{
                      backgroundColor: color,
                      outline: formData.color === color ? `3px solid ${color}` : 'none',
                      outlineOffset: '2px',
                    }}
                  />
                ))}
              </div>
            </div>
            <Button onClick={handleSaveClass} className="w-full gradient-purple text-white">
              {editingClass ? 'Save Changes' : 'Create Class'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Students Dialog */}
      <Dialog open={!!managingClass} onOpenChange={() => setManagingClass(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: managingClass?.color }}
              >
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <DialogTitle>{managingClass?.name} — Manage Students</DialogTitle>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* In this class */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: managingClass?.color }}
                />
                In this class ({classStudents.length})
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {classStudents.length === 0 && (
                  <p className="text-sm text-gray-400 italic py-4 text-center">No students yet</p>
                )}
                {classStudents.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 dark:bg-gray-700"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={s.avatar} />
                      <AvatarFallback className="text-xs bg-violet-100 text-violet-700">
                        {s.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {s.name}
                    </span>
                    <button
                      onClick={() => handleUnassign(s.id)}
                      className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Remove from class"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Available to add */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                Available ({unassignedStudents.length + otherClassStudents.length})
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {unassignedStudents.length === 0 && otherClassStudents.length === 0 && (
                  <p className="text-sm text-gray-400 italic py-4 text-center">No available students</p>
                )}
                {unassignedStudents.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 dark:bg-gray-700"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={s.avatar} />
                      <AvatarFallback className="text-xs bg-gray-100 text-gray-600">
                        {s.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {s.name}
                    </span>
                    <button
                      onClick={() => handleAssign(s.id)}
                      className="p-1 text-green-500 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                      title="Add to class"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {otherClassStudents.map((s) => {
                  const otherClass = classes.find((c) => c.id === s.classId);
                  return (
                    <div
                      key={s.id}
                      className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 dark:bg-gray-700 opacity-70"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={s.avatar} />
                        <AvatarFallback className="text-xs bg-gray-100 text-gray-600">
                          {s.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{s.name}</p>
                        <p className="text-xs text-gray-400 truncate">In {otherClass?.name}</p>
                      </div>
                      <button
                        onClick={() => handleAssign(s.id)}
                        className="p-1 text-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Move to this class"
                      >
                        <X className="w-3 h-3 mr-0.5 inline opacity-0" />
                        <UserPlus className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
