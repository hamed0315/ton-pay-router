
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface PaymentTimerProps {
  initialSeconds?: number;
  onExpire?: () => void;
}

export default function PaymentTimer({ initialSeconds = 600, onExpire }: PaymentTimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onExpire]);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progress = (seconds / initialSeconds) * 100;

  return (
    <div className="flex items-center gap-2">
      <motion.div
        className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden"
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </motion.div>
      <span className="text-xs font-mono text-green-400">
        {minutes}:{secs.toString().padStart(2, '0')}
      </span>
    </div>
  );
}
