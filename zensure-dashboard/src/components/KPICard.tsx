import React from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';

type Props = {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'orange' | 'green' | 'red' | 'yellow';
};

const toneMap = {
  orange: { color: 'var(--orange)', background: 'rgba(255,107,0,0.15)' },
  green: { color: 'var(--green)', background: 'rgba(0,200,83,0.15)' },
  red: { color: 'var(--red)', background: 'rgba(255,61,0,0.15)' },
  yellow: { color: 'var(--yellow)', background: 'rgba(255,215,0,0.15)' },
};

export default function KPICard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'orange',
}: Props) {
  const tone = toneMap[color];
  const borderColor =
    color === 'orange'
      ? 'var(--orange-border)'
      : color === 'green'
        ? 'rgba(0,200,83,0.3)'
        : color === 'red'
          ? 'rgba(255,61,0,0.3)'
          : 'rgba(255,215,0,0.3)';

  return (
    <div
      className="card"
      style={{ padding: '20px 24px', cursor: 'default' }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = borderColor;
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: tone.background,
            color: tone.color,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          {icon}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>{title}</div>
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color: tone.color }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{subtitle}</div>
      {trend ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 12 }}>
          {trend === 'up' ? <TrendingUp size={14} color="var(--green)" /> : null}
          {trend === 'down' ? <TrendingDown size={14} color="var(--red)" /> : null}
          <span
            style={{
              color:
                trend === 'up' ? 'var(--green)' : trend === 'down' ? 'var(--red)' : 'var(--text-secondary)',
            }}
          >
            {trend === 'up' ? 'Positive trend' : trend === 'down' ? 'Downward trend' : 'Stable'}
          </span>
        </div>
      ) : null}
    </div>
  );
}
