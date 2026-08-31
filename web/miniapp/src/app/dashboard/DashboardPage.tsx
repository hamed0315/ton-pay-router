
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import GlassCard from '@/components/ui/GlassCard';
import StatusPill from '@/components/ui/StatusPill';
import NeonButton from '@/components/ui/NeonButton';
import ErrorBanner from '@/components/ui/ErrorBanner';
import { useQuery } from '@tanstack/react-query';
import { statsApi, invoiceApi } from '@/services/api';
import { Link2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const { t } = useTranslation();
  const [error, setError] = useState('');

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: statsApi.get,
  });
  const { data: transactions } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: () => statsApi.recentTransactions(10),
  });

  const chartData = [
    { day: 'Mon', volume: 1200 },
    { day: 'Tue', volume: 1800 },
    { day: 'Wed', volume: 1400 },
    { day: 'Thu', volume: 2200 },
    { day: 'Fri', volume: 1900 },
    { day: 'Sat', volume: 2800 },
    { day: 'Sun', volume: 2500 },
  ];

  const copyInvoiceLink = async () => {
    setError('');
    try {
      const invoice = await invoiceApi.create({
        amount: '1000000',
        source_currency: 'USDT_TON',
        dest_currency: 'USDC_BASE',
      });
      navigator.clipboard.writeText(invoice.payment_link || '');
      alert('Link copied!');
    } catch (e: any) {
      const msg = e?.message || 'Failed to create invoice. Please make sure you are logged in or connected via Telegram.';
      setError(msg);
    }
  };

  return (
    <div className="px-3 py-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold">{t('dashboard.title')}</h1>
          <p className="text-white/50 text-xs">{t('dashboard.welcome')}</p>
        </div>
        <NeonButton variant="primary" className="text-xs px-3 py-1.5" onClick={copyInvoiceLink}>
          <Link2 size={14} className="mr-1" />
          {t('dashboard.newInvoice')}
        </NeonButton>
      </div>

      {error && <ErrorBanner message={error} onClose={() => setError('')} />}

      <div className="grid grid-cols-2 gap-2 mb-4">
        <GlassCard className="p-3">
          <p className="text-lg font-bold text-green-400">{stats?.total_invoices ?? 0}</p>
          <p className="text-white/50 text-[10px]">Invoices</p>
        </GlassCard>
        <GlassCard className="p-3">
          <p className="text-lg font-bold text-green-400">{stats?.total_settled ?? 0}</p>
          <p className="text-white/50 text-[10px]">Settled</p>
        </GlassCard>
        <GlassCard className="p-3">
          <p className="text-lg font-bold text-green-400">{stats?.total_pending ?? 0}</p>
          <p className="text-white/50 text-[10px]">Pending</p>
        </GlassCard>
        <GlassCard className="p-3">
          <p className="text-lg font-bold text-green-400">{stats?.total_volume ?? 0}</p>
          <p className="text-white/50 text-[10px]">Volume</p>
        </GlassCard>
      </div>

      <GlassCard className="p-3 mb-4">
        <h3 className="text-sm font-semibold mb-2">{t('dashboard.volumeChart')}</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A855F7" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#0098EA" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" fontSize={10} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={10} />
            <Tooltip contentStyle={{ backgroundColor: '#0B0B14', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', color: 'white' }} />
            <Area type="monotone" dataKey="volume" stroke="#A855F7" strokeWidth={2} fill="url(#colorVolume)" activeDot={{ r: 6, fill: '#0098EA', stroke: 'white' }} />
          </AreaChart>
        </ResponsiveContainer>
      </GlassCard>

      <GlassCard className="p-3">
        <h3 className="text-sm font-semibold mb-2">{t('dashboard.recentTransactions')}</h3>
        {transactions?.map((tx, i) => (
          <div key={i} className="flex justify-between py-1 border-b border-white/5 last:border-0">
            <div>
              <p className="text-xs font-mono">{tx.id}</p>
              <p className="text-[10px] text-white/40">{tx.created_at}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-xs">{tx.amount_src} → {tx.amount_dst}</p>
              <StatusPill status={tx.status} />
            </div>
          </div>
        ))}
      </GlassCard>
    </div>
  );
}
