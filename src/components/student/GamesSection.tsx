"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Gamepad2,
  ArrowRight,
  RefreshCw,
  Star,
  Trophy
} from 'lucide-react';
import type { Student, GameType, VocabularyWord, Level } from '@/types';
import { badges } from '@/data/vocabulary';
import { completeGame, masterVocabulary, awardBadge, getAllLevels, getVocabForLevel } from '@/services/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface GamesSectionProps {
  student: Student;
  onUpdate: () => void;
}

const gameTypes: { id: GameType; name: string; description: string; icon: string; color: string }[] = [
  {
    id: 'word-match',
    name: 'Word Match',
    description: 'Match words with their meanings',
    icon: '🎯',
    color: 'bg-violet-500'
  },
  {
    id: 'fill-blanks',
    name: 'Fill Blanks',
    description: 'Complete sentences with the right word',
    icon: '✏️',
    color: 'bg-blue-500'
  },
  {
    id: 'picture-match',
    name: 'Picture Match',
    description: 'Match words to pictures',
    icon: '🖼️',
    color: 'bg-green-500'
  },
  {
    id: 'spelling',
    name: 'Spelling',
    description: 'Spell the words correctly',
    icon: '🔤',
    color: 'bg-yellow-500'
  },
  {
    id: 'quiz',
    name: 'Quiz',
    description: 'Test your knowledge',
    icon: '❓',
    color: 'bg-pink-500'
  },
];

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

export function GamesSection({ student, onUpdate }: GamesSectionProps) {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'completed'>('menu');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [spellingInput, setSpellingInput] = useState('');
  const [unlockedLevels, setUnlockedLevels] = useState<Level[]>([]);

  useEffect(() => {
    getAllLevels().then((allLevels) => {
      setUnlockedLevels(allLevels.filter(l => student.unlockedLevels.includes(l.id)));
    });
  }, [student.unlockedLevels]);

  const startGame = async (levelId: number, gameType: GameType) => {
    const vocabulary = await getVocabForLevel(levelId);
    const generatedQuestions = generateQuestions(vocabulary, gameType);

    setSelectedLevel(levelId);
    setSelectedGame(gameType);
    setQuestions(generatedQuestions);
    setGameState('playing');
    setCurrentQuestion(0);
    setScore(0);
    setAnswers([]);
    setStartTime(Date.now());
    setSpellingInput('');
  };

  const generateQuestions = (vocabulary: VocabularyWord[], gameType: GameType) => {
    const shuffled = [...vocabulary].sort(() => Math.random() - 0.5).slice(0, 5);

    return shuffled.map((word) => {
      const otherWords = vocabulary.filter(w => w.id !== word.id);
      const distractors = otherWords.sort(() => Math.random() - 0.5).slice(0, 3);

      switch (gameType) {
        case 'word-match':
          return {
            word,
            question: `What does "${word.word}" mean?`,
            options: [word.meaning, ...distractors.map(w => w.meaning)].sort(() => Math.random() - 0.5),
            correctAnswer: word.meaning,
          };
        case 'fill-blanks':
          return {
            word,
            question: word.example.replace(word.word, '_____'),
            options: [word.word, ...distractors.map(w => w.word)].sort(() => Math.random() - 0.5),
            correctAnswer: word.word,
          };
        case 'spelling':
          return {
            word,
            question: `Spell the word: "${word.meaning}"`,
            correctAnswer: word.word,
            hint: word.word.split('').map((_, i) => i === 0 ? word.word[0] : '_').join(' '),
          };
        case 'quiz':
          return {
            word,
            question: `Which word means "${word.meaning}"?`,
            options: [word.word, ...distractors.map(w => w.word)].sort(() => Math.random() - 0.5),
            correctAnswer: word.word,
          };
        default:
          return {
            word,
            question: `What does "${word.word}" mean?`,
            options: [word.meaning, ...distractors.map(w => w.meaning)].sort(() => Math.random() - 0.5),
            correctAnswer: word.meaning,
          };
      }
    });
  };

  const handleAnswer = async (answer: string) => {
    const question = questions[currentQuestion];
    const isCorrect = answer.toLowerCase() === question.correctAnswer.toLowerCase();

    if (isCorrect) {
      setScore(score + 20);
      await masterVocabulary(student.id, question.word.id);
    }

    setAnswers([...answers, isCorrect]);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      await finishGame([...answers, isCorrect]);
    }
  };

  const handleSpellingSubmit = async (input: string) => {
    const question = questions[currentQuestion];
    const isCorrect = input.toLowerCase().trim() === question.correctAnswer.toLowerCase();

    if (isCorrect) {
      setScore(score + 20);
      await masterVocabulary(student.id, question.word.id);
    }

    setAnswers([...answers, isCorrect]);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      await finishGame([...answers, isCorrect]);
    }
  };

  const finishGame = async (finalAnswers: boolean[]) => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const correctCount = finalAnswers.filter(a => a).length;
    const accuracy = (correctCount / questions.length) * 100;
    const xpEarned = Math.round(score * (accuracy / 100));

    const gameId = `l${selectedLevel}-${selectedGame}`;
    await completeGame(student.id, gameId, score, xpEarned, timeSpent, accuracy);

    // Check for badge awards
    if (accuracy === 100) {
      const perfectBadge = badges.find(b => b.id === 'badge-3');
      if (perfectBadge) await awardBadge(student.id, perfectBadge);
    }

    if (timeSpent < 30 && accuracy === 100) {
      const speedBadge = badges.find(b => b.id === 'badge-2');
      if (speedBadge) await awardBadge(student.id, speedBadge);
    }

    if (student.totalXP + xpEarned >= 1000) {
      const xpBadge = badges.find(b => b.id === 'badge-6');
      if (xpBadge) await awardBadge(student.id, xpBadge);
    }

    setGameState('completed');
    onUpdate();

    toast.success(`Game completed! You earned ${xpEarned} XP!`);
  };

  const resetGame = () => {
    setGameState('menu');
    setSelectedLevel(null);
    setSelectedGame(null);
    setCurrentQuestion(0);
    setScore(0);
    setAnswers([]);
    setQuestions([]);
  };

  // Game Menu
  if (gameState === 'menu') {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants} className="text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Choose Your Game 🎮
          </h2>
          <p className="text-gray-500">
            Select a level and game type to start learning!
          </p>
        </motion.div>

        {/* Level Selection */}
        <motion.div variants={itemVariants}>
          <h3 className="font-bold text-lg text-gray-900 mb-4">Select Level</h3>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {unlockedLevels.map((level) => (
              <button
                key={level.id}
                onClick={() => setSelectedLevel(level.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedLevel === level.id
                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/40'
                    : 'border-gray-200 dark:border-gray-600 hover:border-violet-300'
                }`}
              >
                <div className="text-3xl mb-2">
                  {level.id === 1 ? '🚨' :
                   level.id === 2 ? '📜' :
                   level.id === 3 ? '🏕️' :
                   level.id === 4 ? '💼' :
                   level.id === 5 ? '🚗' : '📚'}
                </div>
                <p className="font-medium text-sm text-gray-900">{level.title}</p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Game Type Selection */}
        {selectedLevel && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="font-bold text-lg text-gray-900 mb-4">Choose Game Type</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {gameTypes.map((game) => (
                <Card
                  key={game.id}
                  className="cursor-pointer card-hover"
                  onClick={() => startGame(selectedLevel, game.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 ${game.color} rounded-xl flex items-center justify-center text-3xl`}>
                        {game.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{game.name}</h4>
                        <p className="text-sm text-gray-500">{game.description}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  }

  // Game Playing
  if (gameState === 'playing' && selectedGame) {
    const question = questions[currentQuestion];

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto"
      >
        {/* Game Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={resetGame}>
            ← Back
          </Button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-violet-100 rounded-full">
              <Star className="w-4 h-4 text-violet-600" />
              <span className="font-bold text-violet-700">{score}</span>
            </div>
            <div className="text-sm text-gray-500">
              {currentQuestion + 1} / {questions.length}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <Progress
          value={((currentQuestion + 1) / questions.length) * 100}
          className="h-2 mb-8"
        />

        {/* Question Card */}
        <Card className="mb-6">
          <CardContent className="p-8">
            <h3 className="text-xl font-medium text-gray-900 text-center mb-8">
              {question.question}
            </h3>

            {selectedGame === 'spelling' ? (
              <div className="space-y-4">
                <div className="text-center text-2xl font-mono tracking-widest text-gray-400 mb-4">
                  {question.hint}
                </div>
                <input
                  type="text"
                  value={spellingInput}
                  onChange={(e) => setSpellingInput(e.target.value)}
                  placeholder="Type your answer..."
                  className="w-full px-4 py-3 text-center text-xl border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && spellingInput) {
                      handleSpellingSubmit(spellingInput);
                      setSpellingInput('');
                    }
                  }}
                />
                <Button
                  className="w-full gradient-purple text-white py-6"
                  onClick={() => {
                    if (spellingInput) {
                      handleSpellingSubmit(spellingInput);
                      setSpellingInput('');
                    }
                  }}
                  disabled={!spellingInput}
                >
                  Submit
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {question.options.map((option: string, index: number) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleAnswer(option)}
                    className="p-4 text-left border-2 border-gray-200 rounded-xl hover:border-violet-500 hover:bg-violet-50 transition-all"
                  >
                    <span className="font-medium text-gray-900">{option}</span>
                  </motion.button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Game Completed
  if (gameState === 'completed') {
    const correctCount = answers.filter(a => a).length;
    const accuracy = (correctCount / questions.length) * 100;
    const xpEarned = Math.round(score * (accuracy / 100));

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto text-center"
      >
        <Card className="border-2 border-violet-200">
          <CardContent className="p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Trophy className="w-12 h-12 text-green-600" />
            </motion.div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Game Complete! 🎉
            </h2>
            <p className="text-gray-500 mb-6">
              Great job! Here's how you did:
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-violet-50 dark:bg-violet-900/40 rounded-xl">
                <p className="text-2xl font-bold text-violet-700 dark:text-violet-300">{score}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Score</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/40 rounded-xl">
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{Math.round(accuracy)}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Accuracy</p>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/40 rounded-xl">
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">+{xpEarned}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">XP</p>
              </div>
            </div>

            {accuracy === 100 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-4 bg-yellow-50 dark:bg-yellow-900/40 rounded-xl mb-6"
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="font-bold text-yellow-700 dark:text-yellow-300">Perfect Score!</span>
                  <Star className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">You earned the Perfect Score badge!</p>
              </motion.div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={resetGame}
                className="flex-1 gradient-purple text-white"
              >
                <Gamepad2 className="w-4 h-4 mr-2" />
                Play Again
              </Button>
              <Button
                variant="outline"
                onClick={resetGame}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                New Game
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return null;
}
