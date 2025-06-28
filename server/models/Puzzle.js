import mongoose from 'mongoose';

const puzzleSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['logic', 'riddle', 'pattern', 'word']
  },
  difficulty: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  solution: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  hints: [{
    type: String
  }],
  xpReward: {
    type: Number,
    required: true
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  isDaily: {
    type: Boolean,
    default: false
  },
  dailyDate: {
    type: Date,
    sparse: true
  }
});

puzzleSchema.index({ dailyDate: 1, isDaily: 1 });

export default mongoose.model('Puzzle', puzzleSchema);