
import { cn } from '@/utils/cn';

type Status = 'pending' | 'processing' | 'settled' | 'failed' | 'active' | 'limited';

interface StatusPillProps {
  status: Status;
  label?: string;
}

const statusStyles: Record<Status, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  settled: 'bg-green-500/20 text-green-400 border-green-500/30',
  failed: 'bg-red-500/20 text-red-400 border-red-500/30',
  active: 'bg-green-500/20 text-green-400 border-green-500/30',
  limited: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

export default function StatusPill({ status, label }: StatusPillProps) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border', statusStyles[status])}>
      {status === 'processing' && (
        <span className="w-1.5 h-1.5 mr-1 rounded-full bg-blue-400 animate-pulse" />
      )}
      {label || status}
    </span>
  );
}
