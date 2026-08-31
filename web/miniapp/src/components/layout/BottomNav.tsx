
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { LayoutDashboard, Server, FileText, Wallet } from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dash', icon: LayoutDashboard },
  { path: '/gateways', label: 'Gateways', icon: Server },
  { path: '/invoices', label: 'Invoices', icon: FileText },
  { path: '/settlement', label: 'Settle', icon: Wallet },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] z-50 bg-protocol-deep/90 backdrop-blur-md border-t border-white/10 safe-bottom">
      <div className="flex justify-around py-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all',
                isActive ? 'text-protocol-ton' : 'text-white/40'
              )
            }
          >
            {({ isActive }) => (
              <>
                <motion.div
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  className="relative"
                >
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} className={isActive ? 'drop-shadow-[0_0_8px_rgba(0,152,234,0.6)]' : ''} />
                  {isActive && (
                    <motion.div className="absolute -inset-1 bg-protocol-ton/20 rounded-full -z-10" layoutId="navGlow" />
                  )}
                </motion.div>
                <span className="text-[9px] font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
