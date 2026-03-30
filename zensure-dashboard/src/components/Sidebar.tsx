import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart2, FileText, LayoutDashboard, Shield } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/claims', label: 'Claims', icon: FileText },
  { to: '/fraud', label: 'Fraud Monitor', icon: Shield },
  { to: '/analytics', label: 'Analytics', icon: BarChart2 },
];

export default function Sidebar() {
  const [apiConnected, setApiConnected] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkApi = async () => {
      try {
        const response = await fetch('http://localhost:3000/health');
        if (mounted) {
          setApiConnected(response.ok);
        }
      } catch {
        if (mounted) {
          setApiConnected(false);
        }
      }
    };

    void checkApi();
    const interval = window.setInterval(checkApi, 15000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <aside
      style={{
        width: 240,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: 16,
        zIndex: 200,
      }}
    >
      <div style={{ padding: 24 }}>
        <div style={{ color: 'var(--orange)', fontSize: 24, fontWeight: 800 }}>zensure</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 4 }}>Insurer Portal</div>
      </div>
      <div style={{ height: 1, background: 'var(--border)', margin: '0 16px 16px' }} />
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 20px',
                borderRadius: 'var(--radius-sm)',
                margin: '2px 12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
                color: isActive ? 'var(--orange)' : 'var(--text-secondary)',
                background: isActive ? 'var(--orange-dim)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--orange)' : '3px solid transparent',
              })}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: apiConnected ? 'var(--green)' : 'var(--red)',
            }}
          />
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {apiConnected ? 'API Connected' : 'API Offline'}
          </span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
          Zensure v1.0 · DEVTrails 2026
        </div>
      </div>
    </aside>
  );
}
