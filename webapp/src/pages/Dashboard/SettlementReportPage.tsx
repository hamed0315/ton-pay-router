
import { useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import StatusPill from '@/components/ui/StatusPill';
import NeonButton from '@/components/ui/NeonButton';
import { Wallet, ArrowUpRight, Copy, Check, Plus, ChevronDown, X } from 'lucide-react';

// Mock data: چند آدرس تسویه
const mockAddresses = [
  { id: 'addr1', label: 'Store Wallet (TON)', address: 'UQDP...abc123', network: 'TON' },
  { id: 'addr2', label: 'Business Wallet (EVM)', address: '0x123...def456', network: 'EVM' },
  { id: 'addr3', label: 'Savings (Base)', address: '0x789...ghi789', network: 'Base' },
];

// Mock transactions per address
const mockTransactions: Record<string, any[]> = {
  addr1: [
    { id: 'INV-001', amount: '100 USDT', status: 'settled', date: '2026-08-29' },
    { id: 'INV-002', amount: '250 USDC', status: 'settled', date: '2026-08-28' },
  ],
  addr2: [
    { id: 'INV-003', amount: '500 TON', status: 'settled', date: '2026-08-27' },
  ],
  addr3: [],
};

export default function SettlementReportPage() {
  const [selectedId, setSelectedId] = useState(mockAddresses[0].id);
  const [copied, setCopied] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const selectedAddress = mockAddresses.find(a => a.id === selectedId)!;
  const transactions = mockTransactions[selectedId] || [];

  const totalSettled = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

  const copyAddress = () => {
    navigator.clipboard.writeText(selectedAddress.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg font-bold">Settlement Report</h1>
        <NeonButton variant="primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} className="mr-1" /> Add New Address
        </NeonButton>
      </div>

      {/* انتخاب آدرس */}
      <GlassCard className="p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm appearance-none"
            >
              {mockAddresses.map(addr => (
                <option key={addr.id} value={addr.id}>{addr.label} ({addr.address.slice(0, 8)}...)</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-protocol-violet flex items-center justify-center">
              <Wallet size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-white/50">{selectedAddress.label}</p>
              <p className="font-mono text-sm text-white/80">{selectedAddress.address}</p>
              <p className="text-xs text-protocol-ton">Network: {selectedAddress.network}</p>
            </div>
          </div>
          <button onClick={copyAddress} className="p-2 bg-white/5 rounded-lg hover:bg-white/10">
            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
          </button>
        </div>
      </GlassCard>

      {/* آمار برای آدرس انتخاب شده */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <GlassCard glow className="p-4">
          <p className="text-white/50 text-xs">Total Settled</p>
          <p className="text-2xl font-bold mt-1">${totalSettled.toFixed(2)}</p>
        </GlassCard>
        <GlassCard glow className="p-4">
          <p className="text-white/50 text-xs">Successful Transactions</p>
          <p className="text-2xl font-bold mt-1">{transactions.length}</p>
        </GlassCard>
      </div>

      {/* لیست تراکنش‌های این آدرس */}
      <GlassCard className="p-4">
        <h3 className="text-sm font-semibold mb-4">Transactions for this address</h3>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-white/40">
            <p>No settled transactions yet for this address.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between border-b border-white/5 last:border-0 py-2">
                <div>
                  <p className="text-xs font-mono">{tx.id}</p>
                  <p className="text-[10px] text-white/40">{tx.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs">{tx.amount}</p>
                  <StatusPill status={tx.status as any} />
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* مودال افزودن آدرس جدید (Mock) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-protocol-deep border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Add New Settlement Address</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 bg-white/10 rounded-lg">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-white/60 mb-1">Label</label>
                <input type="text" placeholder="My Wallet" className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Network</label>
                <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm">
                  <option>TON</option>
                  <option>EVM</option>
                  <option>Base</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Address</label>
                <input type="text" placeholder="UQ... or 0x..." className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm font-mono" />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <NeonButton variant="secondary" className="flex-1" onClick={() => setShowAddModal(false)}>Cancel</NeonButton>
              <NeonButton className="flex-1" onClick={() => setShowAddModal(false)}>Save</NeonButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
