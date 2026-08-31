
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LandingPage from './pages/Landing/LandingPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import DashboardLayout from './components/layout/DashboardLayout';
import OverviewPage from './pages/Dashboard/OverviewPage';
import InvoicesPage from './pages/Dashboard/InvoicesPage';
import GatewaysPage from './pages/Dashboard/GatewaysPage';
import SettlementReportPage from './pages/Dashboard/SettlementReportPage';
import SupportPage from './pages/Dashboard/SupportPage';
import PaymentPage from './pages/Payment/PaymentPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/pay/:invoiceId" element={<PaymentPage />} />
          <Route path="/pay/:invoiceId/fixed" element={<PaymentPage type="fixed" />} />
          <Route path="/pay/:invoiceId/flexible" element={<PaymentPage type="flexible" />} />

          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="gateways" element={<GatewaysPage />} />
            <Route path="settlement" element={<SettlementReportPage />} />
            <Route path="support" element={<SupportPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
