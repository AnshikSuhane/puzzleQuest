/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  Puzzle, 
  Trophy, 
  Zap, 
  Calendar, 
  TrendingUp,
  Star,
  Target,
  Award,
  Brain
} from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';

interface DashboardStats {
  dailyPuzzleCompleted: boolean;
  currentStreak: number;
  totalXP: number;
  level: number;
  puzzlesSolved: number;
  rank: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dailyPuzzleRes, leaderboardRes] = await Promise.all([
        axios.get('/puzzles/daily'),
        axios.get('/users/leaderboard')
      ]);

      const userRank = leaderboardRes.data.findIndex((u: any) => u._id === user?.id) + 1;

      setStats({
        dailyPuzzleCompleted: dailyPuzzleRes.data.completed,
        currentStreak: user?.currentStreak || 0,
        totalXP: user?.xp || 0,
        level: user?.level || 1,
        puzzlesSolved: user?.totalPuzzlesSolved || 0,
        rank: userRank || 0
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const xpToNextLevel = (user?.level || 1) * 100 - (user?.xp || 0);
  const xpProgress = ((user?.xp || 0) % 100) / 100 * 100;

  const achievements = [
    { id: 'first_puzzle', name: 'First Steps', description: 'Solve your first puzzle', icon: Star },
    { id: 'streak_7', name: 'Week Warrior', description: '7-day streak', icon: Calendar },
    { id: 'streak_30', name: 'Month Master', description: '30-day streak', icon: Trophy },
    { id: 'level_5', name: 'Rising Star', description: 'Reach level 5', icon: TrendingUp },
    { id: 'level_10', name: 'Puzzle Expert', description: 'Reach level 10', icon: Brain },
    { id: 'puzzle_master', name: 'Puzzle Master', description: 'Solve 100 puzzles', icon: Award }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user?.username}! 👋
        </h1>
        <p className="text-gray-300">
          {stats?.dailyPuzzleCompleted 
            ? "Great job completing today's puzzle! Check back tomorrow for a new challenge."
            : "Ready for today's brain challenge? Let's keep that streak going!"
          }
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {/* Daily Challenge Card */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 backdrop-blur-lg rounded-2xl p-6 border border-white/20 h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl">
                  <Puzzle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Daily Challenge</h3>
                  <p className="text-gray-300 text-sm">{format(new Date(), 'EEEE, MMMM d')}</p>
                </div>
              </div>
              {stats?.dailyPuzzleCompleted && (
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Target className="h-5 w-5 text-green-400" />
                </div>
              )}
            </div>
            
            {stats?.dailyPuzzleCompleted ? (
              <div className="text-center py-4">
                <div className="text-2xl mb-2">🎉</div>
                <p className="text-white font-medium mb-2">Challenge Complete!</p>
                <p className="text-gray-300 text-sm">Come back tomorrow for a new puzzle</p>
              </div>
            ) : (
              <div>
                <p className="text-gray-300 mb-4">
                  Test your mind with today's brain teaser. Difficulty increases each day!
                </p>
                <Link to="/puzzle">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
                  >
                    Start Challenge
                  </motion.button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants}>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Zap className="h-5 w-5 text-yellow-400" />
              </div>
              <h3 className="text-white font-semibold">Total XP</h3>
            </div>
            <div className="text-2xl font-bold text-white mb-2">{stats?.totalXP.toLocaleString()}</div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <p className="text-gray-300 text-sm mt-2">{xpToNextLevel} XP to level {(user?.level || 1) + 1}</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-400" />
              </div>
              <h3 className="text-white font-semibold">Current Streak</h3>
            </div>
            <div className="text-2xl font-bold text-white mb-2">{stats?.currentStreak} days</div>
            <p className="text-gray-300 text-sm">Keep it up! 🔥</p>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Overview */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-6">Progress Overview</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400 mb-1">{stats?.level}</div>
                <div className="text-gray-300 text-sm">Current Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">{stats?.puzzlesSolved}</div>
                <div className="text-gray-300 text-sm">Puzzles Solved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">{user?.longestStreak}</div>
                <div className="text-gray-300 text-sm">Best Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-1">#{stats?.rank || '—'}</div>
                <div className="text-gray-300 text-sm">Global Rank</div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/20">
              <Link to="/leaderboard">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Trophy className="h-5 w-5" />
                  <span>View Leaderboard</span>
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div variants={itemVariants}>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-6">Achievements</h3>
            
            <div className="space-y-3">
              {achievements.map((achievement) => {
                const Icon = achievement.icon;
                const isUnlocked = user?.achievements?.includes(achievement.id);
                
                return (
                  <div
                    key={achievement.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                      isUnlocked 
                        ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30' 
                        : 'bg-gray-700/30 border border-gray-600/30'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isUnlocked ? 'bg-yellow-500/20' : 'bg-gray-600/20'}`}>
                      <Icon className={`h-4 w-4 ${isUnlocked ? 'text-yellow-400' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium text-sm ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                        {achievement.name}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {achievement.description}
                      </div>
                    </div>
                    {isUnlocked && (
                      <div className="text-yellow-400">
                        ✓
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}