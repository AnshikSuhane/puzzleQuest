import express from 'express';
import Puzzle from '../models/Puzzle.js';
import UserProgress from '../models/UserProgress.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';
import { generateDailyPuzzle } from '../utils/puzzleGenerator.js';

const router = express.Router();

// Get daily puzzle
router.get('/daily', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let dailyPuzzle = await Puzzle.findOne({
      isDaily: true,
      dailyDate: today
    });

    if (!dailyPuzzle) {
      // Generate new daily puzzle
      const user = await User.findById(req.userId);
      const difficulty = Math.min(10, Math.floor(user.level / 2) + 1);
      dailyPuzzle = await generateDailyPuzzle(difficulty, today);
    }

    // Check if user has already completed this puzzle
    const progress = await UserProgress.findOne({
      userId: req.userId,
      puzzleId: dailyPuzzle._id
    });

    res.json({
      puzzle: dailyPuzzle,
      completed: progress?.completed || false,
      attempts: progress?.attempts || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit puzzle solution
router.post('/:puzzleId/submit', authenticateToken, async (req, res) => {
  try {
    const { puzzleId } = req.params;
    const { solution, timeSpent } = req.body;

    const puzzle = await Puzzle.findById(puzzleId);
    if (!puzzle) {
      return res.status(404).json({ message: 'Puzzle not found' });
    }

    let progress = await UserProgress.findOne({
      userId: req.userId,
      puzzleId: puzzleId
    });

    if (!progress) {
      progress = new UserProgress({
        userId: req.userId,
        puzzleId: puzzleId
      });
    }

    progress.attempts += 1;
    progress.timeSpent += timeSpent || 0;

    // Check solution
    const isCorrect = checkSolution(puzzle, solution);
    
    if (isCorrect && !progress.completed) {
      progress.completed = true;
      progress.completedAt = new Date();

      // Update user stats
      const user = await User.findById(req.userId);
      const xpResult = user.addXP(puzzle.xpReward);
      user.totalPuzzlesSolved += 1;

      // Update streak for daily puzzles
      if (puzzle.isDaily) {
        const today = new Date();
        const lastPlayed = user.lastPlayedDate;
        
        if (!lastPlayed || isYesterday(lastPlayed, today)) {
          user.currentStreak += 1;
          user.longestStreak = Math.max(user.longestStreak, user.currentStreak);
        } else if (!isToday(lastPlayed, today)) {
          user.currentStreak = 1;
        }
        
        user.lastPlayedDate = today;
      }

      await user.save();
      await progress.save();

      res.json({
        correct: true,
        xpGained: puzzle.xpReward,
        levelUp: xpResult.levelUp,
        newLevel: xpResult.newLevel,
        currentStreak: user.currentStreak,
        totalXP: user.xp
      });
    } else {
      await progress.save();
      res.json({
        correct: false,
        attempts: progress.attempts,
        hint: puzzle.hints[Math.min(progress.attempts - 1, puzzle.hints.length - 1)]
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's puzzle history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const progress = await UserProgress.find({ userId: req.userId })
      .populate('puzzleId')
      .sort({ completedAt: -1 })
      .limit(50);

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper functions
function checkSolution(puzzle, userSolution) {
  switch (puzzle.type) {
    case 'logic':
    case 'pattern':
      return JSON.stringify(puzzle.solution) === JSON.stringify(userSolution);
    case 'riddle':
    case 'word':
      return puzzle.solution.toLowerCase().trim() === userSolution.toLowerCase().trim();
    default:
      return false;
  }
}

function isToday(date, today) {
  return date.toDateString() === today.toDateString();
}

function isYesterday(date, today) {
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
}

export default router;