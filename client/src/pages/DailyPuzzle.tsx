/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useDrop } from 'react-dnd';
import { Brain, Clock, Zap, Lightbulb, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import Confetti from 'react-confetti';
import DraggablePuzzlePiece from '../components/DraggablePuzzlePiece';

interface Puzzle {
  _id: string;
  type: string;
  title: string;
  description: string;
  content: any;
  solution: any;
  xpReward: number;
  difficulty: number;
}

interface PuzzleResult {
  correct: boolean;
  xpGained?: number;
  levelUp?: boolean;
  newLevel?: number;
  currentStreak?: number;
  totalXP?: number;
  attempts?: number;
  hint?: string;
}

export default function DailyPuzzle() {
  const { user, updateUser } = useAuth();
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [loading, setLoading] = useState(true);
  const [userSolution, setUserSolution] = useState<any>('');
  const [result, setResult] = useState<PuzzleResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    fetchDailyPuzzle();
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchDailyPuzzle = async () => {
    try {
      const response = await axios.get('/puzzles/daily');
      setPuzzle(response.data.puzzle);
      setCompleted(response.data.completed);
      
      // Initialize solution based on puzzle type
      if (response.data.puzzle.type === 'pattern' && response.data.puzzle.content.grid) {
        setUserSolution(response.data.puzzle.content.grid.map((row: any[]) => [...row]));
      }
    } catch (error) {
      console.error('Failed to fetch daily puzzle:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSolution = async () => {
    if (!puzzle || submitting) return;

    setSubmitting(true);
    try {
      const response = await axios.post(`/puzzles/${puzzle._id}/submit`, {
        solution: userSolution,
        timeSpent
      });

      setResult(response.data);

      if (response.data.correct) {
        setCompleted(true);
        setShowConfetti(true);
        
        // Update user state
        if (user) {
          updateUser({
            xp: response.data.totalXP,
            level: response.data.newLevel || user.level,
            currentStreak: response.data.currentStreak
          });
        }

        setTimeout(() => setShowConfetti(false), 5000);
      }
    } catch (error) {
      console.error('Failed to submit solution:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderPuzzleContent = () => {
    if (!puzzle) return null;

    switch (puzzle.type) {
      case 'logic':
        if (puzzle.content.sequence) {
          return <NumberSequencePuzzle puzzle={puzzle} userSolution={userSolution} setUserSolution={setUserSolution} />;
        }
        if (puzzle.content.grid) {
          return <LogicGridPuzzle puzzle={puzzle} userSolution={userSolution} setUserSolution={setUserSolution} />;
        }
        break;
      case 'riddle':
        return <RiddlePuzzle puzzle={puzzle} userSolution={userSolution} setUserSolution={setUserSolution} />;
      case 'pattern':
        if (puzzle.content.pattern) {
          return <ColorPatternPuzzle puzzle={puzzle} userSolution={userSolution} setUserSolution={setUserSolution} />;
        }
        if (puzzle.content.shapes) {
          return <ShapeSequencePuzzle puzzle={puzzle} userSolution={userSolution} setUserSolution={setUserSolution} />;
        }
        break;
      case 'word':
        return <WordPuzzle puzzle={puzzle} userSolution={userSolution} setUserSolution={setUserSolution} />;
      default:
        return <div className="text-white">Unknown puzzle type</div>;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
          <Brain className="h-16 w-16 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No Puzzle Available</h2>
          <p className="text-gray-300">Check back later for today's challenge!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {showConfetti && <Confetti />}
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-bold text-white">{puzzle.title}</h1>
            <p className="text-gray-300">Difficulty Level {puzzle.difficulty}</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 mb-6 border border-white/20"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-400" />
              <span className="text-white font-medium">{formatTime(timeSpent)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              <span className="text-white font-medium">{puzzle.xpReward} XP</span>
            </div>
          </div>
          {completed && (
            <div className="flex items-center space-x-2 text-green-400">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Completed!</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Puzzle Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-6 border border-white/20"
      >
        <h2 className="text-xl font-semibold text-white mb-4">{puzzle.description}</h2>
        {renderPuzzleContent()}
      </motion.div>

      {/* Result Display */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`mb-6 p-6 rounded-2xl border ${
              result.correct
                ? 'bg-green-500/20 border-green-500/30 text-green-300'
                : 'bg-red-500/20 border-red-500/30 text-red-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              {result.correct ? (
                <CheckCircle className="h-6 w-6" />
              ) : (
                <XCircle className="h-6 w-6" />
              )}
              <div>
                <div className="font-semibold">
                  {result.correct ? 'Correct! Well done!' : 'Not quite right. Try again!'}
                </div>
                {result.correct && (
                  <div className="text-sm">
                    +{result.xpGained} XP earned
                    {result.levelUp && ` • Level up! You're now level ${result.newLevel}`}
                    {result.currentStreak && ` • ${result.currentStreak} day streak!`}
                  </div>
                )}
                {!result.correct && result.hint && (
                  <div className="text-sm mt-2 flex items-start space-x-2">
                    <Lightbulb className="h-4 w-4 mt-0.5 text-yellow-400" />
                    <span>{result.hint}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Button */}
      {!completed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmitSolution}
            disabled={submitting || !userSolution}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
          >
            <span>{submitting ? 'Submitting...' : 'Submit Solution'}</span>
            {!submitting && <Brain className="h-5 w-5" />}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

// Puzzle component implementations
function NumberSequencePuzzle({ puzzle, userSolution, setUserSolution }: any) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 justify-center">
        {puzzle.content.sequence.map((num: number, index: number) => (
          <div
            key={index}
            className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/20 rounded-lg flex items-center justify-center text-white font-bold text-lg"
          >
            {num}
          </div>
        ))}
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg flex items-center justify-center text-2xl">
          ?
        </div>
      </div>
      
      <div className="text-center">
        <input
          type="number"
          value={userSolution}
          onChange={(e) => setUserSolution(e.target.value)}
          placeholder="Enter the next number"
          className="w-32 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-center placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />
      </div>
    </div>
  );
}

function RiddlePuzzle({ puzzle, userSolution, setUserSolution }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6">
        <p className="text-white text-lg text-center italic">
          "{puzzle.content.question}"
        </p>
      </div>
      
      <div className="text-center">
        <input
          type="text"
          value={userSolution}
          onChange={(e) => setUserSolution(e.target.value)}
          placeholder="Enter your answer"
          className="w-full max-w-md px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-center placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />
      </div>
    </div>
  );
}

function ColorPatternPuzzle({ puzzle, userSolution, setUserSolution }: any) {
  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
  const colorClasses = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 justify-center">
        {puzzle.content.pattern.map((color: string, index: number) => (
          <div
            key={index}
            className={`w-16 h-16 ${colorClasses[color as keyof typeof colorClasses]} border-2 border-white/20 rounded-lg`}
          />
        ))}
        <div className="w-16 h-16 bg-gray-700 border-2 border-yellow-500 rounded-lg flex items-center justify-center text-2xl text-yellow-400">
          ?
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3 justify-center">
        {colors.map((color) => (
          <motion.button
            key={color}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setUserSolution(color)}
            className={`w-12 h-12 ${colorClasses[color as keyof typeof colorClasses]} border-2 ${
              userSolution === color ? 'border-white' : 'border-white/20'
            } rounded-lg transition-all duration-200`}
          />
        ))}
      </div>
    </div>
  );
}

function ShapeSequencePuzzle({ puzzle, userSolution, setUserSolution }: any) {
  const shapes = ['circle', 'square', 'triangle', 'diamond', 'star'];
  const shapeElements = {
    circle: '●',
    square: '■',
    triangle: '▲',
    diamond: '◆',
    star: '★'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 justify-center">
        {puzzle.content.shapes.map((shape: string, index: number) => (
          <div
            key={index}
            className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/20 rounded-lg flex items-center justify-center text-white text-2xl"
          >
            {shapeElements[shape as keyof typeof shapeElements]}
          </div>
        ))}
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg flex items-center justify-center text-2xl">
          ?
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3 justify-center">
        {shapes.map((shape) => (
          <motion.button
            key={shape}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setUserSolution(shape)}
            className={`w-12 h-12 bg-white/10 border-2 ${
              userSolution === shape ? 'border-cyan-400' : 'border-white/20'
            } rounded-lg flex items-center justify-center text-white text-xl transition-all duration-200`}
          >
            {shapeElements[shape as keyof typeof shapeElements]}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function WordPuzzle({ puzzle, userSolution, setUserSolution }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-2xl p-6 mb-6">
          <div className="text-2xl font-mono text-white tracking-widest mb-2">
            {puzzle.content.scrambled}
          </div>
          <p className="text-gray-300">Unscramble these letters</p>
        </div>
        
        <input
          type="text"
          value={userSolution}
          onChange={(e) => setUserSolution(e.target.value.toUpperCase())}
          placeholder="Enter the word"
          maxLength={puzzle.content.length}
          className="w-full max-w-md px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-center text-xl font-mono tracking-widest placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />
      </div>
    </div>
  );
}

function LogicGridPuzzle({ userSolution, setUserSolution }: any) {
  const [, drop] = useDrop(() => ({
    accept: 'piece',
    drop: (item: any, monitor) => {
      const dropResult = monitor.getDropResult() as { x?: number; y?: number } || {};
      const { x, y } = dropResult;
      if (x !== undefined && y !== undefined) {
        const newGrid = [...userSolution];
        newGrid[x][y] = item.value;
        setUserSolution(newGrid);
      }
    }
  }));

  // Use a callback ref to ensure type compatibility with React's ref system
  const setDropRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (node) {
        drop(node);
      }
    },
    [drop]
  );

  return (
    <div ref={setDropRef} className="space-y-6">
      <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
        {Array.isArray(userSolution) &&
          userSolution.map((row: any[], rowIndex: number) =>
            row.map((cell: any, colIndex: number) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="w-16 h-16 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center"
              >
                {cell !== null && (
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${
                      cell === 0
                        ? 'from-red-500 to-red-600'
                        : cell === 1
                        ? 'from-blue-500 to-blue-600'
                        : 'from-green-500 to-green-600'
                    }`}
                  />
                )}
              </div>
            ))
          )}
      </div>
      <div className="flex justify-center space-x-4">
        {[0, 1, 2].map((value) => (
          <DraggablePuzzlePiece
            key={value}
            value={value}
            color={
              value === 0 ? 'red' :
              value === 1 ? 'blue' : 'green'
            }
          />
        ))}
      </div>
    </div>
  );
}