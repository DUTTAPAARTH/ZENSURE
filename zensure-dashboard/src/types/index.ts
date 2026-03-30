export interface Worker {
  id: string;
  name: string;
  partner_id: string;
  city: string;
  zone: string;
  mobile: string;
}

export interface Policy {
  id: string;
  worker_id: string;
  plan: string;
  premium_amount: number;
  coverage_percent: number;
  max_payout: number;
  week_start: string;
  week_end: string;
  status: string;
  zone_risk_score: number;
}

export interface DisruptionEvent {
  id: string;
  event_type: string;
  city: string;
  zone: string;
  severity: number;
  triggered_at: string;
  data_source: string;
}

export interface Claim {
  id: string;
  worker_id: string;
  policy_id: string;
  event_id: string;
  event_type?: string;
  payout_amount: number;
  fraud_score: number;
  ring_score: number;
  status: string;
  created_at: string;
  worker_name?: string;
  city?: string;
  zone?: string;
  partner_id?: string;
  workers?: Worker;
  disruption_events?: DisruptionEvent;
  fraud_signals?: string[];
}

export interface DashboardKPIs {
  active_policies: number;
  claims_this_week: number;
  total_premiums_collected: number;
  total_payouts_this_week: number;
  loss_ratio: number;
  liquidity_pool: number;
  auto_approval_rate: number;
  fraud_hold_rate: number;
}

export interface ClaimListResponse {
  page: number;
  limit: number;
  claims: Claim[];
}

export interface FlaggedClaimsResponse {
  claims: Claim[];
}

export interface DisruptionsResponse {
  disruptions: DisruptionEvent[];
  zone_status?: string;
}

export interface ReviewClaimPayload {
  decision: 'approve' | 'reject';
  reason?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
