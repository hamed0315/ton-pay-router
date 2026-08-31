
import { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}

export default function GlassCard({ children, className, glow }: GlassCardProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
      className={cn(
        'relative rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-md',
        glow && 'shadow-[0_0_20px_rgba(124,58,237,0.3)]',
        className
      )}
    >
      {children}
    </motion.div>
  );
}
