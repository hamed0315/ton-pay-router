
import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './Header';
import BottomNav from './BottomNav';
import { X, LayoutDashboard, Server, FileText, Wallet, Settings, LifeBuoy, HelpCircle, Code2 } from 'lucide-react';

export default function AppLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Gateways', path: '/gateways', icon: Server },
    { label: 'Invoices', path: '/invoices', icon: FileText },
    { label: 'Settlement', path: '/settlement', icon: Wallet },
    { label: 'Settings', path: '/settings', icon: Settings },
    { label: 'Support', path: '/support', icon: LifeBuoy },
    { label: 'FAQ', path: '/faq', icon: HelpCircle },
    { label: 'API Docs', path: 'https://docs.omnixpay.co', icon: Code2 },
  ];

  const handleNavigate = (path: string) => {
    setIsMenuOpen(false);
    if (path.startsWith('http')) {
      window.open(path, '_blank');
    } else {
      navigate(path);
    }
  };

  return (
    <div className="relative max-w-lg mx-auto w-full min-h-screen flex flex-col">
      <Header setIsMenuOpen={setIsMenuOpen} />
      <main className="flex-1 z-10 p-4 pb-24">
        <Outlet />
      </main>
      <BottomNav />

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              className="absolute inset-0 bg-black/60 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              transition={{ duration: 0.2 }}
            />
            <motion.aside
              className="absolute right-0 top-0 bottom-0 w-[80%] max-w-[300px] bg-[#111118] border-l border-white/10 z-50 p-5"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="flex items-center justify-between mb-8">
                <span className="font-brand text-lg font-bold">
                  <span className="text-[#A855F7]">Omnix</span>
                  <span className="text-white">Pay</span>
                </span>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-lg hover:bg-white/10">
                  <X size={20} />
                </button>
              </div>

              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      onClick={() => handleNavigate(item.path)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      <Icon size={18} className="text-protocol-violet" />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
