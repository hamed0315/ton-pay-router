
import { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export default function GradientText({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('bg-gradient-to-r from-protocol-violet to-protocol-ton bg-clip-text text-transparent', className)}>
      {children}
    </span>
  );
}
