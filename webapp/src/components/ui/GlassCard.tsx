
import { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}

export default function GlassCard({ children, className, glow }: GlassCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg',
        glow && 'shadow-[0_0_30px_rgba(124,58,237,0.3)]',
        className
      )}
    >
      {children}
    </div>
  );
}
