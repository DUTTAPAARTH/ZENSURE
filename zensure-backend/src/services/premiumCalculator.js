const {
  PLAN_CONFIG,
  SEASONAL_FACTOR,
  ZONE_RISK_SCORES,
  getRiskLabel,
  getSeasonLabel,
  normalizeZoneKey,
} = require('../utils/constants');

// Calculates a weekly premium using hardcoded zone risk and seasonal multipliers.
function calculatePremium(city, zone, planId) {
  const normalizedPlanId = String(planId || '').toLowerCase();
  const plan = PLAN_CONFIG[normalizedPlanId];

  if (!plan) {
    throw new Error('Invalid plan_id supplied');
  }

  const currentMonth = new Date().getMonth() + 1;
  const normalizedKey = normalizeZoneKey(city, zone);
  const zoneRiskScore = ZONE_RISK_SCORES[normalizedKey] || 0.5;
  const seasonalFactor = SEASONAL_FACTOR[currentMonth] || 1.0;
  const adjustedPrice =
    plan.base_price * (1 + (zoneRiskScore - 0.5) * 0.4) * seasonalFactor;

  return {
    ...plan,
    adjusted_price: Math.round(adjustedPrice),
    zone_risk_score: Number(zoneRiskScore.toFixed(3)),
    zone_risk_label: getRiskLabel(zoneRiskScore),
    season: getSeasonLabel(currentMonth),
    seasonal_factor: seasonalFactor,
  };
}

module.exports = {
  calculatePremium,
};
