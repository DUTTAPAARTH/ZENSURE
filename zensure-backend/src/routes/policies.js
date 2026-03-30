const express = require('express');
const auth = require('../middleware/auth');
const supabase = require('../db/supabase');
const { calculatePremium } = require('../services/premiumCalculator');
const { PLAN_CONFIG, getRiskLabel, getSeasonLabel, getWeekWindow } = require('../utils/constants');

const router = express.Router();

router.get('/plans', async (req, res, next) => {
  try {
    const { city, zone } = req.query;

    if (!city || !zone) {
      return res.status(400).json({
        success: false,
        error: 'city and zone query parameters are required',
      });
    }

    const plans = Object.keys(PLAN_CONFIG).map(planId => calculatePremium(city, zone, planId));
    const zoneRiskScore = plans[0].zone_risk_score;
    const currentMonth = new Date().getMonth() + 1;

    return res.json({
      success: true,
      data: {
        plans: plans.map(plan => ({
          id: plan.id,
          name: plan.name,
          base_price: plan.base_price,
          adjusted_price: plan.adjusted_price,
          coverage_percent: plan.coverage_percent,
          max_payout: plan.max_payout,
          zone_risk_score: plan.zone_risk_score,
          features: plan.features,
        })),
        zone_risk: {
          score: zoneRiskScore,
          label: getRiskLabel(zoneRiskScore),
          season: getSeasonLabel(currentMonth),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/activate', auth, async (req, res, next) => {
  try {
    const { plan_id, city, zone } = req.body;

    if (!plan_id || !city || !zone) {
      return res.status(400).json({
        success: false,
        error: 'plan_id, city and zone are required',
      });
    }

    const { weekStart, weekEnd } = getWeekWindow();
    const weekStartDate = weekStart.toISOString().slice(0, 10);
    const weekEndDate = weekEnd.toISOString().slice(0, 10);

    const { data: existingPolicy, error: existingError } = await supabase
      .from('policies')
      .select('id')
      .eq('worker_id', req.worker.id)
      .eq('status', 'active')
      .eq('week_start', weekStartDate)
      .eq('week_end', weekEndDate);

    if (existingError) {
      throw existingError;
    }

    if (existingPolicy.length) {
      return res.status(409).json({
        success: false,
        error: 'Active policy already exists for this week',
      });
    }

    const premiumDetails = calculatePremium(city, zone, plan_id);
    const { data: policy, error: insertError } = await supabase
      .from('policies')
      .insert({
        worker_id: req.worker.id,
        plan: premiumDetails.id,
        premium_amount: premiumDetails.adjusted_price,
        coverage_percent: premiumDetails.coverage_percent,
        max_payout: premiumDetails.max_payout,
        week_start: weekStartDate,
        week_end: weekEndDate,
        status: 'active',
        zone_risk_score: premiumDetails.zone_risk_score,
      })
      .select('*')
      .single();

    if (insertError) {
      throw insertError;
    }

    console.log(`Policies: activated ${plan_id} for worker ${req.worker.id}`);

    return res.status(201).json({
      success: true,
      data: {
        policy,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/active', auth, async (req, res, next) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from('policies')
      .select('*')
      .eq('worker_id', req.worker.id)
      .eq('status', 'active')
      .lte('week_start', today)
      .gte('week_end', today)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      data: data?.[0] || null,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
