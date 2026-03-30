import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Database,
  FileText,
  Percent,
  Shield,
  TrendingUp,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { insurerAPI } from '../services/api';
import { Claim, DashboardKPIs, DisruptionEvent } from '../types';
import KPICard from '../components/KPICard';
import { SkeletonCard, SkeletonTable } from '../components/LoadingSkeleton';

type Props = {
  refreshSignal: number;
  onDataRefresh: () => void;
  pushToast: (type: 'success' | 'error' | 'info', message: string) => void;
};

const weeklyData = [
  { week: 'Feb 3', premiums: 12400, payouts: 7200 },
  { week: 'Feb 10', premiums: 15600, payouts: 8900 },
  { week: 'Feb 17', premiums: 13200, payouts: 9100 },
  { week: 'Feb 24', premiums: 18900, payouts: 11200 },
  { week: 'Mar 3', premiums: 21000, payouts: 13400 },
  { week: 'Mar 10', premiums: 19500, payouts: 14100 },
  { week: 'Mar 17', premiums: 24200, payouts: 15800 },
  { week: 'Mar 24', premiums: 28000, payouts: 17200 },
];

const eventOptions = [
  { value: 'heavy_rain', label: '🌧️ Heavy Rain' },
  { value: 'extreme_heat', label: '🌡️ Extreme Heat' },
  { value: 'severe_aqi', label: '😷 Severe AQI' },
  { value: 'cyclone', label: '🌀 Cyclone' },
  { value: 'flash_flood', label: '🌊 Flash Flood' },
  { value: 'civic_disruption', label: '⚠️ Civic Disruption' },
];

const cityOptions = ['Mumbai', 'Chennai', 'Bengaluru', 'Hyderabad', 'Delhi-NCR'];

function formatCurrency(value: number) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

function eventMeta(eventType: string) {
  switch (eventType) {
    case 'heavy_rain':
      return { label: '🌧️ Rain', className: 'event-chip event-rain' };
    case 'severe_aqi':
      return { label: '😷 AQI', className: 'event-chip event-aqi' };
    case 'extreme_heat':
      return { label: '🌡️ Heat', className: 'event-chip event-heat' };
    case 'flash_flood':
      return { label: '🌊 Flood', className: 'event-chip event-flood' };
    case 'civic_disruption':
      return { label: '⚠️ Bandh', className: 'event-chip event-bandh' };
    default:
      return { label: eventType, className: 'event-chip event-default' };
  }
}

function statusClass(status: string) {
  return `status-chip status-${status}`;
}

export default function Overview({ refreshSignal, onDataRefresh, pushToast }: Props) {
  const [dashboard, setDashboard] = useState<DashboardKPIs | null>(null);
  const [disruptions, setDisruptions] = useState<DisruptionEvent[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedLoading, setFeedLoading] = useState(true);
  const [claimsLoading, setClaimsLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedError, setFeedError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [formData, setFormData] = useState({
    event_type: 'heavy_rain',
    city: 'Mumbai',
    zone: 'Dadar',
    severity: 75,
  });

  const fetchOverview = async () => {
    try {
      setError('');
      setLoading(true);
      const data = await insurerAPI.getDashboard();
      setDashboard(data);
      onDataRefresh();
    } catch {
      setError('Could not load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeed = async () => {
    try {
      setFeedError('');
      setFeedLoading(true);
      const data = await insurerAPI.getActiveDisruptions();
      setDisruptions(data.disruptions || []);
      onDataRefresh();
    } catch {
      setFeedError('Could not load live disruptions.');
    } finally {
      setFeedLoading(false);
    }
  };

  const fetchClaims = async () => {
    try {
      setClaimsLoading(true);
      const data = await insurerAPI.getClaims({ page: 1, limit: 5 });
      setClaims(data.claims || []);
      onDataRefresh();
    } catch {
      pushToast('error', 'Recent claims preview failed to load.');
    } finally {
      setClaimsLoading(false);
    }
  };

  useEffect(() => {
    void Promise.all([fetchOverview(), fetchFeed(), fetchClaims()]);
  }, [refreshSignal]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void fetchFeed();
    }, 30000);
    return () => window.clearInterval(interval);
  }, []);

  const lossRatioSubtitle = useMemo(() => {
    if (!dashboard) {
      return '';
    }
    return dashboard.loss_ratio < 60 ? 'Healthy ✓' : dashboard.loss_ratio < 80 ? 'Watch ⚠️' : 'Critical 🔴';
  }, [dashboard]);

  const handleSimulate = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setModalLoading(true);
      setModalError('');
      const result = await insurerAPI.simulateDisruption(formData);
      setModalOpen(false);
      pushToast(
        'success',
        `✅ Disruption fired! ${result.claims_created} claims created, ${result.auto_approved} auto-approved`
      );
      await Promise.all([fetchFeed(), fetchClaims(), fetchOverview()]);
    } catch (error: any) {
      setModalError(error?.response?.data?.error || 'Simulation failed.');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="page-stack">
      <div className="kpi-grid">
        {loading || !dashboard ? (
          Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)
        ) : (
          <>
            <KPICard title="Active Policies" value={dashboard.active_policies} subtitle="Workers covered this week" icon={<Shield size={16} />} color="green" />
            <KPICard title="Claims This Week" value={dashboard.claims_this_week} subtitle={`${Math.round(dashboard.fraud_hold_rate * 100)}% hold rate`} icon={<FileText size={16} />} color="orange" />
            <KPICard title="Premiums Collected" value={formatCurrency(dashboard.total_premiums_collected)} subtitle="This week's premium pool" icon={<TrendingUp size={16} />} color="green" trend="up" />
            <KPICard title="Payouts Made" value={formatCurrency(dashboard.total_payouts_this_week)} subtitle="Paid out this week" icon={<ArrowUpRight size={16} />} color="red" trend="down" />
            <KPICard title="Loss Ratio" value={`${Math.round(dashboard.loss_ratio * 100)}%`} subtitle={lossRatioSubtitle} icon={<Percent size={16} />} color={dashboard.loss_ratio < 0.6 ? 'green' : dashboard.loss_ratio < 0.8 ? 'yellow' : 'red'} />
            <KPICard title="Liquidity Pool" value={formatCurrency(dashboard.liquidity_pool)} subtitle="Available reserve" icon={<Database size={16} />} color="green" />
          </>
        )}
      </div>

      {error ? (
        <div className="error-banner">
          <AlertCircle size={18} />
          <span style={{ flex: 1 }}>{error}</span>
          <button className="button-secondary" onClick={() => void fetchOverview()}>Retry</button>
        </div>
      ) : null}

      <div className="page-grid-2-1">
        <section className="section-card">
          <div className="page-header-row" style={{ marginBottom: 20 }}>
            <div>
              <div className="section-title">Weekly Premiums vs Payouts</div>
              <div className="section-subtitle">Last 8 weeks performance</div>
            </div>
          </div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <AreaChart data={weeklyData}>
                <CartesianGrid stroke="#2A2A2A" strokeDasharray="3 3" />
                <XAxis dataKey="week" stroke="#555" tick={{ fill: '#888', fontSize: 12 }} />
                <YAxis stroke="#555" tick={{ fill: '#888', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 8, color: '#fff' }}
                  formatter={(val: unknown) => {
                    const numeric = Array.isArray(val) ? Number(val[0] || 0) : Number(val || 0);
                    return formatCurrency(numeric);
                  }}
                />
                <Area type="monotone" dataKey="premiums" stroke="#FF6B00" strokeWidth={2} fill="#FF6B00" fillOpacity={0.08} />
                <Area type="monotone" dataKey="payouts" stroke="#FF3D00" strokeWidth={2} fill="#FF3D00" fillOpacity={0.05} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-legend">
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span className="legend-dot" style={{ background: '#FF6B00' }} />Premiums</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span className="legend-dot" style={{ background: '#FF3D00' }} />Payouts</span>
          </div>
        </section>

        <section className="section-card">
          <div className="page-header-row" style={{ marginBottom: 20 }}>
            <div className="section-title">Live Disruptions</div>
            {disruptions.length > 0 ? (
              <span className="badge" style={{ background: 'rgba(255,61,0,0.15)', color: 'var(--red)' }}>
                <span className="live-dot" />
                LIVE
              </span>
            ) : null}
          </div>

          {feedLoading ? (
            <SkeletonTable />
          ) : feedError ? (
            <div className="error-banner">
              <AlertCircle size={18} />
              <span style={{ flex: 1 }}>{feedError}</span>
              <button className="button-secondary" onClick={() => void fetchFeed()}>Retry</button>
            </div>
          ) : disruptions.length === 0 ? (
            <div className="empty-state" style={{ minHeight: 260 }}>
              <CheckCircle2 size={32} color="var(--green)" />
              <div style={{ color: 'var(--green)', fontWeight: 700 }}>All zones clear</div>
              <div className="muted-text">No active disruptions</div>
            </div>
          ) : (
            <div>
              {disruptions.map(item => {
                const severityPercent = Math.round(Number(item.severity) * 100);
                const dotColor = severityPercent > 70 ? 'var(--red)' : severityPercent >= 40 ? 'var(--yellow)' : 'var(--green)';
                const badgeStyle = severityPercent > 70 ? { background: 'rgba(255,61,0,0.15)', color: 'var(--red)' } : severityPercent >= 40 ? { background: 'rgba(255,215,0,0.15)', color: 'var(--yellow)' } : { background: 'rgba(0,200,83,0.15)', color: 'var(--green)' };
                const labelMap: Record<string, string> = {
                  heavy_rain: '🌧️ Heavy Rain',
                  severe_aqi: '😷 Severe AQI',
                  extreme_heat: '🌡️ Extreme Heat',
                  flash_flood: '🌊 Flash Flood',
                  civic_disruption: '⚠️ Civic Disruption',
                  cyclone: '🌀 Cyclone',
                };

                return (
                  <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '12px 1fr auto', gap: 12, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                    <span className="severity-dot" style={{ background: dotColor }} />
                    <div>
                      <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{labelMap[item.event_type] || item.event_type}</div>
                      <div className="muted-text">{item.city} · {item.zone}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="badge" style={badgeStyle}>{severityPercent}%</span>
                      <div className="muted-text" style={{ marginTop: 6 }}>{formatDistanceToNow(new Date(item.triggered_at), { addSuffix: true })}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button className="button-primary" style={{ width: '100%', marginTop: 16 }} onClick={() => setModalOpen(true)}>
            Simulate Disruption
          </button>
        </section>
      </div>

      <section className="table-card">
        <div className="table-header">
          <div className="section-title" style={{ marginBottom: 0 }}>Recent Claims</div>
          <Link to="/claims" className="link-orange">View All →</Link>
        </div>
        <div className="table-scroll">
          {claimsLoading ? (
            <div style={{ padding: 20 }}><SkeletonTable /></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Zone</th>
                  <th>Event</th>
                  <th>Amount</th>
                  <th>Fraud Score</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {claims.map(claim => {
                  const event = eventMeta(claim.event_type || claim.disruption_events?.event_type || claim.event_id || 'unknown');
                  const fraudScore = Number(claim.fraud_score || 0);
                  const fraudColor = fraudScore < 0.3 ? 'var(--green)' : fraudScore <= 0.6 ? 'var(--yellow)' : 'var(--red)';
                  return (
                    <tr key={claim.id}>
                      <td>
                        <div className="worker-meta">
                          <span className="worker-name">{claim.worker_name || 'Unknown worker'}</span>
                          <span className="worker-subtitle">#{claim.partner_id || claim.id.slice(0, 8)}</span>
                        </div>
                      </td>
                      <td className="muted-text">{claim.city || '-'} · {claim.zone || '-'}</td>
                      <td><span className={event.className}>{event.label}</span></td>
                      <td style={{ color: 'var(--orange)', fontWeight: 700 }}>{formatCurrency(claim.payout_amount || 0)}</td>
                      <td style={{ color: fraudColor, fontWeight: 700 }}>{fraudScore.toFixed(2)}</td>
                      <td><span className={statusClass(claim.status)}>{claim.status.replace(/_/g, ' ').toUpperCase()}</span></td>
                      <td className="muted-text">{formatDistanceToNow(new Date(claim.created_at), { addSuffix: true })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {modalOpen ? (
        <div className="modal-overlay">
          <div className="modal-card">
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>🔥 Simulate Disruption</div>
              <div className="section-subtitle" style={{ marginTop: 6 }}>
                Fire a test event to demonstrate the claims pipeline
              </div>
            </div>

            <form className="form-grid" onSubmit={handleSimulate}>
              <label>
                <div className="muted-text" style={{ marginBottom: 6 }}>Event Type</div>
                <select className="select" value={formData.event_type} onChange={e => setFormData(prev => ({ ...prev, event_type: e.target.value }))}>
                  {eventOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>

              <label>
                <div className="muted-text" style={{ marginBottom: 6 }}>City</div>
                <select className="select" value={formData.city} onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}>
                  {cityOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>

              <label>
                <div className="muted-text" style={{ marginBottom: 6 }}>Zone</div>
                <input className="input" placeholder="e.g. Dadar, T. Nagar" value={formData.zone} onChange={e => setFormData(prev => ({ ...prev, zone: e.target.value }))} />
              </label>

              <label>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span className="muted-text">Severity</span>
                  <span style={{ color: 'var(--text-primary)' }}>{formData.severity}%</span>
                </div>
                <input type="range" min={0} max={100} value={formData.severity} onChange={e => setFormData(prev => ({ ...prev, severity: Number(e.target.value) }))} style={{ width: '100%', accentColor: 'var(--orange)' }} />
                <div style={{ marginTop: 8, color: formData.severity < 40 ? 'var(--green)' : formData.severity <= 70 ? 'var(--yellow)' : 'var(--red)', fontSize: 12 }}>
                  {formData.severity < 40 ? 'Low Impact' : formData.severity <= 70 ? 'Moderate Impact' : 'High Impact — Claims will trigger'}
                </div>
              </label>

              {modalError ? <div className="error-banner">{modalError}</div> : null}

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="button-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="button-primary" disabled={modalLoading}>{modalLoading ? 'Firing...' : 'Fire Disruption'}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
