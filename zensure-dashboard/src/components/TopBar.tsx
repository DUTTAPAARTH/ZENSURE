import React, { useEffect, useMemo, useState } from 'react';
import { Bell, Search } from 'lucide-react';
import { format } from 'date-fns';

type Props = {
  title: string;
  lastRefreshedAt: number;
};

export default function TopBar({ title, lastRefreshedAt }: Props) {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const elapsedSeconds = Math.max(0, Math.floor((nowMs - lastRefreshedAt) / 1000));

  const clock = useMemo(() => format(new Date(nowMs), 'dd MMM yyyy  HH:mm:ss'), [nowMs]);

  return (
    <header
      style={{
        height: 60,
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        gap: 16,
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</div>

      <div style={{ position: 'relative', width: 300 }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-secondary)',
          }}
        />
        <input
          style={{
            width: '100%',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 16px 8px 40px',
            color: 'var(--text-primary)',
            fontSize: 14,
          }}
          placeholder="Search workers, claims, zones..."
          readOnly
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: 12,
              color: 'var(--text-secondary)',
              fontFamily: 'monospace',
            }}
          >
            {clock}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            Updated {elapsedSeconds}s ago
          </div>
        </div>

        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <Bell size={18} color="var(--text-primary)" />
          <span
            style={{
              position: 'absolute',
              top: -6,
              right: -6,
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: 'var(--orange)',
              color: '#fff',
              fontSize: 10,
              display: 'grid',
              placeItems: 'center',
              fontWeight: 700,
            }}
          >
            3
          </span>
        </div>

        <div
          style={{
            padding: '6px 14px',
            background: 'var(--orange-dim)',
            border: '1px solid var(--orange-border)',
            borderRadius: 20,
            color: 'var(--orange)',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          ⚡ Admin
        </div>
      </div>
    </header>
  );
}
