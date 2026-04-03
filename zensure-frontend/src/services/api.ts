import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../utils/constants';

const BASE_URL = API_BASE_URL;

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('zensure_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (config.headers?.Authorization) {
    delete config.headers.Authorization;
  }

  return config;
});

api.interceptors.response.use(
  response => response,
  async error => {
    if (error?.response?.status === 401) {
      await AsyncStorage.multiRemove(['zensure_token', 'zensure_worker']);
    }

    throw error;
  }
);

export type Worker = {
  id: string;
  partner_id: string;
  name: string;
  mobile: string;
  city: string;
  zone: string;
  upi_id: string;
  language: string;
  device_fingerprint?: string | null;
  status: string;
  created_at: string;
};

export type ActivePolicy = {
  id: string;
  worker_id: string;
  plan: string;
  premium_amount: number | string;
  coverage_percent: number;
  max_payout: number | string;
  week_start: string;
  week_end: string;
  status: string;
  zone_risk_score: number | string;
  created_at: string;
};

export type PolicyPlan = {
  id: 'basic' | 'standard' | 'full';
  name: string;
  base_price: number;
  adjusted_price: number;
  coverage_percent: number;
  max_payout: number;
  zone_risk_score: number;
  features: string[];
};

export type Claim = {
  id: string;
  worker_id: string;
  policy_id: string;
  event_id: string;
  payout_amount: number | null;
  fraud_score: string | number;
  ring_score: string | number;
  status: string;
  gps_delta: string | number | null;
  platform_activity_flag: boolean;
  created_at: string;
  event_type?: string;
  city?: string;
  zone?: string;
  severity?: string | number;
  triggered_at?: string;
};

export type DisruptionEvent = {
  id: string;
  event_type: string;
  city: string;
  zone: string;
  severity: string | number;
  triggered_at: string;
  data_source?: string;
  raw_data?: Record<string, unknown>;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
};

export const registerWorker = (data: {
  partner_id: string;
  name: string;
  mobile: string;
  city: string;
  zone: string;
  upi_id: string;
  language: string;
}) => api.post('/api/auth/register', data).then(r => r.data as ApiResponse<{ worker_id: string; message: string }>);

export const sendOTP = (mobile: string) =>
  api.post('/api/auth/otp/send', { mobile }).then(r => r.data as ApiResponse<{ otp: string; message: string }>);

export const verifyOTP = (mobile: string, otp: string) =>
  api.post('/api/auth/otp/verify', { mobile, otp }).then(r => r.data as ApiResponse<{ token: string; worker: Worker }>);

export const getProfile = () =>
  api
    .get('/api/workers/profile')
    .then(
      r =>
        r.data as ApiResponse<{
          worker: Worker;
          active_policy: ActivePolicy | null;
          week_claim_summary: {
            total_claims: number;
            total_payout: number;
            approved_claims: number;
          };
        }>
    );

export const updateProfile = (data: Partial<Pick<Worker, 'language' | 'zone' | 'upi_id'>>) =>
  api.put('/api/workers/profile', data).then(r => r.data as ApiResponse<{ worker: Worker }>);

export const getPlans = (city: string, zone: string) =>
  api
    .get('/api/policies/plans', { params: { city, zone } })
    .then(
      r =>
        r.data as ApiResponse<{
          plans: PolicyPlan[];
          zone_risk: { score: number; label: string; season: string };
        }>
    );

export const activatePolicy = (plan_id: string, city: string, zone: string) =>
  api
    .post('/api/policies/activate', { plan_id, city, zone })
    .then(r => r.data as ApiResponse<{ policy: ActivePolicy }>);

export const getActivePolicy = () =>
  api.get('/api/policies/active').then(r => r.data as ApiResponse<ActivePolicy | null>);

export const getClaims = () =>
  api.get('/api/claims').then(r => r.data as ApiResponse<{ claims: Claim[] }>);

export const getClaimById = (id: string) =>
  api
    .get(`/api/claims/${id}`)
    .then(r => r.data as ApiResponse<{ claim: Claim; timeline: unknown[] }>);

export const respondSoftHold = (
  id: string,
  action: 'repingLocation' | 'uploadPhoto',
  location?: { lat?: number; lng?: number }
) =>
  api
    .post(`/api/claims/${id}/softhold/respond`, { action, location })
    .then(
      r =>
        r.data as ApiResponse<{
          payout_amount: number;
          status: string;
          payout: { success: boolean; razorpay_ref: string; paid_at: string };
        }>
    );

export const getActiveDisruptions = (city: string, zone: string) =>
  api
    .get('/api/disruptions/active', { params: { city, zone } })
    .then(
      r =>
        r.data as ApiResponse<{
          disruptions: DisruptionEvent[];
          zone_status: 'green' | 'amber' | 'red';
        }>
    );

export const simulateDisruption = (data: {
  event_type: string;
  city: string;
  zone: string;
  severity: number;
}) =>
  api
    .post('/api/disruptions/simulate', data)
    .then(
      r =>
        r.data as ApiResponse<{
          event_id: string;
          claims_created: number;
          auto_approved: number;
          held: number;
        }>
    );

export default api;
