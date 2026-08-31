
import { useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: 'How to create a gateway?', a: 'Go to Gateways tab and click "Create Gateway".' },
  { q: 'How to get paid?', a: 'Share your payment link with customers.' },
  { q: 'Is there any KYC?', a: 'No, we are non-custodial and KYC-free.' },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="px-3 py-4">
      <h1 className="text-lg font-bold mb-4">FAQ</h1>
      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <GlassCard key={i} className="p-4">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="font-medium">{faq.q}</span>
              <ChevronDown size={16} className={openIndex === i ? 'rotate-180' : ''} />
            </button>
            {openIndex === i && (
              <p className="text-sm text-white/60 mt-2">{faq.a}</p>
            )}
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
