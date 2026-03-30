const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: false,
  },
});

redisClient.connect().catch(error => {
  console.log('Redis unavailable, continuing in DB-only mode:', error.message || 'connection refused');
});

const PLAN_CONFIG = {
  basic: {
    id: 'basic',
    name: 'Basic Shield',
    base_price: 29,
    coverage_percent: 50,
    max_payout: 1500,
    features: [
      '50% income replacement',
      'Up to Rs 1,500 weekly payout',
      'Weather and outage disruption cover',
      'Instant UPI settlement on approval',
    ],
  },
  standard: {
    id: 'standard',
    name: 'Standard Shield',
    base_price: 49,
    coverage_percent: 70,
    max_payout: 2500,
    features: [
      '70% income replacement',
      'Up to Rs 2,500 weekly payout',
      'Priority auto-approval rules',
      'Instant UPI settlement on approval',
    ],
  },
  full: {
    id: 'full',
    name: 'Full Shield',
    base_price: 79,
    coverage_percent: 90,
    max_payout: 4000,
    features: [
      '90% income replacement',
      'Up to Rs 4,000 weekly payout',
      'Best fraud hold recovery terms',
      'Instant UPI settlement on approval',
    ],
  },
};

const ZONE_RISK_SCORES = {
  'Mumbai-Andheri': 0.82,
  'Mumbai-Dadar': 0.71,
  'Chennai-TNagar': 0.78,
  'Chennai-Adyar': 0.65,
  'Delhi-Connaught': 0.88,
  'Delhi-Lajpat': 0.74,
  'Bengaluru-Koramangala': 0.61,
  'Bengaluru-HSR': 0.58,
  'Hyderabad-Banjara': 0.55,
  'Hyderabad-Madhapur': 0.52,
};

const SEASONAL_FACTOR = {
  1: 1.0,
  2: 1.0,
  3: 1.1,
  4: 1.1,
  5: 1.2,
  6: 1.3,
  7: 1.4,
  8: 1.4,
  9: 1.3,
  10: 1.1,
  11: 1.0,
  12: 1.0,
};

function normalizeZoneKey(city = '', zone = '') {
  const compactZone = String(zone).replace(/[\s.]+/g, '').trim();
  return `${String(city).trim()}-${compactZone}`;
}

function getRiskLabel(score) {
  if (score >= 0.8) return 'VERY HIGH';
  if (score >= 0.7) return 'HIGH';
  if (score >= 0.6) return 'MEDIUM';
  return 'LOW';
}

function getSeasonLabel(month) {
  if ([6, 7, 8, 9].includes(month)) return 'Monsoon';
  if ([3, 4, 5].includes(month)) return 'Summer';
  if ([10, 11].includes(month)) return 'Festive';
  return 'Normal';
}

function getWeekWindow(referenceDate = new Date()) {
  const baseDate = new Date(referenceDate);
  const day = baseDate.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(baseDate);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(baseDate.getDate() + mondayOffset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    weekStart: monday,
    weekEnd: sunday,
  };
}

module.exports = {
  redisClient,
  PLAN_CONFIG,
  ZONE_RISK_SCORES,
  SEASONAL_FACTOR,
  normalizeZoneKey,
  getRiskLabel,
  getSeasonLabel,
  getWeekWindow,
};
