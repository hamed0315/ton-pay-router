
import { cn } from '@/utils/cn';

type Network = 'TON' | 'EVM' | 'Base' | 'Ethereum' | 'TRON' | 'Solana';

interface NetworkBadgeProps {
  network: Network;
  className?: string;
}

const networkColors: Record<Network, string> = {
  TON: 'bg-[#0098EA]/20 text-[#0098EA] border-[#0098EA]/30',
  EVM: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Base: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Ethereum: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  TRON: 'bg-red-500/20 text-red-400 border-red-500/30',
  Solana: 'bg-green-500/20 text-green-400 border-green-500/30',
};

export default function NetworkBadge({ network, className }: NetworkBadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-mono border', networkColors[network], className)}>
      {network}
    </span>
  );
}
