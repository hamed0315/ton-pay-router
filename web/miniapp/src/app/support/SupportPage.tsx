
import { useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import NeonButton from '@/components/ui/NeonButton';
import { LifeBuoy, Plus, X } from 'lucide-react';

export default function SupportPage() {
  const [tickets, setTickets] = useState([
    { id: 'T-1001', subject: 'Issue with payout', status: 'open' },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ subject: '', message: '' });

  const createTicket = () => {
    if (!form.subject || !form.message) return;
    setTickets([...tickets, { id: `T-${1000 + tickets.length + 1}`, subject: form.subject, status: 'open' }]);
    setShowModal(false);
    setForm({ subject: '', message: '' });
  };

  return (
    <div className="px-3 py-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold">Support</h1>
        <NeonButton variant="primary" className="text-xs px-3 py-1.5" onClick={() => setShowModal(true)}>
          <Plus size={14} className="mr-1" /> New
        </NeonButton>
      </div>

      <div className="space-y-2">
        {tickets.map((ticket) => (
          <GlassCard key={ticket.id} className="p-4">
            <p className="font-mono text-xs text-white/40">{ticket.id}</p>
            <p className="font-semibold">{ticket.subject}</p>
            <p className="text-xs text-green-400">{ticket.status}</p>
          </GlassCard>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-protocol-deep border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">New Ticket</h3>
              <button onClick={() => setShowModal(false)} className="p-2 bg-white/10 rounded-lg">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Subject"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm"
              />
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Message"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm h-24"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <NeonButton variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Cancel</NeonButton>
              <NeonButton className="flex-1" onClick={createTicket}>Submit</NeonButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
