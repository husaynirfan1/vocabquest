"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Lock,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import {
  getCustomLevelsByTeacher,
  createCustomLevel,
  updateCustomLevel,
  deleteCustomLevel,
  nextCustomLevelId,
} from '@/services/database';
import type { CustomLevel, VocabularyWord } from '@/services/database';
import { levels as builtInLevels } from '@/data/vocabulary';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const LEVEL_COLORS = [
  '#7c3aed', '#3b82f6', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#06b6d4', '#8b5cf6',
  '#f97316', '#84cc16',
];

const getLevelIcon = (id: number) => {
  const icons: Record<number, string> = { 1: '🚨', 2: '📜', 3: '🏕️', 4: '💼', 5: '🚗' };
  return icons[id] ?? '📚';
};

const emptyWord = (): Omit<VocabularyWord, 'id'> => ({
  word: '',
  meaning: '',
  example: '',
  level: 0,
  difficulty: 'medium',
});

type WordDraft = Omit<VocabularyWord, 'id'> & { _key: string };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
};

export function LevelManagement({ teacher }: { teacher: any }) {
  const [customLevels, setCustomLevels] = useState<CustomLevel[]>([]);
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<CustomLevel | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formColor, setFormColor] = useState(LEVEL_COLORS[0]);
  const [formXP, setFormXP] = useState('');
  const [formWords, setFormWords] = useState<WordDraft[]>([
    { ...emptyWord(), _key: crypto.randomUUID() },
    { ...emptyWord(), _key: crypto.randomUUID() },
    { ...emptyWord(), _key: crypto.randomUUID() },
    { ...emptyWord(), _key: crypto.randomUUID() },
  ]);

  useEffect(() => {
    if (teacher) loadData();
  }, [teacher]);

  const loadData = () => {
    if (!teacher) return;
    getCustomLevelsByTeacher(teacher.id).then(setCustomLevels);
  };

  const openCreate = () => {
    setEditingLevel(null);
    setFormTitle('');
    setFormDesc('');
    setFormColor(LEVEL_COLORS[0]);
    setFormXP('');
    setFormWords([
      { ...emptyWord(), _key: crypto.randomUUID() },
      { ...emptyWord(), _key: crypto.randomUUID() },
      { ...emptyWord(), _key: crypto.randomUUID() },
      { ...emptyWord(), _key: crypto.randomUUID() },
    ]);
    setDialogOpen(true);
  };

  const openEdit = (level: CustomLevel) => {
    setEditingLevel(level);
    setFormTitle(level.title);
    setFormDesc(level.description);
    setFormColor(level.color);
    setFormXP(String(level.requiredXP));
    setFormWords(
      level.vocabulary.map((v) => ({ ...v, _key: crypto.randomUUID() }))
    );
    setDialogOpen(true);
  };

  const addWord = () => {
    setFormWords((w) => [...w, { ...emptyWord(), _key: crypto.randomUUID() }]);
  };

  const removeWord = (key: string) => {
    setFormWords((w) => w.filter((x) => x._key !== key));
  };

  const updateWord = (key: string, field: keyof Omit<VocabularyWord, 'id'>, value: string) => {
    setFormWords((w) =>
      w.map((x) => (x._key === key ? { ...x, [field]: value } : x))
    );
  };

  const handleSave = async () => {
    if (!formTitle.trim()) {
      toast.error('Level title is required');
      return;
    }
    if (formWords.length < 4) {
      toast.error('At least 4 vocabulary words are required');
      return;
    }
    const incomplete = formWords.find((w) => !w.word.trim() || !w.meaning.trim() || !w.example.trim());
    if (incomplete) {
      toast.error('Please fill in word, meaning, and example for all entries');
      return;
    }

    const levelId = editingLevel?.id ?? await nextCustomLevelId();
    const vocabulary: VocabularyWord[] = formWords.map((w, i) => ({
      id: `l${levelId}-custom-${i + 1}`,
      word: w.word.trim(),
      meaning: w.meaning.trim(),
      example: w.example.trim(),
      level: levelId,
      difficulty: w.difficulty,
    }));

    const level: CustomLevel = {
      id: levelId,
      teacherId: teacher!.id,
      title: formTitle.trim(),
      description: formDesc.trim() || formTitle.trim(),
      theme: formTitle.toLowerCase().replace(/\s+/g, '-'),
      color: formColor,
      vocabulary,
      requiredXP: parseInt(formXP) || 0,
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formTitle)}&backgroundColor=c0aede`,
      createdAt: editingLevel?.createdAt ?? new Date().toISOString(),
    };

    if (editingLevel) {
      await updateCustomLevel(level);
      toast.success('Level updated!');
    } else {
      await createCustomLevel(level);
      toast.success('Level created!');
    }

    setDialogOpen(false);
    loadData();
  };

  const handleDelete = async (level: CustomLevel) => {
    if (!confirm(`Delete "${level.title}"? Students who have unlocked it will keep their progress.`)) return;
    await deleteCustomLevel(level.id);
    toast.success('Level deleted');
    loadData();
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Levels
            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
              ({builtInLevels.length} built-in · {customLevels.length} custom)
            </span>
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create custom levels with your own vocabulary. All 5 game types are available automatically.
          </p>
        </div>
        <Button onClick={openCreate} className="gradient-purple text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Level
        </Button>
      </motion.div>

      {/* Built-in Levels (read-only) */}
      <motion.div variants={itemVariants}>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
          Built-in Levels
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {builtInLevels.map((level) => (
            <Card key={level.id} className="opacity-75">
              <CardContent className="p-4 flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: `${level.color}20` }}
                >
                  {getLevelIcon(level.id)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-gray-700 dark:text-gray-300 truncate">{level.title}</span>
                    <Lock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{level.vocabulary.length} words · {level.requiredXP} XP required</p>
                </div>
                <Badge
                  className="text-white text-xs flex-shrink-0"
                  style={{ backgroundColor: level.color }}
                >
                  Lvl {level.id}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Custom Levels */}
      {customLevels.length > 0 && (
        <motion.div variants={itemVariants}>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
            Your Custom Levels
          </p>
          <div className="space-y-3">
            {customLevels.map((level) => (
              <Card key={level.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Header row */}
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer"
                    onClick={() => setExpandedLevel(expandedLevel === level.id ? null : level.id)}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ backgroundColor: level.color }}
                    >
                      📚
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 dark:text-gray-100">{level.title}</span>
                        <Badge className="text-white text-xs" style={{ backgroundColor: level.color }}>
                          Lvl {level.id}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {level.vocabulary.length} words · {level.requiredXP} XP to unlock · {level.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); openEdit(level); }}
                        className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(level); }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {expandedLevel === level.id
                        ? <ChevronUp className="w-4 h-4 text-gray-400" />
                        : <ChevronDown className="w-4 h-4 text-gray-400" />
                      }
                    </div>
                  </div>

                  {/* Expanded vocab list */}
                  {expandedLevel === level.id && (
                    <div className="border-t border-gray-100 dark:border-gray-700 px-4 pb-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mt-3 mb-2">
                        Vocabulary ({level.vocabulary.length} words)
                      </p>
                      <div className="space-y-2">
                        {level.vocabulary.map((v) => (
                          <div
                            key={v.id}
                            className="grid grid-cols-3 gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-sm"
                          >
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-gray-100">{v.word}</p>
                              <p className="text-xs text-gray-400 capitalize">{v.difficulty}</p>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300">{v.meaning}</p>
                            <p className="text-gray-500 dark:text-gray-400 italic text-xs">{v.example}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty custom state */}
      {customLevels.length === 0 && (
        <motion.div variants={itemVariants} className="text-center py-10">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">No custom levels yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Create a level with your own vocabulary — all 5 game types work automatically.
          </p>
          <Button onClick={openCreate} className="gradient-purple text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Level
          </Button>
        </motion.div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLevel ? 'Edit Level' : 'Create New Level'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-2">
            {/* Level Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Level Title</Label>
                <Input
                  placeholder="e.g. Weather & Seasons"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>XP Required to Unlock</Label>
                <Input
                  type="number"
                  placeholder="e.g. 4000"
                  value={formXP}
                  onChange={(e) => setFormXP(e.target.value)}
                  min={0}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Description</Label>
                <Input
                  placeholder="Brief description of this level's theme"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Level Colour</Label>
                <div className="flex gap-2 flex-wrap">
                  {LEVEL_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setFormColor(color)}
                      className="w-8 h-8 rounded-full transition-all hover:scale-110"
                      style={{
                        backgroundColor: color,
                        outline: formColor === color ? `3px solid ${color}` : 'none',
                        outlineOffset: '2px',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Vocabulary Words */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <Label className="text-base">Vocabulary Words</Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Minimum 4 words required. All 5 game types (Word Match, Fill Blanks, Picture Match, Spelling, Quiz) use these words automatically.
                  </p>
                </div>
                <Badge variant="outline" className={formWords.length < 4 ? 'text-red-500 border-red-300' : 'text-green-600 border-green-300'}>
                  {formWords.length} word{formWords.length !== 1 ? 's' : ''}
                </Badge>
              </div>

              <div className="space-y-3">
                {/* Column headers */}
                <div className="grid grid-cols-[1fr_1fr_1fr_auto_auto] gap-2 px-1">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Word</span>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Meaning</span>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Example sentence</span>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Difficulty</span>
                  <span />
                </div>

                {formWords.map((w) => (
                  <div key={w._key} className="grid grid-cols-[1fr_1fr_1fr_auto_auto] gap-2 items-start">
                    <Input
                      placeholder="e.g. typhoon"
                      value={w.word}
                      onChange={(e) => updateWord(w._key, 'word', e.target.value)}
                      className="text-sm"
                    />
                    <Input
                      placeholder="e.g. A powerful tropical storm"
                      value={w.meaning}
                      onChange={(e) => updateWord(w._key, 'meaning', e.target.value)}
                      className="text-sm"
                    />
                    <Input
                      placeholder="e.g. The typhoon hit the coast."
                      value={w.example}
                      onChange={(e) => updateWord(w._key, 'example', e.target.value)}
                      className="text-sm"
                    />
                    <Select
                      value={w.difficulty}
                      onValueChange={(v) => updateWord(w._key, 'difficulty', v)}
                    >
                      <SelectTrigger className="w-28 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                    <button
                      onClick={() => removeWord(w._key)}
                      disabled={formWords.length <= 4}
                      className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <Button
                  variant="outline"
                  onClick={addWord}
                  className="w-full border-dashed"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Word
                </Button>
              </div>
            </div>

            <Button onClick={handleSave} className="w-full gradient-purple text-white">
              {editingLevel ? 'Save Changes' : 'Create Level'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
