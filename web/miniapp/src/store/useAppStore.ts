
import { create } from 'zustand';
import i18n from '@/lib/i18n';

interface AppState {
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
  walletType: 'TON' | 'EVM' | null;
  walletAddress: string | null;
  setWallet: (type: 'TON' | 'EVM', address: string) => void;
  lang: 'en' | 'ru';
  setLang: (lang: 'en' | 'ru') => void;
}

export const useAppStore = create<AppState>((set) => ({
  isLoading: true,
  setIsLoading: (v) => set({ isLoading: v }),
  walletType: null,
  walletAddress: null,
  setWallet: (type, address) => set({ walletType: type, walletAddress: address }),
  lang: 'en',
  setLang: (lang) => {
    localStorage.setItem('lang', lang);
    i18n.changeLanguage(lang);
    set({ lang });
  },
}));
