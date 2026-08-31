
import { useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import NeonButton from '@/components/ui/NeonButton';
import { LifeBuoy, Plus, X, MessageSquare, CheckCircle2, Clock, XCircle } from 'lucide-react';

interface Ticket {
  id: string;
  subject: string;
  category: string;
  status: 'open' | 'pending' | 'closed';
  createdAt: string;
  lastMessage: string;
}

const initialTickets: Ticket[] = [
  { id: 'T-1001', subject: 'Problem with payout', category: 'Payments', status: 'open', createdAt: '2026-08-29', lastMessage: 'I have not received my funds for the last invoice.' },
  { id: 'T-1000', subject: 'How to connect API?', category: 'Technical', status: 'closed', createdAt: '2026-08-28', lastMessage: 'Solved. Thanks for the help!' },
];

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ subject: '', category: 'General', message: '' });

  const openCreate = () => {
    setForm({ subject: '', category: 'General', message: '' });
    setShowModal(true);
  };

  const handleCreate = () => {
    if (!form.subject || !form.message) return;
    const newTicket: Ticket = {
      id: `T-${1000 + tickets.length + 1}`,
      subject: form.subject,
      category: form.category,
      status: 'open',
      createdAt: new Date().toISOString().slice(0, 10),
      lastMessage: form.message,
    };
    setTickets([newTicket, ...tickets]);
    setShowModal(false);
  };

  const statusIcon = (status: Ticket['status']) => {
    switch (status) {
      case 'open': return <span className="flex items-center gap-1 text-green-400 text-xs"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> Open</span>;
      case 'pending': return <span className="flex items-center gap-1 text-yellow-400 text-xs"><Clock size={12} /> Pending</span>;
      case 'closed': return <span className="flex items-center gap-1 text-gray-400 text-xs"><XCircle size={12} /> Closed</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <LifeBuoy size={20} className="text-protocol-ton" />
          Support Tickets
        </h1>
        <NeonButton variant="primary" onClick={openCreate}>
          <Plus size={16} className="mr-1" /> New Ticket
        </NeonButton>
      </div>

      {/* لیست تیکت‌ها */}
      {tickets.length === 0 ? (
        <GlassCard className="p-8 text-center text-white/40">
          <LifeBuoy size={40} className="mx-auto mb-4 text-white/20" />
          <p>No support tickets yet. Create one if you need help.</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <GlassCard key={ticket.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-mono text-xs text-white/40">{ticket.id}</p>
                  <h3 className="font-semibold mt-1">{ticket.subject}</h3>
                </div>
                {statusIcon(ticket.status)}
              </div>
              <p className="text-sm text-white/50 line-clamp-2 mb-3">{ticket.lastMessage}</p>
              <div className="flex justify-between items-center text-xs text-white/30">
                <span>{ticket.category}</span>
                <span>{ticket.createdAt}</span>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* مودال ایجاد تیکت */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-protocol-deep border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Create New Ticket</h3>
              <button onClick={() => setShowModal(false)} className="p-2 bg-white/10 rounded-lg">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-white/60 mb-1">Subject</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm"
                  placeholder="Brief description of your issue"
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm"
                >
                  <option>General</option>
                  <option>Payments</option>
                  <option>Technical</option>
                  <option>API</option>
                  <option>Billing</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Message</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm h-32 resize-none"
                  placeholder="Describe your issue in detail..."
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <NeonButton variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
                Cancel
              </NeonButton>
              <NeonButton className="flex-1" onClick={handleCreate}>
                Submit Ticket
              </NeonButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
