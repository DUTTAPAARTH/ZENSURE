// ============================================================
// ZENSURE — App Constants
// ============================================================

export const ZENSURE_COLORS = {
  bg: '#0D0D0D',
  surface: '#1A1A1A',
  surfaceElevated: '#242424',
  border: '#2A2A2A',
  primary: '#FF6B00',
  primaryDim: 'rgba(255, 107, 0, 0.15)',
  white: '#FFFFFF',
  textSecondary: '#A0A0A0',
  success: '#22C55E',
  successDim: 'rgba(34, 197, 94, 0.15)',
  warning: '#F59E0B',
  warningDim: 'rgba(245, 158, 11, 0.15)',
  error: '#EF4444',
  errorDim: 'rgba(239, 68, 68, 0.15)',
  zomato: '#E23744',
  swiggy: '#FC8019',
};

export interface Language {
  code: string;
  label: string;
  nativeLabel: string;
}

export const LANGUAGES: Language[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ' },
];

export const CITIES = [
  'Mumbai',
  'Chennai',
  'Bengaluru',
  'Hyderabad',
  'Delhi-NCR',
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
    welcome: 'ज़ेनश्योर में स्वागत है',
    selectLanguage: 'भाषा चुनें',
    partnerID: 'पार्टनर आईडी',
    city: 'शहर चुनें',
    zone: 'डिलीवरी ज़ोन',
    upiId: 'UPI आईडी',
    sendOTP: 'OTP भेजें',
    verifyOTP: 'सत्यापित करें',
    otpSent: 'OTP भेजा गया',
    enterOTP: '6-अंकीय OTP दर्ज करें',
    continue: 'जारी रखें',
    home: 'होम',
    policy: 'पॉलिसी',
    claims: 'दावे',
    profile: 'प्रोफ़ाइल',
    myPolicy: 'मेरी पॉलिसी',
    claimStatus: 'दावे की स्थिति',
    activePolicy: 'सक्रिय पॉलिसी',
    coverageAmount: 'कवरेज राशि',
    premiumPaid: 'भुगतान किया प्रीमियम',
    filedOn: 'दर्ज तिथि',
    status: 'स्थिति',
    payoutAmount: 'भुगतान राशि',
  },
  ta: {
    welcome: 'ஜென்ஷூரில் வரவேற்கிறோம்',
    selectLanguage: 'மொழி தேர்ந்தெடு',
    partnerID: 'பங்குதாரர் ID',
    city: 'நகரம் தேர்ந்தெடு',
    zone: 'டெலிவரி மண்டலம்',
    upiId: 'UPI ID',
    sendOTP: 'OTP அனுப்பு',
    verifyOTP: 'சரிபார்க்கவும்',
    otpSent: 'OTP அனுப்பப்பட்டது',
    enterOTP: '6 இலக்க OTP உள்ளிடவும்',
    continue: 'தொடரவும்',
    home: 'முகப்பு',
    policy: 'பாலிசி',
    claims: 'கோரிக்கைகள்',
    profile: 'சுயவிவரம்',
    myPolicy: 'என் பாலிசி',
    claimStatus: 'கோரிக்கை நிலை',
    activePolicy: 'செயலில் உள்ள பாலிசி',
    coverageAmount: 'காப்பீட்டு தொகை',
    premiumPaid: 'செலுத்திய பிரீமியம்',
    filedOn: 'தாக்கல் செய்த தேதி',
    status: 'நிலை',
    payoutAmount: 'கட்டண தொகை',
  },
  te: {
    welcome: 'జెన్స్యూర్‌కు స్వాగతం',
    selectLanguage: 'భాషను ఎంచుకోండి',
    partnerID: 'పార్టనర్ ID',
    city: 'నగరాన్ని ఎంచుకోండి',
    zone: 'డెలివరీ జోన్',
    upiId: 'UPI ID',
    sendOTP: 'OTP పంపండి',
    verifyOTP: 'ధృవీకరించండి',
    otpSent: 'OTP పంపబడింది',
    enterOTP: '6 అంకెల OTP నమోదు చేయండి',
    continue: 'కొనసాగించండి',
    home: 'హోమ్',
    policy: 'పాలసీ',
    claims: 'క్లెయిమ్స్',
    profile: 'ప్రొఫైల్',
    myPolicy: 'నా పాలసీ',
    claimStatus: 'క్లెయిమ్ స్థితి',
    activePolicy: 'యాక్టివ్ పాలసీ',
    coverageAmount: 'కవరేజ్ మొత్తం',
    premiumPaid: 'చెల్లించిన ప్రీమియం',
    filedOn: 'దాఖలు చేసిన తేదీ',
    status: 'స్థితి',
    payoutAmount: 'చెల్లింపు మొత్తం',
  },
  kn: {
    welcome: 'ಝೆನ್‌ಶ್ಯೂರ್‌ಗೆ ಸ್ವಾಗತ',
    selectLanguage: 'ಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ',
    partnerID: 'ಪಾರ್ಟ್ನರ್ ID',
    city: 'ನಗರ ಆಯ್ಕೆ ಮಾಡಿ',
    zone: 'ಡೆಲಿವರಿ ವಲಯ',
    upiId: 'UPI ID',
    sendOTP: 'OTP ಕಳುಹಿಸಿ',
    verifyOTP: 'ಪರಿಶೀಲಿಸಿ',
    otpSent: 'OTP ಕಳುಹಿಸಲಾಗಿದೆ',
    enterOTP: '6 ಅಂಕಿ OTP ನಮೂದಿಸಿ',
    continue: 'ಮುಂದುವರೆಯಿರಿ',
    home: 'ಮನೆ',
    policy: 'ಪಾಲಿಸಿ',
    claims: 'ಕ್ಲೈಮ್ಸ್',
    profile: 'ಪ್ರೊಫೈಲ್',
    myPolicy: 'ನನ್ನ ಪಾಲಿಸಿ',
    claimStatus: 'ಕ್ಲೈಮ್ ಸ್ಥಿತಿ',
    activePolicy: 'ಸಕ್ರಿಯ ಪಾಲಿಸಿ',
    coverageAmount: 'ಕವರೇಜ್ ಮೊತ್ತ',
    premiumPaid: 'ಪ್ರೀಮಿಯಂ ಪಾವತಿ',
    filedOn: 'ಸಲ್ಲಿಸಿದ ದಿನಾಂಕ',
    status: 'ಸ್ಥಿತಿ',
    payoutAmount: 'ಪಾವತಿ ಮೊತ್ತ',
  },
};

export function t(lang: string, key: TranslationKey): string {
  return TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS['en'][key];
}

export const STORAGE_KEYS = {
  LANGUAGE: 'zensure_language',
  PARTNER_DATA: 'zensure_partner_data',
  AUTH_TOKEN: 'zensure_auth_token',
};
