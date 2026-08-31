
import { useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import NeonButton from '@/components/ui/NeonButton';
import StatusPill from '@/components/ui/StatusPill';
import { Search, Plus, Copy, Check, X } from 'lucide-react';

interface Invoice {
  id: string;
  amount: string;
  currency: string;
  network: string;
  status: 'pending' | 'settled' | 'failed';
  date: string;
  paymentLink: string;
}

const initialInvoices: Invoice[] = [
  { id: 'INV-001', amount: '100', currency: 'USDT', network: 'TON', status: 'settled', date: '2026-08-29', paymentLink: 'http://localhost:3001/pay/INV-001/fixed' },
];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newLink, setNewLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ amount: '', currency: 'USDT', network: 'TON', description: '' });

  const openCreate = () => {
    setForm({ amount: '', currency: 'USDT', network: 'TON', description: '' });
    setNewLink('');
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.amount) return;
    const invoiceId = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
    // لینک به صورت fixed ساخته می‌شود چون فروشنده ارز و شبکه را انتخاب کرده
    const link = `http://localhost:3001/pay/${invoiceId}/fixed`;
    const newInvoice: Invoice = {
      id: invoiceId,
      amount: form.amount,
      currency: form.currency,
      network: form.network,
      status: 'pending',
      date: new Date().toISOString().slice(0, 10),
      paymentLink: link,
    };
    setInvoices([newInvoice, ...invoices]);
    setNewLink(link);
  };

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const closeModal = () => {
    setShowModal(false);
    setNewLink('');
    setForm({ amount: '', currency: 'USDT', network: 'TON', description: '' });
  };

  const filtered = invoices.filter(i => i.id.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg font-bold">Invoices</h1>
        <NeonButton variant="primary" onClick={openCreate}>
          <Plus size={16} className="mr-1" /> Create Invoice
        </NeonButton>
      </div>

      <div className="flex items-center gap-2 mb-4 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 max-w-md">
        <Search size={16} className="text-white/40" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by Invoice ID..." className="bg-transparent flex-1 focus:outline-none" />
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <p className="text-white/50">No invoices found</p>
          </GlassCard>
        ) : (
          filtered.map((inv) => (
            <GlassCard key={inv.id} className="p-4 flex justify-between items-center">
              <div>
                <p className="font-mono text-sm">{inv.id}</p>
                <p className="text-[10px] text-white/40">{inv.date}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm">{inv.amount} {inv.currency}</p>
                <div className="flex items-center gap-2 mt-1">
                  <StatusPill status={inv.status} />
                  <button onClick={() => copyLink(inv.paymentLink)} className="text-[10px] text-white/40 hover:text-white">
                    <Copy size={12} />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-protocol-deep border border-white/10 rounded-2xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">{newLink ? 'Invoice Created!' : 'Create Invoice'}</h3>
              <button onClick={closeModal} className="p-2 bg-white/10 rounded-lg">
                <X size={16} />
              </button>
            </div>

            {newLink ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                  <Check size={32} className="text-green-400" />
                </div>
                <p className="text-green-400 font-bold mb-2">Payment Link Generated!</p>
                <p className="text-white/60 text-sm mb-4">Share this link with your customer.</p>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-3 mb-4">
                  <span className="font-mono text-xs text-white/80 flex-1 break-all">{newLink}</span>
                  <button onClick={() => copyLink(newLink)} className="p-2 bg-white/10 rounded-lg hover:bg-white/20">
                    {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                  </button>
                </div>
                <div className="flex gap-2">
                  <NeonButton variant="secondary" className="flex-1" onClick={closeModal}>Close</NeonButton>
                  <NeonButton className="flex-1" onClick={() => copyLink(newLink)}>
                    {copied ? 'Copied!' : 'Copy Link'}
                  </NeonButton>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-white/60 mb-1">Amount</label>
                  <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm font-mono" placeholder="100" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Currency</label>
                    <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm">
                      <option value="USDT">USDT</option>
                      <option value="USDC">USDC</option>
                      <option value="TON">TON</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Network</label>
                    <select value={form.network} onChange={(e) => setForm({ ...form, network: e.target.value })} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm">
                      <option value="TON">TON</option>
                      <option value="EVM">EVM</option>
                      <option value="Base">Base</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1">Description (optional)</label>
                  <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm" placeholder="Order #123" />
                </div>
                <div className="flex gap-2 mt-6">
                  <NeonButton variant="secondary" className="flex-1" onClick={closeModal}>Cancel</NeonButton>
                  <NeonButton className="flex-1" onClick={handleSave}>Create & Generate Link</NeonButton>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
