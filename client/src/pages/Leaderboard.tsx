/* eslint-disable @typescript-eslint/no-explicit-any */
import  { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Crown, Medal, User, Zap, TrendingUp } from 'lucide-react';
import axios from 'axios';

interface LeaderboardEntry {
  _id: string;
  username: string;
  level: number;
  xp: number;
  currentStreak: number;
  longestStreak: number;
  totalPuzzlesSolved: number;
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'xp' | 'streak' | 'puzzles'>('xp');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get('/users/leaderboard');
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    switch (sortBy) {
      case 'xp':
        return b.xp - a.xp;
      case 'streak':
        return b.currentStreak - a.currentStreak;
      case 'puzzles':
        return b.totalPuzzlesSolved - a.totalPuzzlesSolved;
      default:
        return b.xp - a.xp;
    }
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-300" />;
      case 3:
        return <Medal className="h-6 w-6 text-orange-400" />;
      default:
        return <span className="text-gray-400 font-bold">#{rank}</span>;
    }
  };

  const getRankColors = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
      case 2:
        return 'from-gray-400/20 to-gray-500/20 border-gray-400/30';
      case 3:
        return 'from-orange-400/20 to-red-500/20 border-orange-400/30';
      default:
        return 'from-white/5 to-white/10 border-white/20';
    }
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Global Leaderboard</h1>
        </div>
        <p className="text-gray-300">See how you rank against puzzle masters worldwide</p>
      </motion.div>

      {/* Sort Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 mb-6 border border-white/20"
      >
        <div className="flex items-center justify-center space-x-4">
          <span className="text-white font-medium">Sort by:</span>
          <div className="flex space-x-2">
            {[
              { key: 'xp', label: 'Total XP', icon: Zap },
              { key: 'streak', label: 'Current Streak', icon: TrendingUp },
              { key: 'puzzles', label: 'Puzzles Solved', icon: User }
            ].map(({ key, label, icon: Icon }) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSortBy(key as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  sortBy === key
                    ? 'bg-gradient-to-r from-cyan-500/30 to-purple-500/30 text-white border border-cyan-500/50'
                    : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Top 3 Podium */}
      {sortedLeaderboard.length >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-6 mb-8"
        >
          {/* 2nd Place */}
          <div className="text-center pt-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className={`bg-gradient-to-br ${getRankColors(2)} backdrop-blur-lg rounded-2xl p-6 border`}
            >
              <div className="flex justify-center mb-3">
                {getRankIcon(2)}
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg mb-1">{sortedLeaderboard[1].username}</h3>
              <div className="text-gray-300 text-sm">
                {sortBy === 'xp' && `${sortedLeaderboard[1].xp.toLocaleString()} XP`}
                {sortBy === 'streak' && `${sortedLeaderboard[1].currentStreak} day streak`}
                {sortBy === 'puzzles' && `${sortedLeaderboard[1].totalPuzzlesSolved} puzzles`}
              </div>
            </motion.div>
          </div>

          {/* 1st Place */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 }}
              className={`bg-gradient-to-br ${getRankColors(1)} backdrop-blur-lg rounded-2xl p-6 border transform scale-110`}
            >
              <div className="flex justify-center mb-3">
                {getRankIcon(1)}
              </div>
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-white font-bold text-xl mb-1">{sortedLeaderboard[0].username}</h3>
              <div className="text-yellow-300 text-sm font-medium">
                {sortBy === 'xp' && `${sortedLeaderboard[0].xp.toLocaleString()} XP`}
                {sortBy === 'streak' && `${sortedLeaderboard[0].currentStreak} day streak`}
                {sortBy === 'puzzles' && `${sortedLeaderboard[0].totalPuzzlesSolved} puzzles`}
              </div>
            </motion.div>
          </div>

          {/* 3rd Place */}
          <div className="text-center pt-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
              className={`bg-gradient-to-br ${getRankColors(3)} backdrop-blur-lg rounded-2xl p-6 border`}
            >
              <div className="flex justify-center mb-3">
                {getRankIcon(3)}
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg mb-1">{sortedLeaderboard[2].username}</h3>
              <div className="text-gray-300 text-sm">
                {sortBy === 'xp' && `${sortedLeaderboard[2].xp.toLocaleString()} XP`}
                {sortBy === 'streak' && `${sortedLeaderboard[2].currentStreak} day streak`}
                {sortBy === 'puzzles' && `${sortedLeaderboard[2].totalPuzzlesSolved} puzzles`}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Full Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden"
      >
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-bold text-white">Full Rankings</h2>
        </div>
        <div className="divide-y divide-white/10">
          {sortedLeaderboard.map((entry, index) => {
            const rank = index + 1;
            const isCurrentUser = entry._id === user?.id;
            
            return (
              <motion.div
                key={entry._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.02 }}
                className={`flex items-center justify-between p-4 transition-all duration-200 ${
                  isCurrentUser 
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-l-4 border-cyan-400' 
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-8 text-center">
                    {rank <= 3 ? getRankIcon(rank) : <span className="text-gray-400 font-bold">#{rank}</span>}
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className={`font-semibold ${isCurrentUser ? 'text-cyan-300' : 'text-white'}`}>
                      {entry.username}
                      {isCurrentUser && <span className="text-cyan-400 ml-2">(You)</span>}
                    </div>
                    <div className="text-gray-400 text-sm">Level {entry.level}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-8 text-right">
                  <div>
                    <div className="text-white font-medium">{entry.xp.toLocaleString()}</div>
                    <div className="text-gray-400 text-xs">XP</div>
                  </div>
                  <div>
                    <div className="text-white font-medium">{entry.currentStreak}</div>
                    <div className="text-gray-400 text-xs">Streak</div>
                  </div>
                  <div>
                    <div className="text-white font-medium">{entry.totalPuzzlesSolved}</div>
                    <div className="text-gray-400 text-xs">Puzzles</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {sortedLeaderboard.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Data Available</h3>
          <p className="text-gray-400">Start solving puzzles to appear on the leaderboard!</p>
        </div>
      )}
    </div>
  );
}