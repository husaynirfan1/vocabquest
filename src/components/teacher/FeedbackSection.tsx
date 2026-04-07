"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Star,
  Trophy,
  AlertCircle,
  ThumbsUp,
  History
} from 'lucide-react';
import {
  getTeacherStudents,
  getStudentFeedback,
  createFeedback,
  awardBadge
} from '@/services/database';
import type { Student, Feedback } from '@/types';
import { badges } from '@/data/vocabulary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

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

const feedbackTypes = [
  { id: 'praise', label: 'Praise', icon: ThumbsUp, color: 'bg-green-500' },
  { id: 'improvement', label: 'Improvement', icon: AlertCircle, color: 'bg-orange-500' },
  { id: 'reward', label: 'Reward', icon: Trophy, color: 'bg-yellow-500' },
];

export function FeedbackSection({ teacher }: { teacher: any }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [feedbackType, setFeedbackType] = useState<string>('praise');
  const [message, setMessage] = useState('');
  const [studentFeedback, setStudentFeedback] = useState<Record<string, Feedback[]>>({});
  const [selectedBadge, setSelectedBadge] = useState<string>('');

  useEffect(() => {
    if (teacher) {
      getTeacherStudents(teacher.id).then((data) => {
        setStudents(data);

        // Load feedback for all students
        const feedbackMap: Record<string, Feedback[]> = {};
        Promise.all(
          data.map((student: Student) =>
            getStudentFeedback(student.id).then((fb: Feedback[]) => {
              feedbackMap[student.id] = fb;
            })
          )
        ).then(() => setStudentFeedback({ ...feedbackMap }));
      });
    }
  }, [teacher]);

  const handleSendFeedback = async () => {
    if (!selectedStudent || !message) {
      toast.error('Please select a student and enter a message');
      return;
    }

    const feedback: Feedback = {
      id: `feedback-${Date.now()}`,
      teacherId: teacher?.id || '',
      studentId: selectedStudent,
      message,
      type: feedbackType as 'praise' | 'improvement' | 'reward',
      createdAt: new Date().toISOString(),
      read: false,
    };

    await createFeedback(feedback);

    // If reward type and badge selected, award the badge
    if (feedbackType === 'reward' && selectedBadge) {
      const badge = badges.find(b => b.id === selectedBadge);
      if (badge) {
        await awardBadge(selectedStudent, badge);
        toast.success(`Badge awarded: ${badge.name}`);
      }
    }

    toast.success('Feedback sent successfully!');
    setMessage('');
    setSelectedBadge('');

    // Refresh feedback
    const updatedFeedback = await getStudentFeedback(selectedStudent);
    setStudentFeedback(prev => ({
      ...prev,
      [selectedStudent]: updatedFeedback
    }));
  };

  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case 'praise':
        return <ThumbsUp className="w-4 h-4 text-green-600" />;
      case 'improvement':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case 'reward':
        return <Trophy className="w-4 h-4 text-yellow-600" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-600" />;
    }
  };

  const getFeedbackColor = (type: string) => {
    switch (type) {
      case 'praise':
        return 'bg-green-50 border-green-200';
      case 'improvement':
        return 'bg-orange-50 border-orange-200';
      case 'reward':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Feedback Form */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-violet-600" />
                Send Feedback
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Student Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Select Student</label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={student.avatar} />
                            <AvatarFallback className="text-xs">
                              {student.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {student.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Feedback Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Feedback Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {feedbackTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setFeedbackType(type.id)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                          feedbackType === type.id
                            ? `border-${type.color.split('-')[1]}-500 bg-${type.color.split('-')[1]}-50`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-8 h-8 ${type.color} rounded-lg flex items-center justify-center`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs font-medium">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Badge Selection (for reward type) */}
              {feedbackType === 'reward' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Award Badge (Optional)</label>
                  <Select value={selectedBadge} onValueChange={setSelectedBadge}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a badge to award" />
                    </SelectTrigger>
                    <SelectContent>
                      {badges.map((badge) => (
                        <SelectItem key={badge.id} value={badge.id}>
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4" style={{ color: badge.color }} />
                            {badge.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Message */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Message</label>
                <Textarea
                  placeholder="Enter your feedback message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Send Button */}
              <Button
                onClick={handleSendFeedback}
                className="w-full gradient-purple text-white"
                disabled={!selectedStudent || !message}
              >
                <Send className="w-4 h-4 mr-2" />
                Send Feedback
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Feedback History */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                Recent Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="all">All Feedback</TabsTrigger>
                  <TabsTrigger value="student">By Student</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-3 max-h-96 overflow-y-auto">
                  {Object.entries(studentFeedback).flatMap(([studentId, feedbacks]) =>
                    feedbacks.map(feedback => ({
                      ...feedback,
                      student: students.find(s => s.id === studentId)
                    }))
                  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                   .slice(0, 10)
                   .map((feedback) => (
                    <div
                      key={feedback.id}
                      className={`p-3 rounded-xl border ${getFeedbackColor(feedback.type)}`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={feedback.student?.avatar} />
                          <AvatarFallback className="text-xs bg-violet-100 text-violet-700">
                            {feedback.student?.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getFeedbackIcon(feedback.type)}
                            <span className="font-medium text-sm">{feedback.student?.name}</span>
                            <span className="text-xs text-gray-400">
                              {new Date(feedback.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{feedback.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {Object.values(studentFeedback).flat().length === 0 && (
                    <p className="text-center text-gray-500 py-8">No feedback sent yet</p>
                  )}
                </TabsContent>

                <TabsContent value="student">
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger className="mb-4">
                      <SelectValue placeholder="Select a student to view feedback" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedStudent && (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {studentFeedback[selectedStudent]?.map((feedback) => (
                        <div
                          key={feedback.id}
                          className={`p-3 rounded-xl border ${getFeedbackColor(feedback.type)}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {getFeedbackIcon(feedback.type)}
                            <span className="text-xs text-gray-400">
                              {new Date(feedback.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{feedback.message}</p>
                        </div>
                      ))}

                      {(!studentFeedback[selectedStudent] || studentFeedback[selectedStudent].length === 0) && (
                        <p className="text-center text-gray-500 py-8">No feedback for this student</p>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Praise Section */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Quick Praise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {students.slice(0, 4).map((student) => (
                <button
                  key={student.id}
                  onClick={() => {
                    setSelectedStudent(student.id);
                    setFeedbackType('praise');
                    setMessage(`Great job, ${student.name}! Keep up the excellent work! 🌟`);
                  }}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-violet-50 transition-colors text-left"
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={student.avatar} />
                    <AvatarFallback className="bg-violet-100 text-violet-700">
                      {student.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{student.name}</p>
                    <p className="text-xs text-violet-600">Send praise →</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
