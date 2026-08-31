
import { Link } from 'react-router-dom';
import Logo from '@/components/ui/Logo';
import NeonButton from '@/components/ui/NeonButton';
import { Menu, X, ChevronDown, Bot } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const flags: Record<string, string> = {
  en: '🇬🇧',
  ru: '🇷🇺',
};

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
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

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-protocol-deep/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="font-bold tracking-wide">TON Pay Router</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                {item.label}
              </a>
            ))}
            
            <a
              href="/docs"
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              API
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <span>{flags[lang]}</span>
                <span className="text-xs font-bold">{lang.toUpperCase()}</span>
                <ChevronDown size={14} className={langOpen ? 'rotate-180' : ''} />
              </button>

              {langOpen && (
                <div className="absolute top-full right-0 mt-2 bg-protocol-deep border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                  {['en', 'ru'].map((code) => (
                    <button
                      key={code}
                      onClick={() => {
                        setLang(code);
                        setLangOpen(false);
                      }}
                      className={`flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-white/10 transition-colors ${
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

            <a
              href="https://t.me/TONPayRouterBot"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center justify-center p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Bot size={20} className="text-[#0088cc]" />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-protocol-deep border border-white/10 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                Telegram Bot
              </span>
            </a>

            <Link to="/login">
              <NeonButton variant="ghost" className="text-sm">Sign In</NeonButton>
            </Link>
            <Link to="/register">
              <NeonButton variant="primary" className="text-sm">Get Started</NeonButton>
            </Link>
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-protocol-deep border-t border-white/5 p-4">
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="text-sm text-white/60 hover:text-white"
              >
                {item.label}
              </a>
            ))}
            
            <a
              href="/docs"
              onClick={() => setIsOpen(false)}
              className="text-sm text-white/60 hover:text-white"
            >
              API
            </a>

            <a
              href="https://t.me/TONPayRouterBot"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 text-sm text-[#0088cc]"
            >
              <Bot size={20} />
              Telegram Bot
            </a>

            <div className="flex items-center gap-2">
              {['en', 'ru'].map((code) => (
                <button
                  key={code}
                  onClick={() => setLang(code)}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    lang === code ? 'bg-protocol-violet text-white' : 'bg-white/10 text-white/60'
                  }`}
                >
                  {flags[code]} {code.toUpperCase()}
                </button>
              ))}
            </div>

            <Link to="/login" onClick={() => setIsOpen(false)}>
              <NeonButton variant="secondary" className="w-full text-sm">Sign In</NeonButton>
            </Link>
            <Link to="/register" onClick={() => setIsOpen(false)}>
              <NeonButton variant="primary" className="w-full text-sm">Get Started</NeonButton>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
