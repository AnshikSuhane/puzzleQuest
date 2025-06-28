import React from 'react';
import { useDrag } from 'react-dnd';
import { motion } from 'framer-motion';

interface DraggablePuzzlePieceProps {
  value: number;
  color: string;
}

export default function DraggablePuzzlePiece({ value, color }: DraggablePuzzlePieceProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'piece',
    item: { value },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }));

  const colorClasses = {
    red: 'from-red-500 to-red-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600'
  };

  return (
    <motion.div
      ref={drag}
      whileHover={{ scale: 1.05 }}
      whileDrag={{ scale: 1.1 }}
      className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} rounded-lg cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50' : 'opacity-100'
      } transition-opacity duration-200`}
    />
  );
}