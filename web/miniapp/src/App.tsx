
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import LoadingScreen from './app/loading/LoadingScreen';
import AppLayout from './components/layout/AppLayout';
import PaymentPage from './app/pay/PaymentPage';
import DashboardPage from './app/dashboard/DashboardPage';
import InvoicesPage from './app/invoices/InvoicesPage';
import GatewaysPage from './app/gateways/GatewaysPage';
import SettlementPage from './app/settlement/SettlementPage';
import FAQPage from './app/faq/FAQPage';
import SupportPage from './app/support/SupportPage';
import { useAppStore } from './store/useAppStore';

const queryClient = new QueryClient();

function App() {
  const isLoading = useAppStore((state) => state.isLoading);

  return (
    <TonConnectUIProvider manifestUrl="https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {isLoading ? (
            <LoadingScreen />
          ) : (
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/gateways" element={<GatewaysPage />} />
                <Route path="/invoices" element={<InvoicesPage />} />
                <Route path="/settlement" element={<SettlementPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/support" element={<SupportPage />} />
              </Route>

              <Route path="/pay" element={<PaymentPage />} />
            </Routes>
          )}
        </BrowserRouter>
      </QueryClientProvider>
    </TonConnectUIProvider>
  );
}

export default App;
