
import Logo from '@/components/ui/Logo';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-protocol-deep border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Logo size="sm" />
              <span className="font-bold">TON Pay Router</span>
            </div>
            <p className="text-sm text-white/50 max-w-md">
              Multi-chain payment gateway for Telegram Mini Apps and Web. Secure, non-custodial, and fast.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-white/50">
              <li><a href="#features" className="hover:text-white">Features</a></li>
              <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
              <li><a href="#how-it-works" className="hover:text-white">How it works</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-white/50">
              <li><a href="#" className="hover:text-white">About</a></li>
              <li><a href="#" className="hover:text-white">Blog</a></li>
              <li><a href="#" className="hover:text-white">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 text-center text-sm text-white/30">
          © 2026 TON Pay Router. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
