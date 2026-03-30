// Scores claim fraud risk using simple hackathon heuristics.
function detectFraud(claimData = {}) {
  const {
    gps_delta = 0,
    motion_variance = 0.5,
    platform_active = false,
    claim_velocity = 0,
    is_new_policy = false,
  } = claimData;

  if (platform_active === true) {
    return {
      fraud_score: 0.95,
      status: 'hard_hold',
      signals_fired: ['platform_active'],
    };
  }

  let score = 0;
  const signalsFired = [];

  if (gps_delta > 500) {
    score += 0.35;
    signalsFired.push('high_gps_delta');
  }

  if (motion_variance < 0.05) {
    score += 0.25;
    signalsFired.push('low_motion_variance');
  }

  if (claim_velocity > 15) {
    score += 0.2;
    signalsFired.push('high_claim_velocity');
  }

  if (is_new_policy) {
    score += 0.1;
    signalsFired.push('new_policy');
  }

  const fraudScore = Math.min(1, Number(score.toFixed(3)));
  let status = 'auto_approved';

  if (fraudScore >= 0.75) {
    status = 'hard_hold';
  } else if (fraudScore >= 0.35) {
    status = 'soft_hold';
  }

  return {
    fraud_score: fraudScore,
    status,
    signals_fired: signalsFired,
  };
}

module.exports = {
  detectFraud,
};
