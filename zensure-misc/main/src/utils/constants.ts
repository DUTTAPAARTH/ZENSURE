export const API_BASE_URL = 'http://192.168.1.25:3000';

export const ZENSURE_COLORS = {
  bg: '#0D0D0D',
  surface: '#1A1A1A',
  surfaceElevated: '#242424',
  border: '#2A2A2A',
  primary: '#FF6B00',
  primaryDim: 'rgba(255, 107, 0, 0.15)',
  white: '#FFFFFF',
  textSecondary: '#A0A0A0',
  success: '#00C853',
  successDim: 'rgba(0, 200, 83, 0.14)',
  warning: '#FFD700',
  warningDim: 'rgba(255, 215, 0, 0.14)',
  error: '#FF3D00',
  errorDim: 'rgba(255, 61, 0, 0.14)',
  orangeSoft: 'rgba(255, 107, 0, 0.10)',
  zomato: '#E23744',
  swiggy: '#FC8019',
};

export const STORAGE_KEYS = {
  LANGUAGE: 'zensure_language',
  PARTNER_DATA: 'zensure_worker',
  AUTH_TOKEN: 'zensure_token',
};

export const PLANS = {
  basic: {
    id: 'basic',
    name: 'Basic Shield',
    coveragePercent: 50,
    maxPayout: 1500,
    features: [
      '50% income replacement',
      'Max payout Rs 1,500/week',
      'Weather and outage triggers',
      'UPI payout after approval',
    ],
  },
  standard: {
    id: 'standard',
    name: 'Standard Shield',
    coveragePercent: 70,
    maxPayout: 2500,
    features: [
      '70% income replacement',
      'Max payout Rs 2,500/week',
      'Priority fraud review',
      'UPI payout after approval',
    ],
  },
  full: {
    id: 'full',
    name: 'Full Shield',
    coveragePercent: 90,
    maxPayout: 4000,
    features: [
      '90% income replacement',
      'Max payout Rs 4,000/week',
      'Best disruption protection',
      'Priority support line',
    ],
  },
} as const;

export const DISRUPTION_TYPES = [
  'heavy_rain',
  'flooding',
  'platform_outage',
  'bandh',
  'strike',
  'air_quality',
];

export const CITY_ZONES: Record<string, string[]> = {
  Mumbai: ['Andheri', 'Dadar'],
  Chennai: ['T. Nagar', 'Adyar'],
  Delhi: ['Connaught', 'Lajpat'],
  Bengaluru: ['Koramangala', 'HSR'],
  Hyderabad: ['Banjara', 'Madhapur'],
};

export const CITIES = Object.keys(CITY_ZONES);

export const STATUS_COLORS: Record<string, string> = {
  auto_approved: '#00C853',
  soft_hold: '#FFD700',
  hard_hold: '#FF3D00',
  paid: '#00C853',
  rejected: '#FF3D00',
  processing: '#FF6B00',
};

export const ERROR_CARD = {
  backgroundColor: '#1A0000',
  color: '#FF3D00',
};

export interface Language {
  code: string;
  label: string;
  nativeLabel: string;
  backendLabel: string;
}

export const LANGUAGES: Language[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', backendLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: '\u0939\u093f\u0902\u0926\u0940', backendLabel: 'Hindi' },
  { code: 'ta', label: 'Tamil', nativeLabel: '\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD', backendLabel: 'Tamil' },
  { code: 'te', label: 'Telugu', nativeLabel: '\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41', backendLabel: 'Telugu' },
  { code: 'kn', label: 'Kannada', nativeLabel: '\u0C95\u0CA8\u0CCD\u0CA8\u0CA1', backendLabel: 'Kannada' },
];

export type TranslationKey =
  | 'welcome'
  | 'selectLanguage'
  | 'partnerID'
  | 'city'
  | 'zone'
  | 'upiId'
  | 'sendOTP'
  | 'verifyOTP'
  | 'otpSent'
  | 'enterOTP'
  | 'continue'
  | 'home'
  | 'policy'
  | 'claims'
  | 'profile'
  | 'myPolicy'
  | 'claimStatus'
  | 'activePolicy'
  | 'coverageAmount'
  | 'premiumPaid'
  | 'filedOn'
  | 'status'
  | 'payoutAmount';

type Translations = Record<string, Record<TranslationKey, string>>;

export const TRANSLATIONS: Translations = {
  en: {
    welcome: 'Welcome to Zensure',
    selectLanguage: 'Select Language',
    partnerID: 'Partner ID',
    city: 'Select City',
    zone: 'Delivery Zone',
    upiId: 'UPI ID',
    sendOTP: 'Send OTP',
    verifyOTP: 'Verify & Continue',
    otpSent: 'OTP sent to',
    enterOTP: 'Enter 6-digit OTP',
    continue: 'Continue',
    home: 'Home',
    policy: 'Policy',
    claims: 'Claims',
    profile: 'Profile',
    myPolicy: 'My Policy',
    claimStatus: 'Claim Status',
    activePolicy: 'Active Policy',
    coverageAmount: 'Coverage Amount',
    premiumPaid: 'Premium Paid',
    filedOn: 'Filed On',
    status: 'Status',
    payoutAmount: 'Payout Amount',
  },
  hi: {
    welcome: '\u095B\u0947\u0928\u0936\u094D\u092F\u094B\u0930 \u092E\u0947\u0902 \u0938\u094D\u0935\u093E\u0917\u0924 \u0939\u0948',
    selectLanguage: '\u092D\u093E\u0937\u093E \u091A\u0941\u0928\u0947\u0902',
    partnerID: '\u092A\u093E\u0930\u094D\u091F\u0928\u0930 \u0906\u0908\u0921\u0940',
    city: '\u0936\u0939\u0930 \u091A\u0941\u0928\u0947\u0902',
    zone: '\u0921\u093F\u0932\u0940\u0935\u0930\u0940 \u091C\u093C\u094B\u0928',
    upiId: 'UPI \u0906\u0908\u0921\u0940',
    sendOTP: 'OTP \u092D\u0947\u091C\u0947\u0902',
    verifyOTP: '\u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0915\u0930\u0947\u0902',
    otpSent: 'OTP \u092D\u0947\u091C\u093E \u0917\u092F\u093E',
    enterOTP: '6-\u0905\u0902\u0915\u0940\u092F OTP \u0926\u0930\u094D\u091C \u0915\u0930\u0947\u0902',
    continue: '\u091C\u093E\u0930\u0940 \u0930\u0916\u0947\u0902',
    home: '\u0939\u094B\u092E',
    policy: '\u092A\u0949\u0932\u093F\u0938\u0940',
    claims: '\u0926\u093E\u0935\u0947',
    profile: '\u092A\u094D\u0930\u094B\u095E\u093E\u0907\u0932',
    myPolicy: '\u092E\u0947\u0930\u0940 \u092A\u0949\u0932\u093F\u0938\u0940',
    claimStatus: '\u0926\u093E\u0935\u0947 \u0915\u0940 \u0938\u094D\u0925\u093F\u0924\u093F',
    activePolicy: '\u0938\u0915\u094D\u0930\u093F\u092F \u092A\u0949\u0932\u093F\u0938\u0940',
    coverageAmount: '\u0915\u0935\u0930\u0947\u091C \u0930\u093E\u0936\u093F',
    premiumPaid: '\u092D\u0941\u0917\u0924\u093E\u0928 \u0915\u093F\u092F\u093E \u092A\u094D\u0930\u0940\u092E\u093F\u092F\u092E',
    filedOn: '\u0926\u0930\u094D\u091C \u0924\u093F\u0925\u093F',
    status: '\u0938\u094D\u0925\u093F\u0924\u093F',
    payoutAmount: '\u092D\u0941\u0917\u0924\u093E\u0928 \u0930\u093E\u0936\u093F',
  },
  ta: {
    welcome: '\u0B9C\u0BC6\u0BA9\u0BCD\u0BB7\u0BC2\u0BB0\u0BBF\u0BB2\u0BCD \u0BB5\u0BB0\u0BB5\u0BC7\u0BB1\u0BCD\u0B95\u0BBF\u0BB1\u0BCB\u0BAE\u0BCD',
    selectLanguage: '\u0BAE\u0BCA\u0BB4\u0BBF \u0BA4\u0BC7\u0BB0\u0BCD\u0BA8\u0BCD\u0BA4\u0BC6\u0B9F\u0BC1',
    partnerID: '\u0BAA\u0B99\u0BCD\u0B95\u0BC1\u0BA4\u0BBE\u0BB0\u0BB0\u0BCD ID',
    city: '\u0BA8\u0B95\u0BB0\u0BAE\u0BCD \u0BA4\u0BC7\u0BB0\u0BCD\u0BA8\u0BCD\u0BA4\u0BC6\u0B9F\u0BC1',
    zone: '\u0B9F\u0BC6\u0BB2\u0BBF\u0BB5\u0BB0\u0BBF \u0BAE\u0BA3\u0BCD\u0B9F\u0BB2\u0BAE\u0BCD',
    upiId: 'UPI ID',
    sendOTP: 'OTP \u0B85\u0BA9\u0BC1\u0BAA\u0BCD\u0BAA\u0BC1',
    verifyOTP: '\u0B9A\u0BB0\u0BBF\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BB5\u0BC1\u0BAE\u0BCD',
    otpSent: 'OTP \u0B85\u0BA9\u0BC1\u0BAA\u0BCD\u0BAA\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1',
    enterOTP: '6 \u0B87\u0BB2\u0B95\u0BCD\u0B95 OTP \u0B89\u0BB3\u0BCD\u0BB3\u0BBF\u0B9F\u0BB5\u0BC1\u0BAE\u0BCD',
    continue: '\u0BA4\u0BCA\u0B9F\u0BB0\u0BB5\u0BC1\u0BAE\u0BCD',
    home: '\u0BAE\u0BC1\u0B95\u0BAA\u0BCD\u0BAA\u0BC1',
    policy: '\u0BAA\u0BBE\u0BB2\u0BBF\u0B9A\u0BBF',
    claims: '\u0B95\u0BCB\u0BB0\u0BBF\u0B95\u0BCD\u0B95\u0BC8\u0B95\u0BB3\u0BCD',
    profile: '\u0B9A\u0BC1\u0BAF\u0BB5\u0BBF\u0BB5\u0BB0\u0BAE\u0BCD',
    myPolicy: '\u0B8E\u0BA9\u0BCD \u0BAA\u0BBE\u0BB2\u0BBF\u0B9A\u0BBF',
    claimStatus: '\u0B95\u0BCB\u0BB0\u0BBF\u0B95\u0BCD\u0B95\u0BC8 \u0BA8\u0BBF\u0BB2\u0BC8',
    activePolicy: '\u0B9A\u0BC6\u0BAF\u0BB2\u0BBF\u0BB2\u0BCD \u0B89\u0BB3\u0BCD\u0BB3 \u0BAA\u0BBE\u0BB2\u0BBF\u0B9A\u0BBF',
    coverageAmount: '\u0B95\u0BBE\u0BAA\u0BCD\u0BAA\u0BC0\u0B9F\u0BCD\u0B9F\u0BC1 \u0BA4\u0BCA\u0B95\u0BC8',
    premiumPaid: '\u0B9A\u0BC6\u0BB2\u0BC1\u0BA4\u0BCD\u0BA4\u0BBF\u0BAF \u0BAA\u0BBF\u0BB0\u0BC0\u0BAE\u0BBF\u0BAF\u0BAE\u0BCD',
    filedOn: '\u0BA4\u0BBE\u0B95\u0BCD\u0B95\u0BB2\u0BCD \u0B9A\u0BC6\u0BAF\u0BCD\u0BA4 \u0BA4\u0BC7\u0BA4\u0BBF',
    status: '\u0BA8\u0BBF\u0BB2\u0BC8',
    payoutAmount: '\u0B95\u0B9F\u0BCD\u0B9F\u0BA3 \u0BA4\u0BCA\u0B95\u0BC8',
  },
  te: {
    welcome: '\u0B1C\u0C46\u0B28\u0C4D\u0C38\u0C4D\u0CAF\u0C42\u0C30\u0C4D\u0C15\u0C41 \u0C38\u0C4D\u0C35\u0C3E\u0C17\u0C24\u0C02',
    selectLanguage: '\u0C2D\u0C3E\u0C37\u0C28\u0C41 \u0C0E\u0C02\u0C1A\u0C41\u0C15\u0C4B\u0C02\u0C21\u0C3F',
    partnerID: '\u0C2A\u0C3E\u0C30\u0C4D\u0C1F\u0C28\u0C30\u0C4D ID',
    city: '\u0C28\u0C17\u0C30\u0C3E\u0C28\u0C4D\u0C28\u0C3F \u0C0E\u0C02\u0C1A\u0C41\u0C15\u0C4B\u0C02\u0C21\u0C3F',
    zone: '\u0C21\u0C46\u0C32\u0C3F\u0C35\u0C30\u0C40 \u0C1C\u0C4B\u0C28\u0C4D',
    upiId: 'UPI ID',
    sendOTP: 'OTP \u0C2A\u0C02\u0C2A\u0C02\u0C21\u0C3F',
    verifyOTP: '\u0C27\u0C43\u0C35\u0C40\u0C15\u0C30\u0C3F\u0C02\u0C1A\u0C02\u0C21\u0C3F',
    otpSent: 'OTP \u0C2A\u0C02\u0C2A\u0C2C\u0C21\u0C3F\u0C02\u0C26\u0C3F',
    enterOTP: '6 \u0C05\u0C02\u0C15\u0C46\u0C32 OTP \u0C28\u0C2E\u0C4B\u0C26\u0C41 \u0C1A\u0C47\u0C2F\u0C02\u0C21\u0C3F',
    continue: '\u0C15\u0C4A\u0C28\u0C38\u0C3E\u0C17\u0C3F\u0C02\u0C1A\u0C02\u0C21\u0C3F',
    home: '\u0C39\u0C4B\u0C2E\u0C4D',
    policy: '\u0C2A\u0C3E\u0C32\u0C38\u0C40',
    claims: '\u0C15\u0C4D\u0C32\u0C46\u0C2F\u0C3F\u0C2E\u0C4D\u0C38\u0C4D',
    profile: '\u0C2A\u0C4D\u0C30\u0C4A\u0C2B\u0C48\u0C32\u0C4D',
    myPolicy: '\u0C28\u0C3E \u0C2A\u0C3E\u0C32\u0C38\u0C40',
    claimStatus: '\u0C15\u0C4D\u0C32\u0C46\u0C2F\u0C3F\u0C2E\u0C4D \u0C38\u0C4D\u0C25\u0C3F\u0C24\u0C3F',
    activePolicy: '\u0C2F\u0C3E\u0C15\u0C4D\u0C1F\u0C3F\u0C35\u0C4D \u0C2A\u0C3E\u0C32\u0C38\u0C40',
    coverageAmount: '\u0C15\u0C35\u0C30\u0C47\u0C1C\u0C4D \u0C2E\u0C4A\u0C24\u0C4D\u0C24\u0C02',
    premiumPaid: '\u0C1A\u0C46\u0C32\u0C4D\u0C32\u0C3F\u0C02\u0C1A\u0C3F\u0C28 \u0C2A\u0C4D\u0C30\u0C40\u0C2E\u0C3F\u0C2F\u0C02',
    filedOn: '\u0C26\u0C3E\u0C16\u0C32\u0C41 \u0C1A\u0C47\u0C38\u0C3F\u0C28 \u0C24\u0C47\u0C26\u0C40',
    status: '\u0C38\u0C4D\u0C25\u0C3F\u0C24\u0C3F',
    payoutAmount: '\u0C1A\u0C46\u0C32\u0C4D\u0C32\u0C3F\u0C02\u0C2A\u0C41 \u0C2E\u0C4A\u0C24\u0C4D\u0C24\u0C02',
  },
  kn: {
    welcome: '\u0C9D\u0CC6\u0CA8\u0CCD\u0CB6\u0CCD\u0CAF\u0CC2\u0CB0\u0CCD\u0C97\u0CC6 \u0CB8\u0CCD\u0CB5\u0CBE\u0C97\u0CA4',
    selectLanguage: '\u0CAD\u0CBE\u0CB7\u0CC6 \u0C86\u0CAF\u0CCD\u0C95\u0CC6 \u0CAE\u0CBE\u0CA1\u0CBF',
    partnerID: '\u0CAA\u0CBE\u0CB0\u0CCD\u0C9F\u0CCD\u0CA8\u0CB0\u0CCD ID',
    city: '\u0CA8\u0C97\u0CB0 \u0C86\u0CAF\u0CCD\u0C95\u0CC6 \u0CAE\u0CBE\u0CA1\u0CBF',
    zone: '\u0CA1\u0CC6\u0CB2\u0CBF\u0CB5\u0CB0\u0CBF \u0CB5\u0CB2\u0CAF',
    upiId: 'UPI ID',
    sendOTP: 'OTP \u0C95\u0CB3\u0CC1\u0CB9\u0CBF\u0CB8\u0CBF',
    verifyOTP: '\u0CAA\u0CB0\u0CBF\u0CB6\u0CC0\u0CB2\u0CBF\u0CB8\u0CBF',
    otpSent: 'OTP \u0C95\u0CB3\u0CC1\u0CB9\u0CBF\u0CB8\u0CB2\u0CBE\u0C97\u0CBF\u0CA6\u0CC6',
    enterOTP: '6 \u0C85\u0C82\u0C95\u0CBF OTP \u0CA8\u0CAE\u0CC2\u0CA6\u0CBF\u0CB8\u0CBF',
    continue: '\u0CAE\u0CC1\u0C82\u0CA6\u0CC1\u0CB5\u0CB0\u0CC6\u0CAF\u0CBF\u0CB0\u0CBF',
    home: '\u0CAE\u0CA8\u0CC6',
    policy: '\u0CAA\u0CBE\u0CB2\u0CBF\u0CB8\u0CBF',
    claims: '\u0C95\u0CCD\u0CB2\u0CC8\u0CAE\u0CCD\u0CB8\u0CCD',
    profile: '\u0CAA\u0CCD\u0CB0\u0CCB\u0CAB\u0CC8\u0CB2\u0CCD',
    myPolicy: '\u0CA8\u0CA8\u0CCD\u0CA8 \u0CAA\u0CBE\u0CB2\u0CBF\u0CB8\u0CBF',
    claimStatus: '\u0C95\u0CCD\u0CB2\u0CC8\u0CAE\u0CCD \u0CB8\u0CCD\u0CA5\u0CBF\u0CA4\u0CBF',
    activePolicy: '\u0CB8\u0C95\u0CCD\u0CB0\u0CBF\u0CAF \u0CAA\u0CBE\u0CB2\u0CBF\u0CB8\u0CBF',
    coverageAmount: '\u0C95\u0CB5\u0CB0\u0CC7\u0C9C\u0CCD \u0CAE\u0CCA\u0CA4\u0CCD\u0CA4',
    premiumPaid: '\u0CAA\u0CCD\u0CB0\u0CC0\u0CAE\u0CBF\u0CAF\u0C82 \u0CAA\u0CBE\u0CB5\u0CA4\u0CBF',
    filedOn: '\u0CB8\u0CB2\u0CCD\u0CB2\u0CBF\u0CB8\u0CBF\u0CA6 \u0CA6\u0CBF\u0CA8\u0CBE\u0C82\u0C95',
    status: '\u0CB8\u0CCD\u0CA5\u0CBF\u0CA4\u0CBF',
    payoutAmount: '\u0CAA\u0CBE\u0CB5\u0CA4\u0CBF \u0CAE\u0CCA\u0CA4\u0CCD\u0CA4',
  },
};

export function t(lang: string, key: TranslationKey): string {
  return TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.en[key];
}
