
import GlassCard from '@/components/ui/GlassCard';
import NeonButton from '@/components/ui/NeonButton';
import StatusPill from '@/components/ui/StatusPill';
import { TrendingUp, FileCheck, DollarSign, Server } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

const chartData = [
  { day: 'Mon', volume: 1200 },
  { day: 'Tue', volume: 1800 },
  { day: 'Wed', volume: 1400 },
  { day: 'Thu', volume: 2200 },
  { day: 'Fri', volume: 1900 },
  { day: 'Sat', volume: 2800 },
  { day: 'Sun', volume: 2500 },
];

export default function OverviewPage() {
  const navigate = useNavigate();
  const stats = [
    { label: 'Total Revenue', value: '$12,345', change: '+15%', icon: DollarSign },
    { label: 'Total Volume', value: '$25,000', change: '+12%', icon: TrendingUp },
    { label: 'Invoices', value: '128', change: '+8%', icon: FileCheck },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold">Dashboard</h1>
        {/* دکمه Create Gateway جایگزین New Invoice شد */}
        <NeonButton variant="primary" className="text-xs px-3 py-1.5" onClick={() => navigate('/dashboard/gateways')}>
          <Server size={14} className="mr-1" /> Create Gateway
        </NeonButton>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {stats.map((item) => (
          <GlassCard key={item.label} glow className="p-4">
            <div className="flex items-center justify-between mb-1">
              <item.icon size={18} className="text-protocol-violet" />
              <span className="text-[10px] text-green-400">{item.change}</span>
            </div>
            <p className="text-xl md:text-2xl font-bold">{item.value}</p>
            <p className="text-white/50 text-[10px] md:text-xs mt-0.5">{item.label}</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-4 mb-6">
        <h3 className="text-sm font-semibold mb-4">Transaction Volume</h3>
        <ResponsiveContainer width="100%" height={250}>
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

      <GlassCard className="p-4">
        <h3 className="text-sm font-semibold mb-4">Recent Transactions</h3>
        <div className="space-y-2">
          {[
            { id: 'INV-001', amount: '100 USDT', status: 'settled', date: '2026-08-29' },
            { id: 'INV-002', amount: '250 USDC', status: 'pending', date: '2026-08-28' },
            { id: 'INV-003', amount: '500 TON', status: 'failed', date: '2026-08-27' },
          ].map((tx) => (
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
      </GlassCard>
    </div>
  );
}
