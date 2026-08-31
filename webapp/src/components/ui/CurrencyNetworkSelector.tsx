
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

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
  const dropdownRef = useRef<HTMLDivElement>(null);

  // بستن منو با کلیک بیرون
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      <div className="flex-1 relative" ref={dropdownRef}>
        <button
          onClick={() => { setMode('currency'); setIsOpen(!isOpen); }}
          className="w-full flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl"
        >
          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-protocol-violet to-protocol-ton flex items-center justify-center text-[10px] font-bold">
            {selectedCurrency.slice(0, 1)}
          </span>
          <span className="flex-1 text-left text-sm font-semibold">{selectedCurrency}</span>
          <ChevronDown size={16} className={isOpen ? 'rotate-180' : ''} />
        </button>

        {/* Dropdown - دقیقاً زیر دکمه */}
        <AnimatePresence>
          {isOpen && mode === 'currency' && (
            <motion.div
              className="absolute top-full left-0 right-0 mt-2 bg-protocol-deep border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
            >
              {currencies.map((currency) => (
                <button
                  key={currency}
                  onClick={() => handleSelect(currency)}
                  className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/10 transition-colors"
                >
                  <span className="w-6 h-6 rounded-full bg-gradient-to-br from-protocol-violet to-protocol-ton flex items-center justify-center text-[10px] font-bold">
                    {currency.slice(0, 1)}
                  </span>
                  <span className="flex-1 text-left text-sm">{currency}</span>
                  {selectedCurrency === currency && <Check size={16} className="text-protocol-ton" />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* انتخاب شبکه */}
      <div className="flex-1 relative">
        <button
          onClick={() => { setMode('network'); setIsOpen(!isOpen); }}
          className="w-full flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl"
        >
          <span className="flex-1 text-left text-sm font-semibold">{selectedNetwork}</span>
          <ChevronDown size={16} className={isOpen ? 'rotate-180' : ''} />
        </button>

        {/* Dropdown - دقیقاً زیر دکمه */}
        <AnimatePresence>
          {isOpen && mode === 'network' && (
            <motion.div
              className="absolute top-full left-0 right-0 mt-2 bg-protocol-deep border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
            >
              {networks.map((network) => (
                <button
                  key={network}
                  onClick={() => handleSelect(network)}
                  className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/10 transition-colors"
                >
                  <span className="flex-1 text-left text-sm">{network}</span>
                  {selectedNetwork === network && <Check size={16} className="text-protocol-ton" />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
