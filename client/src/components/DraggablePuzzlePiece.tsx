
import { useDrag } from 'react-dnd';
import { motion } from 'framer-motion';
import { useRef,useEffect } from 'react';
interface DraggablePuzzlePieceProps {
  value: number;
  color: string;
}

// Map color names to Tailwind CSS classes
const colorClasses = {
  red: 'from-red-400 to-red-600',
  blue: 'from-blue-400 to-blue-600',
  green: 'from-green-400 to-green-600',
  yellow: 'from-yellow-400 to-yellow-600',
  purple: 'from-purple-400 to-purple-600',
  orange: 'from-orange-400 to-orange-600',
  // Add more colors as needed
};

export default function DraggablePuzzlePiece({ value, color }: DraggablePuzzlePieceProps) {


  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'piece',
    item: { value },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }));

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      drag(ref.current);
    }
  }, [drag]);

  return (
    <motion.div
      ref={ref}
      whileHover={{ scale: 1.05 }}
      whileDrag={{ scale: 1.1 }}
      className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} rounded-lg cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50' : 'opacity-100'
      } transition-opacity duration-200`}
    >
      {value}
    </motion.div>
  );
}