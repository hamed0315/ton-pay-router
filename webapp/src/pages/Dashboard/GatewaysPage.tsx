
import { useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import NeonButton from '@/components/ui/NeonButton';
import { Server, Plus, Copy, Pencil, Power, X, Check } from 'lucide-react';

interface Gateway {
  id: string;
  name: string;
  network: string;
  currency: string;
  address: string;
  webhook: string;
  active: boolean;
  apiKey: string;
  createdAt: string;
}

const initialGateways: Gateway[] = [
  {
    id: 'gw_1',
    name: 'Store Gateway',
    network: 'TON',
    currency: 'USDT',
    address: 'UQDP...abc123',
    webhook: 'https://example.com/webhook1',
    active: true,
    apiKey: 'sk_test_abc123',
    createdAt: '2026-08-29',
  },
];

export default function GatewaysPage() {
  const [gateways, setGateways] = useState<Gateway[]>(initialGateways);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Gateway | null>(null);
  const [newApiKey, setNewApiKey] = useState('');
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    name: '',
    network: 'TON',
    currency: 'USDT',
    address: '',
    webhook: '',
    active: true,
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', network: 'TON', currency: 'USDT', address: '', webhook: '', active: true });
    setNewApiKey('');
    setShowModal(true);
  };

  const openEdit = (gw: Gateway) => {
    setEditing(gw);
    setForm({ name: gw.name, network: gw.network, currency: gw.currency, address: gw.address, webhook: gw.webhook, active: gw.active });
    setNewApiKey('');
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name || !form.address) return;

    if (editing) {
      setGateways(gateways.map(g => g.id === editing.id ? { ...editing, ...form } : g));
    } else {
      const newGw: Gateway = {
        id: `gw_${Date.now()}`,
        ...form,
        apiKey: `sk_live_${Math.random().toString(36).slice(2, 10)}`,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setGateways([newGw, ...gateways]);
      setNewApiKey(newGw.apiKey); // نمایش API Key بعد از ایجاد
    }
    setShowModal(false);
  };

  const toggleActive = (id: string) => {
    setGateways(gateways.map(g => g.id === id ? { ...g, active: !g.active } : g));
  };

  const copyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg font-bold">Gateways</h1>
        <NeonButton variant="primary" onClick={openCreate}>
          <Plus size={16} className="mr-1" /> Create Gateway
        </NeonButton>
      </div>

      {/* نمایش API Key بعد از ایجاد */}
      {newApiKey && (
        <GlassCard glow className="p-4 mb-6 border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-sm font-semibold mb-1">API Key Generated Successfully!</p>
              <p className="font-mono text-xs text-white/80 break-all">{newApiKey}</p>
            </div>
            <button onClick={() => copyApiKey(newApiKey)} className="p-2 bg-white/10 rounded-lg hover:bg-white/20">
              {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
            </button>
          </div>
        </GlassCard>
      )}

      {/* لیست درگاه‌ها */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gateways.map((gw) => (
          <GlassCard key={gw.id} className="p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold">{gw.name}</h3>
                <p className="text-xs text-white/50">{gw.currency} on {gw.network}</p>
                <p className="text-xs text-white/40 font-mono mt-1">{gw.address}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-[10px] ${gw.active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                {gw.active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={() => copyApiKey(gw.apiKey)} className="flex-1 py-2 bg-white/5 rounded-lg text-xs flex items-center justify-center gap-1 hover:bg-white/10">
                <Copy size={12} /> Copy API
              </button>
              <button onClick={() => openEdit(gw)} className="px-3 py-2 bg-white/5 rounded-lg text-xs hover:bg-white/10">
                <Pencil size={12} />
              </button>
              <button onClick={() => toggleActive(gw.id)} className="px-3 py-2 bg-white/5 rounded-lg text-xs hover:bg-white/10">
                <Power size={12} />
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* مودال ایجاد/ویرایش */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-protocol-deep border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">{editing ? 'Edit Gateway' : 'Create Gateway'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 bg-white/10 rounded-lg">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-white/60 mb-1">Gateway Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm"
                  placeholder="My Store Gateway"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/60 mb-1">Network</label>
                  <select
                    value={form.network}
                    onChange={(e) => setForm({ ...form, network: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="TON">TON</option>
                    <option value="EVM">EVM</option>
                    <option value="Base">Base</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1">Currency</label>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="USDT">USDT</option>
                    <option value="USDC">USDC</option>
                    <option value="TON">TON</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-white/60 mb-1">Settlement Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm font-mono"
                  placeholder="UQ... or 0x..."
                />
              </div>

              <div>
                <label className="block text-xs text-white/60 mb-1">Webhook (optional)</label>
                <input
                  type="text"
                  value={form.webhook}
                  onChange={(e) => setForm({ ...form, webhook: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm font-mono"
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm">Active</span>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <NeonButton variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
                Cancel
              </NeonButton>
              <NeonButton className="flex-1" onClick={handleSave}>
                {editing ? 'Save Changes' : 'Create & Generate API'}
              </NeonButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
