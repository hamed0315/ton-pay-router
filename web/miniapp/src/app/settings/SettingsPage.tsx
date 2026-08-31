
import { useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import NeonButton from '@/components/ui/NeonButton';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/useAppStore';
import { Wallet, KeyRound, Webhook, Globe, Save } from 'lucide-react';

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('jwt_token');
  const tg = (window as any).Telegram?.WebApp;
  const initData = tg?.initData || '';
  return {
    Authorization: token ? `Bearer ${token}` : '',
    'X-Telegram-InitData': initData,
  };
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const { lang, setLang } = useAppStore();
  const [settlementAddress, setSettlementAddress] = useState('UQ...');
  const [settlementCurrency, setSettlementCurrency] = useState('TON');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [apiKey, setApiKey] = useState('sk_test_...');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/v2/settings/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({
          settlement_address: settlementAddress,
          settlement_currency: settlementCurrency,
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const saveWebhook = async () => {
    try {
      const res = await fetch('http://localhost:8080/v2/settings/webhook', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({ webhook_url: webhookUrl }),
      });
      if (!res.ok) throw new Error('Save failed');
      alert('Webhook saved');
    } catch (e) {
      alert('Failed to save webhook');
    }
  };

  return (
    <div className="px-3 py-4">
      <h1 className="text-lg font-bold mb-4">{t('settings.title')}</h1>

      <GlassCard className="p-4 mb-4">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2"><Globe size={14} className="text-protocol-violet" />Language</h3>
        <div className="flex gap-2">
          <button onClick={() => setLang('en')} className={`flex-1 py-2 rounded-lg text-sm font-medium ${lang === 'en' ? 'bg-protocol-violet text-white' : 'bg-white/10 text-white/60'}`}>English</button>
          <button onClick={() => setLang('ru')} className={`flex-1 py-2 rounded-lg text-sm font-medium ${lang === 'ru' ? 'bg-protocol-violet text-white' : 'bg-white/10 text-white/60'}`}>Русский</button>
        </div>
      </GlassCard>

      <GlassCard className="p-4 mb-4">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2"><Wallet size={14} className="text-protocol-violet" />{t('settings.settlementAddress')}</h3>
        <input className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-xs font-mono mb-2" value={settlementAddress} onChange={(e) => setSettlementAddress(e.target.value)} />
        <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-xs mb-3" value={settlementCurrency} onChange={(e) => setSettlementCurrency(e.target.value)}>
          <option value="TON">TON</option>
          <option value="USDT_TON">USDT_TON</option>
          <option value="USDC_BASE">USDC_BASE</option>
        </select>
        <NeonButton variant="secondary" className="text-xs" onClick={saveProfile} disabled={loading}>
          <Save size={12} className="mr-1" />{saved ? 'Saved!' : t('settings.save')}
        </NeonButton>
      </GlassCard>

      <GlassCard className="p-4 mb-4">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2"><KeyRound size={14} className="text-protocol-violet" />{t('settings.apiKey')}</h3>
        <input type="text" className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-xs font-mono" value={apiKey} onChange={(e) => setApiKey(e.target.value)} readOnly />
      </GlassCard>

      <GlassCard className="p-4">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2"><Webhook size={14} className="text-protocol-violet" />{t('settings.webhookUrl')}</h3>
        <input className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-xs font-mono mb-3" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} />
        <NeonButton variant="secondary" className="text-xs" onClick={saveWebhook}>{t('settings.save')}</NeonButton>
      </GlassCard>
    </div>
  );
}
