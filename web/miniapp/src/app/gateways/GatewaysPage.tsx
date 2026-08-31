
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import NeonButton from '@/components/ui/NeonButton';
import { Copy, Plus, Power, X, Server } from 'lucide-react';
import { gatewayApi, Gateway } from '@/services/api';

export default function GatewaysPage() {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadGateways();
  }, []);

  const loadGateways = async () => {
    setLoading(true);
    try {
      const data = await gatewayApi.list();
      setGateways(data);
    } catch (e) {
      setError('Failed to load gateways. Are you connected?');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setError('');
    try {
      const newGateway = await gatewayApi.create({ name: form.name });
      setGateways([newGateway, ...gateways]);
      setIsModalOpen(false);
      setForm({ name: '' });
    } catch (e: any) {
      setError(e?.message || 'Failed to create gateway');
    }
  };

  const toggleGateway = async (id: string) => {
    try {
      const updated = await gatewayApi.toggle(id);
      setGateways(gateways.map((g) => (g.id === id ? updated : g)));
    } catch (e) {
      setError('Failed to toggle gateway');
    }
  };

  const revokeGateway = async (id: string) => {
    try {
      await gatewayApi.revoke(id);
      setGateways(gateways.filter((g) => g.id !== id));
    } catch (e) {
      setError('Failed to revoke gateway');
    }
  };

  return (
    <div className="px-3 py-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <Server size={18} className="text-protocol-violet" />
          Gateways
        </h1>
        <NeonButton variant="primary" className="text-xs px-3 py-1.5" onClick={() => setIsModalOpen(true)}>
          <Plus size={14} className="mr-1" />
          Create
        </NeonButton>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-white/50">Loading...</div>
      ) : gateways.length === 0 ? (
        <div className="text-center py-10 text-white/50">No gateways yet</div>
      ) : (
        <div className="space-y-3">
          {gateways.map((gateway) => (
            <GlassCard key={gateway.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{gateway.name}</h3>
                  <p className="text-xs text-white/50 mt-1">Created: {gateway.created_at}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${gateway.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                  {gateway.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <button onClick={() => toggleGateway(gateway.id)} className="px-3 py-2 bg-white/5 rounded-lg text-xs flex items-center justify-center gap-1 hover:bg-white/10">
                  <Power size={12} />
                  {gateway.is_active ? 'Disable' : 'Enable'}
                </button>
                <button onClick={() => revokeGateway(gateway.id)} className="px-3 py-2 bg-red-500/20 rounded-lg text-xs flex items-center justify-center gap-1 hover:bg-red-500/30 text-red-400">
                  <X size={12} />
                  Revoke
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              className="relative w-full max-w-sm bg-[#111118] border border-white/10 rounded-3xl p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Create Gateway</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 bg-white/10 rounded-lg">
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-white/60 mb-1">Gateway Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ name: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm"
                    placeholder="e.g., My Shop"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <NeonButton variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </NeonButton>
                <NeonButton className="flex-1" onClick={handleCreate}>
                  Create
                </NeonButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
