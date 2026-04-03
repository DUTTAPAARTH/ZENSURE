import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { X } from 'lucide-react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Overview from './pages/Overview';
import Claims from './pages/Claims';
import FraudMonitor from './pages/FraudMonitor';
import Analytics from './pages/Analytics';
import { ToastMessage } from './types';

const pageTitles: Record<string, string> = {
  '/': 'Overview',
  '/claims': 'Claims Management',
  '/fraud': 'Fraud Monitor',
  '/analytics': 'Analytics & Forecast',
};

const queryClient = new QueryClient();

function AppLayout() {
  const location = useLocation();
  const [refreshSignal, setRefreshSignal] = useState(0);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(() => Date.now());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const refreshInterval = window.setInterval(() => {
      setRefreshSignal(value => value + 1);
      setLastRefreshedAt(Date.now());
    }, 30000);

    return () => {
      window.clearInterval(refreshInterval);
    };
  }, []);

  const pushToast = (type: ToastMessage['type'], message: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, message }]);
    window.setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleDataRefresh = () => {
    setLastRefreshedAt(Date.now());
  };

  const title = useMemo(() => pageTitles[location.pathname] || 'Overview', [location.pathname]);

  return (
    <div className="dashboard-shell">
      <Sidebar />
      <div className="dashboard-main">
        <TopBar title={title} lastRefreshedAt={lastRefreshedAt} />
        <div className="dashboard-page">
          <Routes>
            <Route path="/" element={<Overview refreshSignal={refreshSignal} onDataRefresh={handleDataRefresh} pushToast={pushToast} />} />
            <Route path="/claims" element={<Claims refreshSignal={refreshSignal} onDataRefresh={handleDataRefresh} pushToast={pushToast} />} />
            <Route path="/fraud" element={<FraudMonitor refreshSignal={refreshSignal} onDataRefresh={handleDataRefresh} pushToast={pushToast} />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </div>
      </div>

      <div className="toast-stack">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <div>{toast.message}</div>
            <button onClick={() => dismissToast(toast.id)} style={{ background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
