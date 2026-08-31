
import { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export default function NeonButton({ children, variant = 'primary', className, ...props }: NeonButtonProps) {
  const shouldReduceMotion = useReducedMotion();
  const base = 'relative inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 focus:outline-none';
  const variants = {
    primary: 'bg-gradient-to-r from-protocol-violet to-protocol-ton text-white shadow-[0_0_15px_rgba(124,58,237,0.4)] hover:shadow-[0_0_20px_rgba(0,152,234,0.5)]',
    secondary: 'bg-white/10 border border-white/10 text-white hover:bg-white/20',
    ghost: 'bg-transparent text-white/70 hover:text-white',
  };

  return (
    <motion.button
      whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
      className={cn(base, variants[variant], className)}
      {...props}
    >
      {children}
    </motion.button>
  );
}
