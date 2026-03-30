import React, { useEffect, useMemo, useState } from 'react';
import { FileText, RefreshCcw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { insurerAPI } from '../services/api';
import { Claim } from '../types';
import { SkeletonTable } from '../components/LoadingSkeleton';

type Props = {
  refreshSignal: number;
  onDataRefresh: () => void;
  pushToast: (type: 'success' | 'error' | 'info', message: string) => void;
};

const statuses = ['all', 'processing', 'auto_approved', 'soft_hold', 'hard_hold', 'paid'];
const cityOptions = ['All Cities', 'Mumbai', 'Chennai', 'Bengaluru', 'Hyderabad', 'Delhi-NCR'];

function formatCurrency(value: number) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

function statusClass(status: string) {
  return `status-chip status-${status}`;
}

export default function Claims({ refreshSignal, onDataRefresh, pushToast }: Props) {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('All Cities');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [reviewModal, setReviewModal] = useState<null | { id: string; decision: 'approve' | 'reject'; amount: number }>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const data = await insurerAPI.getClaims({
        status: statusFilter === 'all' ? undefined : statusFilter,
        city: cityFilter === 'All Cities' ? undefined : cityFilter,
        page: 1,
        limit: 100,
      });
      setClaims(data.claims || []);
      onDataRefresh();
    } catch {
      pushToast('error', 'Could not load claims.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    void fetchClaims();
  }, [statusFilter, cityFilter, refreshSignal]);

  const filteredClaims = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return claims;
    }
    return claims.filter(claim =>
      `${claim.worker_name || ''} ${claim.partner_id || ''}`.toLowerCase().includes(term)
    );
  }, [claims, search]);

  const paginatedClaims = useMemo(() => {
    const start = (page - 1) * 10;
    return filteredClaims.slice(start, start + 10);
  }, [filteredClaims, page]);

  const totalPages = Math.max(1, Math.ceil(filteredClaims.length / 10));

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
      pushToast(reviewModal.decision === 'approve' ? 'success' : 'info', reviewModal.decision === 'approve' ? 'Claim approved and paid' : 'Claim rejected');
      setReviewModal(null);
      setRejectReason('');
      await fetchClaims();
    } catch {
      pushToast('error', 'Claim review failed.');
    } finally {
      setReviewing(null);
    }
  };

  return (
    <div className="page-stack">
      <section className="sticky-subbar">
        <div className="filter-bar">
          <div className="filter-group">
            {statuses.map(status => (
              <button
                key={status}
                className={`filter-button ${statusFilter === status ? 'active' : ''}`}
                onClick={() => setStatusFilter(status)}
              >
                {status === 'all' ? 'All' : status.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          <select className="select" style={{ width: 150 }} value={cityFilter} onChange={e => setCityFilter(e.target.value)}>
            {cityOptions.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>

          <input className="input" style={{ width: 240 }} placeholder="Search worker name or ID..." value={search} onChange={e => setSearch(e.target.value)} />

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="muted-text">{filteredClaims.length} total claims</span>
            <button className="button-ghost" onClick={() => void fetchClaims()}>
              <RefreshCcw size={16} />
            </button>
          </div>
        </div>
      </section>

      <section className="table-card">
        <div className="table-scroll">
          {loading ? (
            <div style={{ padding: 20 }}><SkeletonTable /></div>
          ) : filteredClaims.length === 0 ? (
            <div className="empty-state">
              <FileText size={48} color="var(--text-secondary)" />
              <div style={{ fontSize: 20, fontWeight: 700 }}>No claims found</div>
              <div className="muted-text">Adjust filters or simulate a disruption</div>
            </div>
          ) : (
            <>
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedClaims.map(claim => (
                    <tr key={claim.id}>
                      <td>
                        <div className="worker-meta">
                          <span className="worker-name">{claim.worker_name || 'Unknown worker'}</span>
                          <span className="worker-subtitle">#{claim.partner_id || claim.id.slice(0, 8)}</span>
                        </div>
                      </td>
                      <td className="muted-text">{claim.city || '-'} · {claim.zone || '-'}</td>
                      <td>{claim.event_type || claim.event_id || '-'}</td>
                      <td style={{ color: 'var(--orange)', fontWeight: 700 }}>{formatCurrency(claim.payout_amount || 0)}</td>
                      <td style={{ color: Number(claim.fraud_score) > 0.6 ? 'var(--red)' : Number(claim.fraud_score) > 0.3 ? 'var(--yellow)' : 'var(--green)' }}>
                        {Number(claim.fraud_score || 0).toFixed(2)}
                      </td>
                      <td><span className={statusClass(claim.status)}>{claim.status.replace(/_/g, ' ').toUpperCase()}</span></td>
                      <td className="muted-text">{formatDistanceToNow(new Date(claim.created_at), { addSuffix: true })}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {claim.status === 'soft_hold' ? <button className="button-warning" onClick={() => setReviewModal({ id: claim.id, decision: 'approve', amount: claim.payout_amount || 0 })}>Review</button> : null}
                          {claim.status === 'hard_hold' ? (
                            <>
                              <button className="button-success" onClick={() => setReviewModal({ id: claim.id, decision: 'approve', amount: claim.payout_amount || 0 })}>Approve</button>
                              <button className="button-danger" onClick={() => setReviewModal({ id: claim.id, decision: 'reject', amount: claim.payout_amount || 0 })}>Reject</button>
                            </>
                          ) : null}
                          <button className="button-secondary">Details</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="table-header" style={{ borderTop: '1px solid var(--border)', borderBottom: 'none' }}>
                <span className="muted-text">
                  Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, filteredClaims.length)} of {filteredClaims.length}
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="button-secondary" disabled={page === 1} onClick={() => setPage(prev => Math.max(1, prev - 1))}>Prev</button>
                  <button className="button-secondary" disabled={page === totalPages} onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}>Next</button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {reviewModal ? (
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{ fontSize: 18, fontWeight: 700 }}>
              {reviewModal.decision === 'approve' ? `Approve claim for ${formatCurrency(reviewModal.amount)}?` : 'Reject claim'}
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
