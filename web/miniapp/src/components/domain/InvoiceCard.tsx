
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import StatusPill from '@/components/ui/StatusPill';
import NetworkBadge from '@/components/ui/NetworkBadge';
import { Invoice } from '@/types';

interface InvoiceCardProps {
  invoice: Invoice;
}

export default function InvoiceCard({ invoice }: InvoiceCardProps) {
  const { id, amount, currency, sourceNetwork, targetNetwork, status, merchantAddress } = invoice;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <GlassCard glow className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] text-white/50 font-mono">Invoice ID</p>
            <p className="font-mono text-xs text-white/80">{id}</p>
          </div>
          <StatusPill status={status} />
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold">
            {amount} <span className="text-sm">{currency}</span>
          </p>
          <p className="text-white/40 text-xs mt-0.5">≈ $1,234.56 USD</p>
        </div>
        <div className="mt-3 flex items-center gap-1.5">
          <NetworkBadge network={sourceNetwork} />
          <span className="text-white/40 text-xs">→</span>
          <NetworkBadge network={targetNetwork} />
        </div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-white/50">Merchant:</span>
          <span className="font-mono text-[10px]">{merchantAddress.slice(0, 6)}...{merchantAddress.slice(-4)}</span>
        </div>
      </GlassCard>
    </motion.div>
  );
}
