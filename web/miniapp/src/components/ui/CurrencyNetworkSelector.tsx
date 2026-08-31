
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import TokenIconComponent from '@/components/ui/TokenIcon';

interface CurrencyNetworkSelectorProps {
  currencies: string[];
  networks: string[];
  selectedCurrency: string;
  selectedNetwork: string;
  onSelectCurrency: (currency: string) => void;
  onSelectNetwork: (network: string) => void;
}

export default function CurrencyNetworkSelector({
  currencies,
  networks,
  selectedCurrency,
  selectedNetwork,
  onSelectCurrency,
  onSelectNetwork,
}: CurrencyNetworkSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'currency' | 'network'>('currency');

  const handleSelect = (item: string) => {
    if (mode === 'currency') {
      onSelectCurrency(item);
    } else {
      onSelectNetwork(item);
    }
    setIsOpen(false);
  };

  return (
    <div className="flex gap-2 w-full">
      {/* انتخاب ارز */}
      <button
        onClick={() => { setMode('currency'); setIsOpen(true); }}
        className="flex-1 flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl"
      >
        <TokenIconComponent symbol={selectedCurrency} size={20} />
        <span className="flex-1 text-left text-sm font-semibold">{selectedCurrency}</span>
        <ChevronDown size={16} />
      </button>

      {/* انتخاب شبکه */}
      <button
        onClick={() => { setMode('network'); setIsOpen(true); }}
        className="flex-1 flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl"
      >
        <span className="flex-1 text-left text-sm font-semibold">{selectedNetwork}</span>
        <ChevronDown size={16} />
      </button>

      {/* مودال انتخاب */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-protocol-deep border-t border-white/10 rounded-t-3xl p-6"
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-4">
                {mode === 'currency' ? 'Select Currency' : 'Select Network'}
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {mode === 'currency'
                  ? currencies.map((currency) => (
                      <button
                        key={currency}
                        onClick={() => handleSelect(currency)}
                        className="flex items-center gap-3 w-full px-4 py-3 bg-white/5 rounded-xl hover:bg-white/10"
                      >
                        <TokenIconComponent symbol={currency} size={24} />
                        <span className="flex-1 text-left text-sm">{currency}</span>
                        {selectedCurrency === currency && <Check size={16} className="text-protocol-ton" />}
                      </button>
                    ))
                  : networks.map((network) => (
                      <button
                        key={network}
                        onClick={() => handleSelect(network)}
                        className="flex items-center gap-3 w-full px-4 py-3 bg-white/5 rounded-xl hover:bg-white/10"
                      >
                        <span className="flex-1 text-left text-sm">{network}</span>
                        {selectedNetwork === network && <Check size={16} className="text-protocol-ton" />}
                      </button>
                    ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
