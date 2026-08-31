
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import GlassCard from '@/components/ui/GlassCard';
import PaymentQRCode from '@/components/ui/PaymentQRCode';
import PaymentTimer from '@/components/ui/PaymentTimer';
import WalletConnector from '@/components/domain/WalletConnector';
import { Copy } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { publicApi } from '@/services/api';
import { connectPaymentSocket } from '@/services/ws';

export default function PaymentPage() {
  const { t } = useTranslation();
  const { walletAddress } = useAppStore();
  const [invoiceId, setInvoiceId] = useState('');
  const [invoice, setInvoice] = useState<any>(null);
  const [quote, setQuote] = useState<any>(null);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState('');
  const [amount, setAmount] = useState('');

  const loadInvoice = async () => {
    if (!invoiceId.trim()) return;
    try {
      const inv = await publicApi.getInvoice(invoiceId.trim());
      setInvoice(inv);
      setStep(1);
      // Connect WebSocket for live status
      const close = connectPaymentSocket(invoiceId.trim(), (newStatus) => {
        setStatus(newStatus);
        if (newStatus === 'settled') setStep(3);
      });
      return close;
    } catch (e) {
      alert('Invoice not found');
    }
  };

  const fetchQuote = async () => {
    if (!invoice) return;
    try {
      const q = await publicApi.getQuote(invoice.id);
      setQuote(q);
      setStep(2);
    } catch (e) {
      alert('Failed to get quote');
    }
  };

  const copyAddress = () => {
    const address = invoice?.dest_address || invoice?.merchant_settlement_address || '';
    navigator.clipboard.writeText(address);
    alert('Address copied!');
  };

  return (
    <div className="px-3 py-4">
      {step === 0 && (
        <GlassCard glow className="p-6">
          <h2 className="text-lg font-bold mb-4">Enter Invoice ID</h2>
          <input
            type="text"
            value={invoiceId}
            onChange={(e) => setInvoiceId(e.target.value)}
            placeholder="INV-123456"
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-sm mb-4"
          />
          <button onClick={loadInvoice} className="w-full bg-gradient-to-r from-protocol-violet to-protocol-ton py-3 rounded-xl font-semibold text-white">
            Load Invoice
          </button>
        </GlassCard>
      )}

      {step >= 1 && invoice && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GlassCard glow className="p-6">
            <h2 className="text-lg font-bold mb-4">Invoice {invoice.id}</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-white/50">Amount</span>
                <span className="font-mono font-bold">{invoice.amount} {invoice.source_currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Destination</span>
                <span>{invoice.dest_currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Status</span>
                <span>{status || invoice.status}</span>
              </div>

              {!quote && status !== 'settled' && (
                <button onClick={fetchQuote} className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-xl font-semibold">
                  Get Quote
                </button>
              )}

              {quote && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-sm">Rate: {quote.rate}</p>
                  <p className="text-sm">Dest Amount: {quote.dest_amount} {invoice.dest_currency}</p>
                  <p className="text-sm text-white/50">Provider: {quote.provider}</p>
                </div>
              )}

              {step >= 2 && status !== 'settled' && (
                <>
                  <PaymentTimer initialSeconds={600} />
                  <div className="border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white/50 text-xs">Recipient Address</span>
                      <button onClick={copyAddress} className="text-protocol-ton text-xs flex items-center gap-1">
                        <Copy size={12} />
                        Copy
                      </button>
                    </div>
                    <p className="font-mono text-xs text-white/80 mt-2 break-all">
                      {invoice.dest_address || invoice.merchant_settlement_address}
                    </p>
                  </div>
                  <WalletConnector network={invoice.source_currency.includes('TON') ? 'TON' : 'EVM'} />
                </>
              )}

              {status === 'settled' && (
                <div className="text-center py-6">
                  <p className="text-green-400 text-xl font-bold">Payment Successful! 🎉</p>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}
