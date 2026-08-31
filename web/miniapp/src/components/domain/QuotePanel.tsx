
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import GradientText from '@/components/ui/GradientText';
import { Quote } from '@/types';

interface QuotePanelProps {
  quote: Quote | null;
  loading: boolean;
}

export default function QuotePanel({ quote, loading }: QuotePanelProps) {
  return (
    <AnimatePresence>
      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-3 bg-white/5 rounded-lg flex justify-center">
          <div className="w-5 h-5 border-2 border-protocol-violet border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}
      {quote && !loading && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <GlassCard className="p-3">
            <div className="flex justify-between text-xs">
              <span className="text-white/60">Rate</span>
              <span className="font-mono">1 {quote.fromCurrency} = {quote.rate.toFixed(6)} {quote.toCurrency}</span>
            </div>
            <div className="flex justify-between text-xs mt-1.5">
              <span className="text-white/60">You receive</span>
              <span className="font-mono"><GradientText>{quote.receiveAmount.toFixed(4)} {quote.toCurrency}</GradientText></span>
            </div>
            <div className="flex justify-between text-xs mt-1.5">
              <span className="text-white/60">Network fee</span>
              <span className="font-mono">{quote.fee.toFixed(4)} {quote.fromCurrency}</span>
            </div>
            <div className="flex justify-between text-xs mt-1.5">
              <span className="text-white/60">Provider</span>
              <span className="font-mono text-protocol-ton">{quote.provider}</span>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
