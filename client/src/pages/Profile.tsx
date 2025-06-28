import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Trophy, 
  Zap, 
  Calendar, 
  Target, 
  Award,
  TrendingUp,
  Edit3,
  Save,
  X
} from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState(user?.username || '');

  const handleSaveProfile = async () => {
    try {
      // API call to update profile would go here
      updateUser({ username: editedUsername });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const achievements = [
    { id: 'first_puzzle', name: 'First Steps', description: 'Solve your first puzzle', icon: Target },
    { id: 'streak_7', name: 'Week Warrior', description: 'Complete 7-day streak', icon: Calendar },
    { id: 'streak_30', name: 'Month Master', description: 'Complete 30-day streak', icon: Trophy },
    { id: 'level_5', name: 'Rising Star', description: 'Reach level 5', icon: TrendingUp },
    { id: 'level_10', name: 'Puzzle Expert', description: 'Reach level 10', icon: Award },
    { id: 'puzzle_master', name: 'Puzzle Master', description: 'Solve 100 puzzles', icon: User }
  ];

  const stats = [
    { label: 'Current Level', value: user?.level || 1, icon: TrendingUp, color: 'cyan' },
    { label: 'Total XP', value: (user?.xp || 0).toLocaleString(), icon: Zap, color: 'yellow' },
    { label: 'Current Streak', value: `${user?.currentStreak || 0} days`, icon: Calendar, color: 'orange' },
    { label: 'Best Streak', value: `${user?.longestStreak || 0} days`, icon: Trophy, color: 'purple' },
  ];

  const xpToNextLevel = (user?.level || 1) * 100 - (user?.xp || 0);
  const xpProgress = ((user?.xp || 0) % 100) / 100 * 100;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center">
              <User className="h-12 w-12 text-white" />
            </div>
            <div>
              {isEditing ? (
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={editedUsername}
                    onChange={(e) => setEditedUsername(e.target.value)}
                    className="text-2xl font-bold bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSaveProfile}
                      className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg"
                    >
                      <Save className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setIsEditing(false);
                        setEditedUsername(user?.username || '');
                      }}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg"
                    >
                      <X className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <h1 className="text-3xl font-bold text-white">{user?.username}</h1>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(true)}
                    className="p-2 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg"
                  >
                    <Edit3 className="h-4 w-4" />
                  </motion.button>
                </div>
              )}
              <p className="text-gray-300 mt-1">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-medium">Level {user?.level || 1} Progress</span>
            <span className="text-gray-300 text-sm">{xpToNextLevel} XP to next level</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="bg-gradient-to-r from-cyan-400 to-purple-500 h-3 rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            cyan: 'from-cyan-500/20 to-cyan-400/10 border-cyan-500/30 text-cyan-400',
            yellow: 'from-yellow-500/20 to-yellow-400/10 border-yellow-500/30 text-yellow-400',
            orange: 'from-orange-500/20 to-orange-400/10 border-orange-500/30 text-orange-400',
            purple: 'from-purple-500/20 to-purple-400/10 border-purple-500/30 text-purple-400'
          };

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className={`bg-gradient-to-br ${colorClasses[stat.color as keyof typeof colorClasses].split(' ')[0]} ${colorClasses[stat.color as keyof typeof colorClasses].split(' ')[1]} backdrop-blur-lg rounded-2xl p-6 border ${colorClasses[stat.color as keyof typeof colorClasses].split(' ')[2]}`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className={`p-2 rounded-lg bg-white/10`}>
                  <Icon className={`h-5 w-5 ${colorClasses[stat.color as keyof typeof colorClasses].split(' ')[3]}`} />
                </div>
                <span className="text-white font-medium text-sm">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
      >
        <h2 className="text-2xl font-bold text-white mb-6">Achievements</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            const isUnlocked = user?.achievements?.includes(achievement.id);
            
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-200 ${
                  isUnlocked 
                    ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30' 
                    : 'bg-gray-700/20 border border-gray-600/30'
                }`}
              >
                <div className={`p-3 rounded-xl ${isUnlocked ? 'bg-yellow-500/20' : 'bg-gray-600/20'}`}>
                  <Icon className={`h-6 w-6 ${isUnlocked ? 'text-yellow-400' : 'text-gray-400'}`} />
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                    {achievement.name}
                  </h3>
                  <p className="text-gray-400 text-sm">{achievement.description}</p>
                </div>
                {isUnlocked && (
                  <div className="text-yellow-400 text-xl">
                    ✓
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}