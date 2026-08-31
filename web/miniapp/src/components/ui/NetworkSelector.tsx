
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export type Network = 'TON' | 'EVM' | 'Base' | 'Ethereum' | 'BSC';

interface NetworkSelectorProps {
  selected: Network;
  onSelect: (network: Network) => void;
}

const networks: Network[] = ['TON', 'EVM', 'Base', 'Ethereum', 'BSC'];

export default function NetworkSelector({ selected, onSelect }: NetworkSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm"
      >
        <span className="flex-1 text-left">{selected}</span>
        <ChevronDown size={16} className={isOpen ? 'rotate-180' : ''} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-2 bg-protocol-deep border border-white/10 rounded-xl overflow-hidden z-50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {networks.map((network) => (
              <button
                key={network}
                onClick={() => {
                  onSelect(network);
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 w-full px-4 py-3 text-sm hover:bg-white/5"
              >
                <span className="flex-1 text-left">{network}</span>
                {selected === network && <Check size={16} className="text-protocol-ton" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
