
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { Wallet, LogOut } from 'lucide-react';

export default function WalletConnector({ network }: { network: string }) {
  const { walletType, walletAddress, setWallet } = useAppStore();
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async (type: 'TON' | 'EVM') => {
    setConnecting(true);
    setTimeout(() => {
      setWallet(type, `0x${Math.random().toString(16).slice(2, 10)}...`);
      setConnecting(false);
    }, 1000);
  };

  if (walletAddress) {
    return (
      <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-xl border border-green-500/20">
        <div>
          <span className="text-green-400 text-sm block">✅ Connected</span>
          <span className="text-white/50 text-xs font-mono">{walletAddress}</span>
        </div>
        <button onClick={() => setWallet(null, null)} className="p-2 bg-white/10 rounded-lg text-white/50 hover:bg-white/20">
          <LogOut size={16} />
        </button>
      </div>
    );
  }

  // TON Connect - دکمه سفارشی
  if (network === 'TON') {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleConnect('TON')}
        className="w-full p-4 bg-gradient-to-r from-[#0098EA]/20 to-[#0098EA]/10 border border-[#0098EA]/30 rounded-xl flex items-center justify-center gap-3"
      >
        <div className="w-8 h-8 rounded-full bg-[#0098EA] flex items-center justify-center">
          <span className="text-white font-bold text-sm">T</span>
        </div>
        <span className="text-[#0098EA] font-semibold text-sm">Connect TON Wallet</span>
      </motion.button>
    );
  }

  // EVM Connect - دکمه سفارشی
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => handleConnect('EVM')}
      className="w-full p-4 bg-gradient-to-r from-purple-500/20 to-purple-500/10 border border-purple-500/30 rounded-xl flex items-center justify-center gap-3"
    >
      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
        <Wallet size={16} className="text-white" />
      </div>
      <span className="text-purple-400 font-semibold text-sm">Connect EVM Wallet</span>
    </motion.button>
  );
}
