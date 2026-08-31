
import { Outlet, NavLink, Link } from 'react-router-dom';
import Logo from '@/components/ui/Logo';
import { LayoutDashboard, Server, FileText, Wallet, LifeBuoy, LogOut, Menu, X, ChevronDown, Bot, User, HelpCircle, Code2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/dashboard/gateways', label: 'Gateways', icon: Server },
  { path: '/dashboard/invoices', label: 'Invoices', icon: FileText },
  { path: '/dashboard/settlement', label: 'Settlement', icon: Wallet },
  { path: '/dashboard/support', label: 'Support', icon: LifeBuoy },
];

const flags: Record<string, string> = { en: '🇬🇧', ru: '🇷🇺' };

export default function DashboardLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lang, setLang] = useState('en');
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-protocol-deep relative overflow-hidden">
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none">
        <div className="w-full h-full bg-neon-grid" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* هدر اصلی - فقط منوی اصلی */}
        <header className="sticky top-0 z-50 flex items-center justify-between px-4 md:px-8 py-3 border-b border-white/5 bg-protocol-deep/80 backdrop-blur-md">
          
          {/* لوگو */}
          <Link to="/" className="flex items-center gap-2.5">
            <Logo size="sm" />
            <span className="font-bold tracking-wide hidden sm:block">TON Pay Router</span>
          </Link>

          {/* منوی اصلی دسکتاپ */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-protocol-violet text-white shadow-[0_0_15px_rgba(124,58,237,0.3)]'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* بخش راست - فقط زبان، ربات و همبرگری */}
          <div className="flex items-center gap-2">
            
            {/* انتخاب زبان */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-2 py-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <span>{flags[lang]}</span>
                <span className="hidden md:block text-xs font-bold">{lang.toUpperCase()}</span>
                <ChevronDown size={14} className={langOpen ? 'rotate-180' : ''} />
              </button>

              {langOpen && (
                <div className="absolute top-full right-0 mt-2 bg-protocol-deep border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                  {['en', 'ru'].map((code) => (
                    <button
                      key={code}
                      onClick={() => { setLang(code); setLangOpen(false); }}
                      className={`flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-white/10 transition-colors ${
                        lang === code ? 'text-protocol-ton' : ''
                      }`}
                    >
                      <span>{flags[code]}</span>
                      <span className="font-medium">{code.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* آیکون ربات تلگرام */}
            <a
              href="https://t.me/TONPayRouterBot"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative p-2 rounded-lg hover:bg-white/10 transition-colors"
              title="Telegram Bot"
            >
              <Bot size={20} className="text-[#0088cc]" />
            </a>

            {/* دکمه همبرگری - همه موارد اضافی اینجا هستند */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </header>

        {/* محتوای اصلی */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </main>

        {/* منوی کشویی (همبرگری) - شامل خروج، FAQ و API */}
        {isMenuOpen && (
          <div className="fixed top-0 right-0 h-full w-72 bg-protocol-deep border-l border-white/10 z-50 p-6 flex flex-col shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <span className="font-bold">Menu</span>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-white/10 rounded-lg">
                <X size={16} />
              </button>
            </div>

            <nav className="flex flex-col gap-2 flex-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/dashboard'}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive ? 'bg-protocol-violet text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="mt-auto space-y-2 border-t border-white/10 pt-4">
              {/* سوالات متداول */}
              <a
                href="/dashboard/faq"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white"
              >
                <HelpCircle size={18} />
                FAQ
              </a>

              {/* API Docs */}
              <a
                href="/docs"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white"
              >
                <Code2 size={18} />
                API Docs
              </a>

              {/* پروفایل */}
              <button onClick={() => alert('Profile')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:bg-white/5">
                <User size={18} />
                Profile
              </button>

              {/* خروج */}
              <button onClick={() => alert('Logout')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10">
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        )}

        {/* پس‌زمینه تیره */}
        {isMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
