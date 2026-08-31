
import { cn } from '@/utils/cn';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className, size = 'md' }: LogoProps) {
  const sizes = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className={cn('relative flex items-center justify-center', sizes[size], className)}>
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="neonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#0098EA" />
          </linearGradient>
        </defs>
        <polygon points="50,94 8,20 92,20" fill="#1e1b4b" opacity="0.8" />
        <polygon points="50,90 10,20 90,20" fill="url(#neonGrad)" />
        <line x1="10" y1="20" x2="90" y2="20" stroke="white" strokeWidth="2" opacity="0.8" />
      </svg>
    </div>
  );
}
