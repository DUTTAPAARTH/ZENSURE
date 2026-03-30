import axios from 'axios';
import {
  ClaimListResponse,
  DashboardKPIs,
  DisruptionsResponse,
  FlaggedClaimsResponse,
  ReviewClaimPayload,
} from '../types';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000,
});

api.interceptors.response.use(response => {
  console.log('[dashboard api]', response.config.url, response.data);
  return response;
});

export const insurerAPI = {
  getDashboard: () =>
    api.get<{ data: DashboardKPIs }>('/api/insurer/dashboard').then(r => r.data.data),

  getClaims: (params?: { status?: string; city?: string; page?: number; limit?: number }) =>
    api
      .get<{ data: ClaimListResponse }>('/api/insurer/claims', { params })
      .then(r => r.data.data),

  getFlaggedClaims: () =>
    api.get<{ data: FlaggedClaimsResponse }>('/api/insurer/fraud/flagged').then(r => r.data.data),

  reviewClaim: (id: string, payload: ReviewClaimPayload) =>
    api.post(`/api/insurer/claims/${id}/review`, payload).then(r => r.data.data),

  simulateDisruption: (data: {
    event_type: string;
    city: string;
    zone: string;
    severity: number;
  }) => api.post('/api/disruptions/simulate', data).then(r => r.data.data),

  getActiveDisruptions: (city?: string) =>
    api
      .get<{ data: DisruptionsResponse }>('/api/disruptions/active', { params: city ? { city } : {} })
      .then(r => r.data.data),
};
