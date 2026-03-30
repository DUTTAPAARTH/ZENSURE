const express = require('express');
const auth = require('../middleware/auth');
const supabase = require('../db/supabase');
const { processPayout } = require('../services/payoutEngine');

const router = express.Router();

function buildTimeline(claim) {
  return [
    {
      step: 'claim_created',
      label: 'Claim created',
      status: 'completed',
      at: claim.created_at,
    },
    {
      step: 'fraud_screening',
      label: 'Fraud screening completed',
      status: 'completed',
      at: claim.created_at,
    },
    {
      step: 'payout_status',
      label: claim.status === 'paid' ? 'Payout settled' : 'Payout pending',
      status: claim.status === 'paid' ? 'completed' : 'pending',
      at: claim.status === 'paid' ? new Date().toISOString() : null,
    },
  ];
}

function mergeClaimsWithEvents(claims, events) {
  const eventMap = new Map((events || []).map(event => [event.id, event]));
  return claims.map(claim => {
    const event = eventMap.get(claim.event_id) || {};
    return {
      ...claim,
      event_type: event.event_type || null,
      city: event.city || null,
      zone: event.zone || null,
      severity: event.severity || null,
      triggered_at: event.triggered_at || null,
    };
  });
}

router.get('/', auth, async (req, res, next) => {
  try {
    const { data: claims, error: claimsError } = await supabase
      .from('claims')
      .select('*')
      .eq('worker_id', req.worker.id)
      .order('created_at', { ascending: false });

    if (claimsError) {
      throw claimsError;
    }

    const eventIds = [...new Set((claims || []).map(claim => claim.event_id).filter(Boolean))];
    let events = [];

    if (eventIds.length) {
      const { data, error } = await supabase
        .from('disruption_events')
        .select('id, event_type, city, zone, severity, triggered_at')
        .in('id', eventIds);

      if (error) {
        throw error;
      }

      events = data || [];
    }

    return res.json({
      success: true,
      data: {
        claims: mergeClaimsWithEvents(claims || [], events),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', auth, async (req, res, next) => {
  try {
    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .select('*')
      .eq('id', req.params.id)
      .eq('worker_id', req.worker.id)
      .maybeSingle();

    if (claimError) {
      throw claimError;
    }

    if (!claim) {
      return res.status(404).json({
        success: false,
        error: 'Claim not found',
      });
    }

    const [eventResult, policyResult] = await Promise.all([
      claim.event_id
        ? supabase
            .from('disruption_events')
            .select('event_type, city, zone, severity, triggered_at')
            .eq('id', claim.event_id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      claim.policy_id
        ? supabase.from('policies').select('plan').eq('id', claim.policy_id).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

    if (eventResult.error) {
      throw eventResult.error;
    }

    if (policyResult.error) {
      throw policyResult.error;
    }

    const claimDetails = {
      ...claim,
      ...(eventResult.data || {}),
      ...(policyResult.data || {}),
    };

    return res.json({
      success: true,
      data: {
        claim: claimDetails,
        timeline: buildTimeline(claimDetails),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/softhold/respond', auth, async (req, res, next) => {
  try {
    const { action, location } = req.body;

    if (!['repingLocation', 'uploadPhoto'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid soft hold action',
      });
    }

    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .select('*')
      .eq('id', req.params.id)
      .eq('worker_id', req.worker.id)
      .maybeSingle();

    if (claimError) {
      throw claimError;
    }

    if (!claim) {
      return res.status(404).json({
        success: false,
        error: 'Claim not found',
      });
    }

    const { data: policy, error: policyError } = await supabase
      .from('policies')
      .select('coverage_percent, max_payout')
      .eq('id', claim.policy_id)
      .maybeSingle();

    if (policyError) {
      throw policyError;
    }

    if (claim.status !== 'soft_hold') {
      return res.status(400).json({
        success: false,
        error: 'Claim is not in soft_hold state',
      });
    }

    const payoutAmount = Number((Number(policy?.max_payout || 0) * 0.7).toFixed(2));
    const gpsDelta =
      location && typeof location.lat === 'number' && typeof location.lng === 'number'
        ? 50
        : claim.gps_delta;

    const { error: updateError } = await supabase
      .from('claims')
      .update({
        payout_amount: payoutAmount,
        status: 'auto_approved',
        gps_delta: gpsDelta ?? claim.gps_delta,
      })
      .eq('id', claim.id);

    if (updateError) {
      throw updateError;
    }

    const payoutResult = await processPayout(claim.id, req.worker.id, payoutAmount, req.worker.upi_id);

    console.log(`Claims: soft hold resolved for ${claim.id} via ${action}`);

    return res.json({
      success: true,
      data: {
        payout_amount: payoutAmount,
        status: 'paid',
        payout: payoutResult,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
