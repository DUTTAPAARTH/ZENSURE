import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Shield, Users } from 'lucide-react';
import { insurerAPI } from '../services/api';
import { Claim, DashboardKPIs } from '../types';
import KPICard from '../components/KPICard';
import { SkeletonCard, SkeletonTable } from '../components/LoadingSkeleton';

type Props = {
  refreshSignal: number;
  onDataRefresh: () => void;
  pushToast: (type: 'success' | 'error' | 'info', message: string) => void;
};

function progressColor(score: number) {
  return score > 0.6 ? 'var(--red)' : score > 0.3 ? 'var(--yellow)' : 'var(--green)';
}

export default function FraudMonitor({ refreshSignal, onDataRefresh, pushToast }: Props) {
  const [dashboard, setDashboard] = useState<DashboardKPIs | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState<null | { id: string; decision: 'approve' | 'reject' }>(null);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashboardData, flaggedData] = await Promise.all([
        insurerAPI.getDashboard(),
        insurerAPI.getFlaggedClaims(),
      ]);
      setDashboard(dashboardData);
      setClaims(flaggedData.claims || []);
      onDataRefresh();
    } catch {
      pushToast('error', 'Could not load fraud monitor data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, [refreshSignal]);

  const softHolds = useMemo(() => claims.filter(claim => claim.status === 'soft_hold').length, [claims]);
  const hardHolds = useMemo(() => claims.filter(claim => claim.status === 'hard_hold').length, [claims]);

  const submitReview = async () => {
    if (!reviewModal) {
      return;
    }
    try {
      setReviewing(reviewModal.id);
      await insurerAPI.reviewClaim(reviewModal.id, {
        decision: reviewModal.decision,
        reason: reviewModal.decision === 'reject' ? rejectReason : undefined,
      });
      pushToast('success', reviewModal.decision === 'approve' ? 'Claim approved and paid' : 'Claim rejected');
      setReviewModal(null);
      setRejectReason('');
      await fetchData();
    } catch {
      pushToast('error', 'Fraud review action failed.');
    } finally {
      setReviewing(null);
    }
  };

  return (
    <div className="page-stack">
      <div className="stats-grid-4">
        {loading || !dashboard ? (
          Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />)
        ) : (
          <>
            <KPICard title="Auto-Approval Rate" value={`${Math.round(dashboard.auto_approval_rate * 100)}%`} subtitle="Claims cleared automatically" icon={<CheckCircle size={16} />} color="green" />
            <KPICard title="Soft Holds" value={softHolds} subtitle="Awaiting extra evidence" icon={<AlertCircle size={16} />} color="yellow" />
            <KPICard title="Hard Holds" value={hardHolds} subtitle="Manual review required" icon={<AlertTriangle size={16} />} color="red" />
            <KPICard title="Ring Events" value="0" subtitle="No active fraud rings" icon={<Users size={16} />} color="orange" />
          </>
        )}
      </div>

      {hardHolds > 0 ? (
        <div className="error-banner">
          <AlertTriangle size={18} />
          <span>⚠️ {hardHolds} claims require immediate manual review</span>
        </div>
      ) : null}

      <section className="table-card">
        <div className="table-header">
          <div>
            <div className="section-title" style={{ marginBottom: 4 }}>Flagged Claims</div>
            <div className="section-subtitle">Claims held for fraud review</div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 20 }}><SkeletonTable /></div>
        ) : claims.length === 0 ? (
          <div className="empty-state">
            <Shield size={64} color="var(--green)" />
            <div style={{ fontSize: 20, fontWeight: 700 }}>No fraud detected</div>
            <div className="muted-text">All claims have passed validation</div>
            <span className="badge" style={{ background: 'rgba(0,200,83,0.15)', color: 'var(--green)' }}>Ring Score: Clean</span>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Zone</th>
                  <th>Event</th>
                  <th>Fraud Score</th>
                  <th>Ring Score</th>
                  <th>Signals</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {claims.map(claim => {
                  const fraudScore = Number(claim.fraud_score || 0);
                  const ringScore = Number(claim.ring_score || 0);
                  const signals = [];
                  if (fraudScore > 0.6) signals.push({ label: 'GPS Mismatch', color: 'var(--red)' });
                  if (fraudScore > 0.4) signals.push({ label: 'Motion Anomaly', color: 'var(--orange)' });
                  if (fraudScore > 0.2) signals.push({ label: 'Velocity Spike', color: 'var(--yellow)' });
                  if (ringScore > 0.5) signals.push({ label: 'Ring Detected', color: 'var(--red)' });

                  return (
                    <tr key={claim.id}>
                      <td>
                        <div className="worker-meta">
                          <span className="worker-name">{claim.worker_name || 'Unknown worker'}</span>
                          <span className="worker-subtitle">#{claim.id.slice(0, 8)}</span>
                        </div>
                      </td>
                      <td className="muted-text">{claim.city || '-'} · {claim.zone || '-'}</td>
                      <td>{claim.event_type || claim.event_id || '-'}</td>
                      <td>
                        <div className="progress-row">
                          <div className="progress-track"><div className="progress-fill" style={{ width: `${fraudScore * 100}%`, background: progressColor(fraudScore) }} /></div>
                          <span style={{ color: progressColor(fraudScore), fontSize: 12, fontWeight: 700 }}>{(fraudScore * 100).toFixed(0)}%</span>
                        </div>
                      </td>
                      <td>
                        <div className="progress-row">
                          <div className="progress-track"><div className="progress-fill" style={{ width: `${ringScore * 100}%`, background: progressColor(ringScore) }} /></div>
                          <span style={{ color: progressColor(ringScore), fontSize: 12, fontWeight: 700 }}>{(ringScore * 100).toFixed(0)}%</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {signals.map(signal => (
                            <span key={signal.label} className="signal-chip" style={{ background: `${signal.color}22`, color: signal.color }}>{signal.label}</span>
                          ))}
                        </div>
                      </td>
                      <td><span className={`status-chip status-${claim.status}`}>{claim.status.replace(/_/g, ' ').toUpperCase()}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="button-success" onClick={() => setReviewModal({ id: claim.id, decision: 'approve' })}>Approve</button>
                          <button className="button-danger" onClick={() => setReviewModal({ id: claim.id, decision: 'reject' })}>Reject</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {reviewModal ? (
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{ fontSize: 18, fontWeight: 700 }}>
              {reviewModal.decision === 'approve' ? 'Approve flagged claim?' : 'Reject flagged claim'}
            </div>
            {reviewModal.decision === 'reject' ? (
              <textarea className="textarea" placeholder="Reason for rejection" value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
            ) : null}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button className="button-secondary" onClick={() => setReviewModal(null)}>Cancel</button>
              <button className="button-primary" disabled={reviewing === reviewModal.id} onClick={() => void submitReview()}>
                {reviewing === reviewModal.id ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
