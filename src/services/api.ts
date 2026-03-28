// ============================================================
// ZENSURE — Mock API Service
// ============================================================

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ---- Types ----

export interface Partner {
  id: string;
  name: string;
  city: string;
  zone: string;
  platform: 'zomato' | 'swiggy';
  mobile: string;
  memberSince: string;
}

export interface Policy {
  id: string;
  partnerId: string;
  plan: 'Silver' | 'Gold' | 'Platinum';
  coverageAmount: number;
  premiumPaid: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'pending';
}

export type ClaimStatus = 'processing' | 'approved' | 'rejected';
export type ClaimType = 'Rain' | 'Strike' | 'Festival Slowdown' | 'Platform Outage';

export interface Claim {
  id: string;
  partnerId: string;
  type: ClaimType;
  status: ClaimStatus;
  filedOn: string;
  payoutAmount?: number;
  description: string;
  stages: ClaimStage[];
}

export interface ClaimStage {
  label: string;
  completed: boolean;
  date?: string;
}

export type DisruptionSeverity = 'high' | 'medium' | 'low';

export interface Disruption {
  id: string;
  type: string;
  city: string;
  severity: DisruptionSeverity;
  description: string;
  timestamp: string;
}

// ---- Auth APIs ----

export const sendOTP = async (mobile: string): Promise<{ success: boolean; message: string }> => {
  await delay(1000);
  if (!mobile || mobile.length < 10) {
    return { success: false, message: 'Invalid mobile number' };
  }
  return { success: true, message: `OTP sent to +91 ${mobile}` };
};

export const verifyOTP = async (
  mobile: string,
  otp: string
): Promise<{
  success: boolean;
  token?: string;
  partner?: Partner;
  message?: string;
}> => {
  await delay(1200);
  if (otp === '123456') {
    return {
      success: true,
      token: 'mock_token_xyz_' + Date.now(),
      partner: {
        id: 'ZM' + mobile.slice(-4).padStart(6, '0'),
        name: 'Ravi Kumar',
        city: 'Bengaluru',
        zone: 'Koramangala',
        platform: 'zomato',
        mobile,
        memberSince: '2024-01-15',
      },
    };
  }
  return { success: false, message: 'Invalid OTP. Use 123456 for demo.' };
};

// ---- Policy APIs ----

export const getPolicy = async (): Promise<Policy> => {
  await delay(600);
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 10, 0);
  return {
    id: 'POL-2024-001847',
    partnerId: 'ZM004821',
    plan: 'Silver',
    coverageAmount: 15000,
    premiumPaid: 249,
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
    status: 'active',
  };
};

// ---- Claims APIs ----

export const getClaims = async (): Promise<Claim[]> => {
  await delay(700);
  return [
    {
      id: 'CLM-2024-0089',
      partnerId: 'ZM004821',
      type: 'Rain',
      status: 'approved',
      filedOn: '2024-11-18',
      payoutAmount: 1200,
      description: 'Heavy rain in Bengaluru caused delivery suspension for 2 days',
      stages: [
        { label: 'Filed', completed: true, date: '2024-11-18' },
        { label: 'Verified', completed: true, date: '2024-11-19' },
        { label: 'Processing', completed: true, date: '2024-11-20' },
        { label: 'Approved', completed: true, date: '2024-11-21' },
      ],
    },
    {
      id: 'CLM-2024-0112',
      partnerId: 'ZM004821',
      type: 'Platform Outage',
      status: 'processing',
      filedOn: '2024-12-03',
      description: 'Zomato app outage for 6+ hours causing income loss',
      stages: [
        { label: 'Filed', completed: true, date: '2024-12-03' },
        { label: 'Verified', completed: true, date: '2024-12-04' },
        { label: 'Processing', completed: false },
        { label: 'Approved', completed: false },
      ],
    },
    {
      id: 'CLM-2024-0054',
      partnerId: 'ZM004821',
      type: 'Strike',
      status: 'rejected',
      filedOn: '2024-10-07',
      description: 'Local transport strike — claim rejected due to policy exclusion',
      stages: [
        { label: 'Filed', completed: true, date: '2024-10-07' },
        { label: 'Verified', completed: true, date: '2024-10-08' },
        { label: 'Processing', completed: true, date: '2024-10-09' },
        { label: 'Rejected', completed: true, date: '2024-10-10' },
      ],
    },
  ];
};

// ---- Disruptions APIs ----

export const getDisruptions = async (): Promise<Disruption[]> => {
  await delay(500);
  return [
    {
      id: 'DIS-001',
      type: 'Heavy Rain',
      city: 'Bengaluru',
      severity: 'high',
      description: 'Red alert issued — heavy rain expected. Deliveries may be affected.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'DIS-002',
      type: 'Platform Maintenance',
      city: 'Mumbai',
      severity: 'medium',
      description: 'Scheduled maintenance from 2AM–4AM tonight.',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'DIS-003',
      type: 'Festival Slowdown',
      city: 'Chennai',
      severity: 'low',
      description: 'Reduced orders expected due to Pongal holiday.',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
  ];
};
