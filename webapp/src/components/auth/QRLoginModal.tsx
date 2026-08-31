
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { X, RefreshCw } from 'lucide-react';
import { initQR, getQRStatus } from '@/services/auth';
import { useNavigate } from 'react-router-dom';

export default function QRLoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [qrToken, setQrToken] = useState('');
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'expired'>('pending');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) startFlow();
  }, [isOpen]);

  const startFlow = async () => {
    setStatus('pending');
    setError('');
    try {
      const data = await initQR();
      setQrToken(data.qr_token);

      const interval = setInterval(async () => {
        const result = await getQRStatus(data.qr_token);
        if (result.status === 'confirmed') {
          clearInterval(interval);
          setStatus('confirmed');
          localStorage.setItem('token', result.jwt);
          setTimeout(() => {
            onClose();
            navigate('/dashboard');
          }, 1500);
        } else if (result.status === 'expired') {
          clearInterval(interval);
          setStatus('expired');
        }
      }, 2000);

      return () => clearInterval(interval);
    } catch {
      setError('Failed to start QR flow');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-protocol-deep border border-white/10 rounded-3xl p-8 w-full max-w-sm text-center relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/10 rounded-full">
              <X size={16} />
            </button>

            <h3 className="text-lg font-bold mb-2">Connect with QR</h3>
            <p className="text-sm text-white/60 mb-6">Scan this with your TON Pay Router Mini App</p>

            {status === 'pending' && (
              <>
                <div className="bg-white p-4 rounded-2xl mx-auto w-fit mb-4">
                  {qrToken && <QRCodeSVG value={qrToken} size={200} bgColor="#ffffff" fgColor="#0B0B14" level="H" />}
                </div>
                <p className="text-xs text-white/40">Waiting for scan...</p>
                <button onClick={startFlow} className="mt-4 text-xs text-protocol-ton flex items-center justify-center gap-1 mx-auto">
                  <RefreshCw size={12} /> Refresh QR
                </button>
              </>
            )}

            {status === 'confirmed' && (
              <div className="py-10">
                <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">✅</span>
                </div>
                <h4 className="font-bold text-green-400">Connected!</h4>
              </div>
            )}

            {status === 'expired' && (
              <div className="py-10">
                <p className="text-red-400 mb-4">QR expired</p>
                <button onClick={startFlow} className="text-protocol-ton text-sm underline">Try again</button>
              </div>
            )}

            {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
