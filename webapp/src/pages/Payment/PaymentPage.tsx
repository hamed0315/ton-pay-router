
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import NeonButton from '@/components/ui/NeonButton';
import GlassCard from '@/components/ui/GlassCard';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CurrencyNetworkSelector from '@/components/ui/CurrencyNetworkSelector';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Timer, Wallet, RefreshCw, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

const mockInvoice = { id: 'INV-123456', amount: 125.50, expiresIn: 600 };
const mockCurrencies = ['USDT', 'USDC', 'TON', 'BTC'];
const mockNetworks = ['TON', 'EVM', 'Base', 'Ethereum'];

export default function PaymentPage({ type = 'flexible' }: { type?: 'fixed' | 'flexible' }) {
  const { invoiceId } = useParams();
  
  // اگر نوع فاکتور fixed باشد، مستقیم به مرحله پرداخت می‌رویم
  const [step, setStep] = useState<'select' | 'payment'>(type === 'fixed' ? 'payment' : 'select');
  const [currency, setCurrency] = useState('USDT');
  const [network, setNetwork] = useState('TON');
  const [quote, setQuote] = useState<{ rate: string; receiveAmount: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [timeLeft, setTimeLeft] = useState(mockInvoice.expiresIn);
  const [paymentStatus, setPaymentStatus] = useState<'waiting' | 'processing' | 'success'>('waiting');
  const [showQR, setShowQR] = useState(true);

  useEffect(() => {
    if (step === 'payment') {
      const rate = currency === 'TON' ? '1.00' : '0.95';
      setQuote({ rate, receiveAmount: (mockInvoice.amount * parseFloat(rate)).toFixed(2) });
    }
  }, [step, currency, network]);

  useEffect(() => {
    if (step !== 'payment') return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => { if (prev <= 1) { clearInterval(timer); return 0; } return prev - 1; });
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

  const copyAddress = () => {
    navigator.clipboard.writeText('UQDP...abc123');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const connectWallet = () => {
    setWalletConnected(true);
    setPaymentStatus('processing');
    setTimeout(() => setPaymentStatus('success'), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none">
        <div className="w-full h-full bg-neon-grid" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 pt-24 pb-12">
          <div className="w-full max-w-md">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <GlassCard glow className="p-8">
                {/* مرحله انتخاب (فقط برای flexible) */}
                {step === 'select' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="text-center mb-8">
                      <p className="text-white/50 text-sm mb-2">Amount Due</p>
                      <p className="text-5xl font-bold bg-gradient-to-r from-protocol-violet to-protocol-ton bg-clip-text text-transparent">${mockInvoice.amount.toFixed(2)}</p>
                    </div>
                    <div className="mb-6">
                      <CurrencyNetworkSelector currencies={mockCurrencies} networks={mockNetworks} selectedCurrency={currency} selectedNetwork={network} onSelectCurrency={setCurrency} onSelectNetwork={setNetwork} />
                    </div>
                    <NeonButton variant="primary" className="w-full py-4" onClick={() => setStep('payment')}>Continue <ArrowRight size={18} className="ml-2" /></NeonButton>
                  </motion.div>
                )}

                {/* مرحله پرداخت (برای هر دو سناریو) */}
                {step === 'payment' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="text-center mb-6">
                      <p className="text-white/50 text-sm mb-2">You Pay</p>
                      <p className="text-3xl font-bold">{mockInvoice.amount} {currency}</p>
                      <p className="text-white/30 text-xs mt-1">on {network} network</p>
                      {quote && <p className="text-white/40 text-xs mt-2">1 {currency} = {quote.rate} USD</p>}
                    </div>
                    <AnimatePresence mode="wait">
                      {paymentStatus === 'waiting' && (
                        <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          {showQR ? (
                            <div className="flex flex-col items-center mb-6">
                              <div className="bg-white p-4 rounded-2xl mb-4"><QRCodeSVG value="UQDP...abc123" size={180} bgColor="#ffffff" fgColor="#0B0B14" level="H" /></div>
                              <p className="text-white/50 text-xs mb-3">Scan with your wallet</p>
                              <div className="flex items-center gap-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-4">
                                <span className="font-mono text-sm text-white/80 flex-1 truncate">UQDP...abc123</span>
                                <button onClick={copyAddress} className="p-2 hover:bg-white/10 rounded-lg transition-colors">{copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} className="text-white/40" />}</button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center mb-6">
                              <p className="text-white/50 text-sm mb-4">Send payment to:</p>
                              <p className="font-mono text-sm text-white bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-4 break-all">UQDP...abc123</p>
                            </div>
                          )}
                          <div className="flex items-center justify-center gap-2 mb-8"><Timer size={16} className="text-yellow-400" /><span className="text-sm text-yellow-400 font-mono">Expires in {formatTime(timeLeft)}</span></div>
                          <NeonButton variant="primary" className="w-full py-4" onClick={connectWallet}><Wallet size={18} className="mr-2" />Connect Wallet to Pay</NeonButton>
                          <div className="flex items-center justify-center gap-4 mt-4"><button onClick={() => setShowQR(!showQR)} className="text-xs text-white/40 hover:text-white/60 transition-colors">{showQR ? 'Show Address' : 'Show QR'}</button></div>
                        </motion.div>
                      )}
                      {paymentStatus === 'processing' && (
                        <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
                          <div className="flex justify-center mb-6"><div className="w-16 h-16 border-4 border-protocol-violet border-t-transparent rounded-full animate-spin" /></div>
                          <h3 className="text-lg font-semibold mb-2">Processing Payment...</h3><p className="text-white/50 text-sm">Waiting for confirmation</p>
                        </motion.div>
                      )}
                      {paymentStatus === 'success' && (
                        <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                          <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-6"><Check size={40} className="text-green-400" /></div>
                          <h3 className="text-xl font-bold text-green-400 mb-2">Payment Successful!</h3><p className="text-white/50 text-sm mb-6">{mockInvoice.amount} {currency} received</p>
                          <NeonButton variant="secondary" className="w-full">View Receipt</NeonButton>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </GlassCard>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex items-center justify-center gap-6 mt-8 text-white/30 text-xs">
              <div className="flex items-center gap-1.5"><ShieldCheck size={14} /><span>Non-Custodial</span></div>
              <div className="flex items-center gap-1.5"><Zap size={14} /><span>Instant</span></div>
              <div className="flex items-center gap-1.5"><RefreshCw size={14} /><span>Multi-Chain</span></div>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
