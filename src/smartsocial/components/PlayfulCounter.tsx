//src/smartsocial/components/PlayfulCounter.tsx

import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

interface PlayfulCounterProps {
  value: number;
  duration?: number;
  className?: string;
}

const PlayfulCounter: React.FC<PlayfulCounterProps> = ({ 
  value, 
  duration = 2000,
  className = '' 
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    
    // "Playful" random timing - because why not? 😄
    const timer = setInterval(() => {
      const randomIncrement = Math.floor(Math.random() * 3) + 1; // 1-3 random increments
      start = Math.min(start + randomIncrement, end);
      setCount(start);
      
      if (start >= end) {
        setCount(end); // Ensure we end at exact value
        clearInterval(timer);
      }
    }, Math.random() * 100 + 50); // Random timing between 50-150ms

    return () => clearInterval(timer);
  }, [value, duration]);

  const formattedCount = count.toLocaleString();

  return (
    <motion.span 
      className={className}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {formattedCount}
    </motion.span>
  );
};

export default PlayfulCounter;  