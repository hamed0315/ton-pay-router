
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from 'react-i18next';

export default function LoadingScreen() {
  const setIsLoading = useAppStore((state) => state.setIsLoading);
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [typedText, setTypedText] = useState('');

  const statuses = t('loading.statuses', { returnObjects: true }) as string[];
  const title = 'OmnixPay';

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setIsLoading(false), 400);
          return 100;
        }
        return prev + Math.random() * 8 + 2;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [setIsLoading]);

  useEffect(() => {
    const interval = setInterval(() => setStatusIndex((i) => (i + 1) % statuses.length), 800);
    return () => clearInterval(interval);
  }, [statuses.length]);

  useEffect(() => {
    let i = 0;
    const typeTimer = setInterval(() => {
      setTypedText(title.slice(0, i));
      i++;
      if (i > title.length) clearInterval(typeTimer);
    }, 30);
    return () => clearInterval(typeTimer);
  }, [title]);

  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center overflow-hidden bg-[#0B0B14]">
      <div className="relative z-10 flex items-center justify-center w-40 h-40 mb-8">
        {!shouldReduceMotion && (
          <>
            {/* چهار ضلع لوزی */}
            <motion.div className="absolute w-full h-full" initial={{ y: -60 }} animate={{ y: 0 }} transition={{ duration: 1.5, delay: 0.5, ease: 'easeInOut' }}>
              <svg viewBox="0 0 100 100" className="w-full h-full"><polygon points="50,10 90,35 50,60 10,35" fill="rgba(168,85,247,0.5)" /></svg>
            </motion.div>
            <motion.div className="absolute w-full h-full" initial={{ y: 60 }} animate={{ y: 0 }} transition={{ duration: 1.5, delay: 0.6, ease: 'easeInOut' }}>
              <svg viewBox="0 0 100 100" className="w-full h-full"><polygon points="50,60 90,35 50,90 10,35" fill="rgba(0,152,234,0.5)" /></svg>
            </motion.div>
            <motion.div className="absolute w-full h-full" initial={{ x: -60 }} animate={{ x: 0 }} transition={{ duration: 1.5, delay: 0.7, ease: 'easeInOut' }}>
              <svg viewBox="0 0 100 100" className="w-full h-full"><polygon points="10,35 50,10 50,60 10,35" fill="rgba(168,85,247,0.5)" /></svg>
            </motion.div>
            <motion.div className="absolute w-full h-full" initial={{ x: 60 }} animate={{ x: 0 }} transition={{ duration: 1.5, delay: 0.8, ease: 'easeInOut' }}>
              <svg viewBox="0 0 100 100" className="w-full h-full"><polygon points="90,35 50,10 50,60 90,35" fill="rgba(0,152,234,0.5)" /></svg>
            </motion.div>

            {/* مثلث اصلی بدون خط سفید */}
            <motion.div className="absolute inset-0" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 1.5 }}>
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  <linearGradient id="mainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#A855F7" />
                    <stop offset="100%" stopColor="#0098EA" />
                  </linearGradient>
                </defs>
                <polygon points="50,90 10,20 90,20" fill="url(#mainGrad)" />
              </svg>
            </motion.div>
          </>
        )}
      </div>

      <div className="z-20 text-center">
        <motion.h1 className="text-xl font-mono font-bold neon-text tracking-widest mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>{typedText}</motion.h1>
        <AnimatePresence mode="wait">
          <motion.p key={statusIndex} className="text-sm text-white/60 font-mono mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>{statuses[statusIndex]}</motion.p>
        </AnimatePresence>
        <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-protocol-violet to-protocol-ton" style={{ width: `${progress}%` }} transition={{ duration: 0.15 }} />
        </div>
        <p className="mt-2 font-mono text-xs text-white/40">{Math.floor(progress)}%</p>
      </div>

      <AnimatePresence>
        {progress >= 100 && (
          <motion.div className="absolute inset-0 flex items-center justify-center bg-protocol-deep" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <motion.div className="w-2 h-2 rounded-full bg-protocol-violet" animate={{ scale: 100, opacity: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
