
import { useState, useEffect } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import StatusPill from '@/components/ui/StatusPill';
import { useTranslation } from 'react-i18next';
import { Search, Plus } from 'lucide-react';
import { invoiceApi, Invoice } from '@/services/api';

export default function InvoicesPage() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const data = await invoiceApi.list(50, 0);
      setInvoices(data);
    } catch (e) {
      console.error(e);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = invoices.filter((inv) => {
    const statusMatch = filter === 'all' || inv.status === filter;
    const searchMatch = inv.id.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && searchMatch;
  });

  const createQuickInvoice = async () => {
    try {
      const invoice = await invoiceApi.create({
        amount: '1000000',
        source_currency: 'USDT_TON',
        dest_currency: 'USDC_BASE',
        expires_in: 900,
      });
      setInvoices([invoice, ...invoices]);
      if (invoice.payment_link) {
        navigator.clipboard.writeText(invoice.payment_link);
        alert('Invoice created and link copied!');
      }
    } catch (e) {
      alert('Failed to create invoice');
    }
  };

  return (
    <div className="px-3 py-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold">{t('invoices.title')}</h1>
        <button onClick={createQuickInvoice} className="bg-protocol-violet px-3 py-1.5 rounded-lg text-xs flex items-center gap-1">
          <Plus size={14} />
          Create
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
          <Search size={16} className="text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by invoice ID..."
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
        </div>
      </div>

      <div className="flex gap-1.5 mb-4">
        {['all', 'pending', 'settled', 'failed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-lg text-xs ${filter === f ? 'bg-protocol-violet text-white' : 'bg-white/10 text-white/60'}`}
          >
            {t(`invoices.filter${f.charAt(0).toUpperCase() + f.slice(1)}`)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-10 text-white/50">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-white/50">No invoices found</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((inv) => (
            <GlassCard key={inv.id} className="p-3 flex justify-between items-center">
              <div>
                <p className="font-mono text-xs">{inv.id}</p>
                <p className="text-white/50 text-[10px]">{inv.expires_at}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-xs">{inv.amount} {inv.source_currency} → {inv.dest_currency}</p>
                <StatusPill status={inv.status} />
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
