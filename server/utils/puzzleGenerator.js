import Puzzle from '../models/Puzzle.js';

const puzzleTemplates = {
  logic: [
    {
      title: "Number Sequence",
      description: "Complete the sequence by finding the pattern:",
      generate: (difficulty) => ({
        sequence: generateNumberSequence(difficulty),
        options: generateSequenceOptions(difficulty)
      })
    },
    {
      title: "Logic Grid",
      description: "Arrange the pieces to complete the pattern:",
      generate: (difficulty) => ({
        grid: generateLogicGrid(difficulty),
        pieces: generateGridPieces(difficulty)
      })
    }
  ],
  riddle: [
    {
      title: "Daily Riddle",
      description: "Solve this riddle:",
      generate: (difficulty) => generateRiddle(difficulty)
    }
  ],
  pattern: [
    {
      title: "Color Pattern",
      description: "Complete the color pattern:",
      generate: (difficulty) => ({
        pattern: generateColorPattern(difficulty),
        options: generateColorOptions()
      })
    },
    {
      title: "Shape Sequence",
      description: "What comes next in this sequence?",
      generate: (difficulty) => ({
        shapes: generateShapeSequence(difficulty),
        options: generateShapeOptions()
      })
    }
  ],
  word: [
    {
      title: "Word Puzzle",
      description: "Unscramble the letters to form a word:",
      generate: (difficulty) => generateWordPuzzle(difficulty)
    }
  ]
};

export const generateDailyPuzzle = async (difficulty, date) => {
  const types = Object.keys(puzzleTemplates);
  const randomType = types[Math.floor(Math.random() * types.length)];
  const templates = puzzleTemplates[randomType];
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  const content = template.generate(difficulty);
  const solution = generateSolution(randomType, content, difficulty);
  
  const puzzle = new Puzzle({
    type: randomType,
    difficulty,
    title: template.title,
    description: template.description,
    content,
    solution,
    hints: generateHints(randomType, content, solution),
    xpReward: difficulty * 10,
    isDaily: true,
    dailyDate: date
  });

  return await puzzle.save();
};

// Helper functions for puzzle generation
function generateNumberSequence(difficulty) {
  const patterns = [
    { type: 'arithmetic', step: difficulty },
    { type: 'geometric', ratio: 2 },
    { type: 'fibonacci', start: [1, 1] },
    { type: 'squares', start: 1 }
  ];
  
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];
  const sequence = [];
  
  switch (pattern.type) {
    case 'arithmetic':
      for (let i = 0; i < 5 + difficulty; i++) {
        sequence.push(i * pattern.step + 1);
      }
      break;
    case 'geometric':
      for (let i = 0; i < 4 + Math.floor(difficulty / 2); i++) {
        sequence.push(Math.pow(pattern.ratio, i));
      }
      break;
    case 'fibonacci':
      sequence.push(...pattern.start);
      for (let i = 2; i < 6 + difficulty; i++) {
        sequence.push(sequence[i-1] + sequence[i-2]);
      }
      break;
    case 'squares':
      for (let i = 1; i <= 5 + difficulty; i++) {
        sequence.push(i * i);
      }
      break;
  }
  
  return sequence;
}

function generateSequenceOptions(difficulty) {
  const options = [];
  const correct = Math.random() * 100 + difficulty * 10;
  options.push(correct);
  
  for (let i = 0; i < 3; i++) {
    options.push(correct + (Math.random() - 0.5) * 20);
  }
  
  return options.sort(() => Math.random() - 0.5);
}

function generateLogicGrid(difficulty) {
  const size = Math.min(5, 2 + difficulty);
  const grid = [];
  
  for (let i = 0; i < size; i++) {
    const row = [];
    for (let j = 0; j < size; j++) {
      row.push((i + j) % 3); // Simple pattern
    }
    grid.push(row);
  }
  
  // Remove some pieces to create puzzle
  const missing = Math.floor(size * size * 0.3);
  for (let i = 0; i < missing; i++) {
    const x = Math.floor(Math.random() * size);
    const y = Math.floor(Math.random() * size);
    grid[x][y] = null;
  }
  
  return grid;
}

function generateGridPieces(difficulty) {
  return [0, 1, 2]; // Available pieces
}

function generateRiddle(difficulty) {
  const riddles = [
    {
      question: "I have keys but no locks. I have space but no room. You can enter, but you can't go outside. What am I?",
      answer: "keyboard"
    },
    {
      question: "What gets wet while drying?",
      answer: "towel"
    },
    {
      question: "I'm tall when I'm young, and I'm short when I'm old. What am I?",
      answer: "candle"
    },
    {
      question: "What has one eye, but can't see?",
      answer: "needle"
    }
  ];
  
  return riddles[Math.floor(Math.random() * riddles.length)];
}

function generateColorPattern(difficulty) {
  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
  const pattern = [];
  const patternLength = 3 + difficulty;
  
  for (let i = 0; i < patternLength; i++) {
    pattern.push(colors[i % colors.length]);
  }
  
  return pattern;
}

function generateColorOptions() {
  return ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
}

function generateShapeSequence(difficulty) {
  const shapes = ['circle', 'square', 'triangle', 'diamond', 'star'];
  const sequence = [];
  
  for (let i = 0; i < 4 + difficulty; i++) {
    sequence.push(shapes[i % shapes.length]);
  }
  
  return sequence;
}

function generateShapeOptions() {
  return ['circle', 'square', 'triangle', 'diamond', 'star'];
}

function generateWordPuzzle(difficulty) {
  const words = [
    'PUZZLE', 'BRAIN', 'CHALLENGE', 'LOGIC', 'PATTERN',
    'RIDDLE', 'SEQUENCE', 'SOLUTION', 'MYSTERY', 'CIPHER'
  ];
  
  const word = words[Math.floor(Math.random() * words.length)];
  const scrambled = word.split('').sort(() => Math.random() - 0.5).join('');
  
  return { scrambled, length: word.length };
}

function generateSolution(type, content, difficulty) {
  switch (type) {
    case 'logic':
      if (content.sequence) {
        const seq = content.sequence;
        return seq[seq.length - 1] + (seq[seq.length - 1] - seq[seq.length - 2]);
      }
      return content.grid;
    case 'riddle':
      return content.answer;
    case 'pattern':
      if (content.pattern) {
        return content.pattern[0]; // Next in pattern
      }
      return content.shapes[0];
    case 'word':
      const words = ['PUZZLE', 'BRAIN', 'CHALLENGE', 'LOGIC', 'PATTERN'];
      return words.find(word => 
        word.split('').sort().join('') === content.scrambled.split('').sort().join('')
      );
    default:
      return null;
  }
}

function generateHints(type, content, solution) {
  switch (type) {
    case 'logic':
      return ['Look for the pattern in the numbers', 'Try adding or multiplying', 'Check the differences between consecutive numbers'];
    case 'riddle':
      return ['Think about objects you use daily', 'Consider the literal meaning', 'What has the described properties?'];
    case 'pattern':
      return ['Look at the color order', 'The pattern repeats', 'What comes after the last color?'];
    case 'word':
      return ['Try rearranging the letters', 'Think of common words', 'The word relates to puzzles'];
    default:
      return ['Think carefully', 'Look for patterns', 'Consider all possibilities'];
  }
}