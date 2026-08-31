
import GlassCard from '@/components/ui/GlassCard';
import NeonButton from '@/components/ui/NeonButton';
import { useState } from 'react';

export default function SettingsPage() {
  const [name, setName] = useState('John Doe');

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Settings</h1>

      <GlassCard className="p-6 max-w-xl">
        <h2 className="text-lg font-semibold mb-4">Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none"
            />
          </div>
          <NeonButton variant="primary">Save Changes</NeonButton>
        </div>
      </GlassCard>
    </div>
  );
}
