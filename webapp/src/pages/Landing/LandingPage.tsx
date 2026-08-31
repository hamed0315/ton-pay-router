
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Logo from '@/components/ui/Logo';
import NeonButton from '@/components/ui/NeonButton';
import GlassCard from '@/components/ui/GlassCard';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Zap, Shield, Globe, ArrowRight, LayoutDashboard, TrendingUp, Server, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* هیرو */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-neon-grid" />
        </div>

        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center mb-8"
          >
            <Logo size="xl" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-protocol-violet to-protocol-ton bg-clip-text text-transparent">
              Multi-Chain
            </span>
            <br />
            Payment Gateway
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-white/60 max-w-2xl mx-auto mb-10"
          >
            Accept payments from any blockchain. Non-custodial, secure, and built for Telegram Mini Apps and Web.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/dashboard">
              <NeonButton variant="primary" className="text-lg px-8 py-4">
                <LayoutDashboard size={20} className="mr-2" />
                Enter Dashboard
              </NeonButton>
            </Link>
            <Link to="/login">
              <NeonButton variant="secondary" className="text-lg px-8 py-4">
                Sign In
              </NeonButton>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* آمارهای عددی - پس‌زمینه خاکستری حذف شد تا با بقیه هماهنگ شود */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: 'Active Gateways', value: '15+', icon: Server, desc: 'Merchants using our gateway' },
              { label: 'Total Transaction Volume', value: '$2.4M', icon: TrendingUp, desc: 'Processed across all networks' },
              { label: 'Successful Transactions', value: '98.7%', icon: CheckCircle, desc: 'Completion rate on payments' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <GlassCard glow className="p-8 text-center">
                  <stat.icon size={32} className="text-protocol-ton mx-auto mb-4" />
                  <p className="text-4xl font-bold bg-gradient-to-r from-protocol-violet to-protocol-ton bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-white/60 mt-2">{stat.label}</p>
                  <p className="text-white/40 text-sm mt-1">{stat.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ویژگی‌ها */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need to get paid
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: 'Instant Settlements', desc: 'Receive funds in seconds across multiple blockchains.' },
              { icon: Shield, title: 'Non-Custodial', desc: 'We never hold your funds. Full control stays with you.' },
              { icon: Globe, title: 'Multi-Chain', desc: 'Support TON, Ethereum, Base, and more networks.' },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <GlassCard glow className="p-8 h-full">
                  <feature.icon size={32} className="text-protocol-ton mb-4" />
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-white/50">{feature.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA نهایی */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to get started?
          </h2>
          <p className="text-white/60 mb-8">
            Join thousands of businesses accepting crypto payments.
          </p>
          <Link to="/dashboard">
            <NeonButton variant="primary" className="text-lg px-10 py-4">
              Enter Dashboard
            </NeonButton>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
