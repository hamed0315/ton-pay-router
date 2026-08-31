
import { useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { Menu, Globe } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface HeaderProps {
  setIsMenuOpen: (v: boolean) => void;
}

export default function Header({ setIsMenuOpen }: HeaderProps) {
  const controls = useAnimationControls();
  const [hoverCount, setHoverCount] = useState(0);
  const { lang, setLang } = useAppStore();

  const handleLogoHover = () => {
    const newCount = hoverCount + 1;
    setHoverCount(newCount);
    if (newCount % 2 === 1) {
      controls.start({ rotate: 360, transition: { duration: 0.6, ease: 'linear' } });
    } else {
      controls.set({ rotate: 0 });
      controls.start({ rotateX: [0, 180, 360], transition: { duration: 0.8, ease: 'easeInOut' } });
    }
  };

  const toggleLanguage = () => {
    setLang(lang === 'en' ? 'ru' : 'en');
  };

  return (
    <header className="flex items-center justify-between px-3 py-2 safe-top bg-protocol-deep/80 backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
      <div className="flex items-center gap-3">
        <motion.div
          onMouseEnter={handleLogoHover}
          onTouchStart={handleLogoHover}
          animate={controls}
          initial={{ rotate: 0, rotateX: 0 }}
          style={{ transformPerspective: 600, cursor: 'pointer' }}
          className="shrink-0"
        >
          <svg width="36" height="36" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision">
            <defs>
              <linearGradient id="headerLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#A855F7"/>
                <stop offset="100%" stop-color="#0098EA"/>
              </linearGradient>
            </defs>
            <polygon points="50,10 90,35 50,60 10,35" fill="rgba(168,85,247,0.5)" stroke="none"/>
            <polygon points="50,60 90,35 50,90 10,35" fill="rgba(0,152,234,0.5)" stroke="none"/>
            <polygon points="10,35 50,10 50,60 10,35" fill="rgba(168,85,247,0.5)" stroke="none"/>
            <polygon points="90,35 50,10 50,60 90,35" fill="rgba(0,152,234,0.5)" stroke="none"/>
            <polygon points="50,90 10,20 90,20" fill="url(#headerLogoGrad)" stroke="none"/>
          </svg>
        </motion.div>
        <span className="font-brand text-xl font-bold tracking-tight">
          <span className="text-[#A855F7]">Omnix</span>
          <span className="text-white">Pay</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleLanguage}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-1"
        >
          <Globe size={18} className="text-white/70" />
          <span className="text-xs text-white/70 uppercase">{lang}</span>
        </button>
        <button
          onClick={() => setIsMenuOpen(true)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <Menu size={22} className="text-white/70" />
        </button>
      </div>
    </header>
  );
}
