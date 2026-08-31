
import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import NeonButton from '@/components/ui/NeonButton';
import StatusPill from '@/components/ui/StatusPill';
import { Copy, Plus, Wallet } from 'lucide-react';

const mockAddresses = [
  { id: 'addr1', address: 'EQD...abc', currency: 'TON', total: 1250, txCount: 8 },
  { id: 'addr2', address: '0x123...def', currency: 'USDC', total: 980, txCount: 5 },
];

const mockTransactionsByAddress: Record<string, any[]> = {
  addr1: [
    { id: 'TXN-001', amount: 250, currency: 'TON', status: 'settled', date: '2026-08-30' },
    { id: 'TXN-002', amount: 120, currency: 'TON', status: 'settled', date: '2026-08-29' },
    { id: 'TXN-003', amount: 380, currency: 'TON', status: 'pending', date: '2026-08-28' },
  ],
  addr2: [
    { id: 'TXN-101', amount: 500, currency: 'USDC', status: 'settled', date: '2026-08-30' },
    { id: 'TXN-102', amount: 480, currency: 'USDC', status: 'settled', date: '2026-08-27' },
  ],
};

export default function SettlementPage() {
  const [selectedAddressId, setSelectedAddressId] = useState(mockAddresses[0]?.id);
  const [showAddModal, setShowAddModal] = useState(false);

  const selectedAddress = mockAddresses.find((a) => a.id === selectedAddressId);
  const transactions = selectedAddress ? mockTransactionsByAddress[selectedAddress.id] : [];

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    alert('Address copied!');
  };

  return (
    <div className="px-3 py-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <Wallet size={18} className="text-protocol-violet" />
          Settlement
        </h1>
        <NeonButton
          variant="primary"
          className="text-xs px-3 py-1.5"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={14} className="mr-1" />
          Add Wallet
        </NeonButton>
      </div>

      {/* آدرس‌ها */}
      <div className="space-y-2 mb-4">
        {mockAddresses.map((addr) => (
          <GlassCard
            key={addr.id}
            className={`p-3 cursor-pointer transition-all ${
              selectedAddressId === addr.id ? 'ring-2 ring-protocol-violet' : 'opacity-70'
            }`}
          >
            <div
              onClick={() => setSelectedAddressId(addr.id)}
              className="flex items-center justify-between"
            >
              <div className="flex-1">
                <p className="font-mono text-xs text-white/80 break-all">{addr.address}</p>
                <p className="text-[10px] text-white/40 mt-1">{addr.currency} · {addr.txCount} tx</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyAddress(addr.address);
                }}
                className="p-2 bg-white/10 rounded-lg"
              >
                <Copy size={14} />
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* جزئیات آدرس انتخابی */}
      {selectedAddress && (
        <GlassCard className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">Recent Settlements</h3>
            <span className="text-xs text-green-400 font-bold">
              +{selectedAddress.total} {selectedAddress.currency}
            </span>
          </div>

          {transactions.map((tx, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
            >
              <div>
                <p className="text-xs font-mono text-white/80">{tx.id}</p>
                <p className="text-[10px] text-white/40">{tx.date}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-xs">
                  {tx.amount} {tx.currency}
                </p>
                <StatusPill status={tx.status} />
              </div>
            </div>
          ))}

          {transactions.length === 0 && (
            <p className="text-center py-4 text-white/40 text-sm">No settlements for this wallet</p>
          )}
        </GlassCard>
      )}

      {/* مودال افزودن آدرس */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#111118] border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-4">Add Settlement Wallet</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Wallet address"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm font-mono"
              />
              <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm">
                <option value="TON">TON</option>
                <option value="USDC">USDC</option>
                <option value="USDT">USDT</option>
              </select>
            </div>
            <div className="flex gap-2 mt-6">
              <NeonButton
                variant="secondary"
                className="flex-1"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </NeonButton>
              <NeonButton
                className="flex-1"
                onClick={() => {
                  alert('Wallet added (mock)');
                  setShowAddModal(false);
                }}
              >
                Add
              </NeonButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
