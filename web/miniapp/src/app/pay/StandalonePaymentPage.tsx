
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import NeonButton from '@/components/ui/NeonButton';
import StatusPill from '@/components/ui/StatusPill';
import WalletConnector from '@/components/domain/WalletConnector';
import PaymentStepper from '@/components/domain/PaymentStepper';
import TelegramApp from '@twa-dev/sdk';
import { useAppStore } from '@/store/useAppStore';
import { publicApi } from '@/services/api';
import { connectPaymentSocket } from '@/services/ws';

export default function StandalonePaymentPage() {
  const { walletAddress } = useAppStore();
  const [invoiceId, setInvoiceId] = useState('');
  const [step, setStep] = useState(0);
  const [quote, setQuote] = useState<any>(null);
  const [status, setStatus] = useState('pending');
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const startParam = TelegramApp.initDataUnsafe?.start_param;
    if (startParam) {
      setInvoiceId(startParam);
      setLoading(true);
      publicApi.getInvoice(startParam)
        .then((inv) => {
          setInvoice(inv);
          setStatus(inv.status || 'pending');
          // Connect WebSocket for live updates
          const close = connectPaymentSocket(startParam, (newStatus) => {
            setStatus(newStatus);
            if (newStatus === 'settled') setStep(4);
          });
          // Close WebSocket when component unmounts
          return () => close();
        })
        .catch((err) => {
          setError('Invoice not found');
        })
        .finally(() => setLoading(false));
    }
  }, []);

  const handleFetchQuote = async () => {
    if (!invoice) return;
    setLoading(true);
    try {
      const q = await publicApi.getQuote(invoice.id);
      setQuote(q);
      setStep(2);
    } catch (e) {
      setError('Failed to get quote');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!invoice) return;
    setStep(3);
    try {
      const res = await fetch('http://localhost:8080/api/pay/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_id: invoice.id,
          tx_hash: '0xmocktxhash_' + Date.now(),
        }),
      });
      if (!res.ok) throw new Error('Confirm failed');
      // Status will be updated via WebSocket
    } catch (e) {
      setError('Payment confirmation failed');
      setStep(2);
    }
  };

  const closeApp = () => {
    TelegramApp.close();
  };

  return (
    <div className="min-h-screen bg-protocol-deep relative flex flex-col items-center justify-center px-4 py-6">
      <button onClick={closeApp} className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white/60 text-xs">✕</button>

      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-protocol-violet to-protocol-ton flex items-center justify-center mb-6">
        <span className="text-white font-bold">⚡</span>
      </div>

      {loading && (
        <div className="text-center py-10 text-white/50">Loading...</div>
      )}

      {error && (
        <div className="text-red-400 text-sm mb-4">{error}</div>
      )}

      {!loading && invoice && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-sm">
          <h1 className="text-xl font-bold text-center mb-4">Payment</h1>
          <GlassCard className="p-4 mb-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-white/50">Invoice ID</span>
                <span className="font-mono text-xs">{invoice.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Amount</span>
                <span className="font-bold">{invoice.amount} {invoice.source_currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Destination</span>
                <span>{invoice.dest_currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Status</span>
                <StatusPill status={status as any} />
              </div>
            </div>
          </GlassCard>

          {step === 0 && (
            <NeonButton className="w-full" onClick={() => setStep(1)}>
              Continue
            </NeonButton>
          )}

          {step === 1 && (
            <GlassCard className="p-4">
              <h2 className="text-lg font-bold text-center mb-4">Connect Wallet</h2>
              <WalletConnector />
              <div className="flex gap-2 mt-3">
                <NeonButton variant="secondary" className="flex-1" onClick={() => setStep(0)}>Back</NeonButton>
                <NeonButton className="flex-1" disabled={!walletAddress} onClick={handleFetchQuote}>Continue</NeonButton>
              </div>
            </GlassCard>
          )}

          {step === 2 && (
            <GlassCard className="p-4">
              <h2 className="text-lg font-bold text-center mb-4">Quote</h2>
              {quote ? (
                <div className="space-y-2">
                  <p>Rate: {quote.rate}</p>
                  <p>Dest Amount: {quote.dest_amount} {invoice.dest_currency}</p>
                  <p>Provider: {quote.provider}</p>
                </div>
              ) : (
                <p className="text-center text-white/50">Loading quote...</p>
              )}
              <div className="flex gap-2 mt-3">
                <NeonButton variant="secondary" className="flex-1" onClick={() => setStep(1)}>Back</NeonButton>
                <NeonButton className="flex-1" disabled={!quote} onClick={handleConfirm}>Confirm Payment</NeonButton>
              </div>
            </GlassCard>
          )}

          {step === 3 && (
            <GlassCard className="p-4 text-center">
              <div className="w-12 h-12 mx-auto rounded-full border-3 border-protocol-violet border-t-transparent animate-spin mb-3" />
              <p className="text-white/60 text-sm">Processing...</p>
              <div className="mt-3"><StatusPill status={status as any} /></div>
            </GlassCard>
          )}

          {step === 4 && (
            <GlassCard glow className="p-6 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-3">
                <span className="text-2xl">✅</span>
              </div>
              <h2 className="text-xl font-bold text-green-400">Payment Successful!</h2>
              <NeonButton className="mt-4" onClick={closeApp}>Close</NeonButton>
            </GlassCard>
          )}
        </motion.div>
      )}

      {step > 0 && step < 4 && (
        <div className="mt-6 w-full max-w-sm">
          <PaymentStepper currentStep={step} />
        </div>
      )}
    </div>
  );
}
