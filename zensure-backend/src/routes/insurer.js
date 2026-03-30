const express = require('express');
const supabase = require('../db/supabase');
const { getWeekWindow } = require('../utils/constants');

const router = express.Router();

function inferFraudSignals(claim) {
  const signals = [];

  if (Number(claim.fraud_score) >= 0.75) {
    signals.push('high_fraud_score');
  }
  if (Number(claim.ring_score) >= 0.3) {
    signals.push('elevated_ring_score');
  }
  if (claim.platform_activity_flag) {
    signals.push('platform_activity_flag');
  }
  if (Number(claim.gps_delta) > 500) {
    signals.push('high_gps_delta');
  }

  return signals;
}

router.get('/dashboard', async (req, res, next) => {
  try {
    const { weekStart, weekEnd } = getWeekWindow();
    const weekStartDate = weekStart.toISOString().slice(0, 10);
    const weekStartTs = weekStart.toISOString();
    const weekEndTs = weekEnd.toISOString();

    const [activePoliciesResult, policiesResult, claimsResult, payoutsResult] = await Promise.all([
      supabase
        .from('policies')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active')
        .eq('week_start', weekStartDate),
      supabase.from('policies').select('premium_amount').eq('week_start', weekStartDate),
      supabase.from('claims').select('status, payout_amount, created_at').gte('created_at', weekStartTs).lte('created_at', weekEndTs),
      supabase.from('payouts').select('amount, paid_at').gte('paid_at', weekStartTs).lte('paid_at', weekEndTs),
    ]);

    for (const result of [activePoliciesResult, policiesResult, claimsResult, payoutsResult]) {
      if (result.error) {
        throw result.error;
      }
    }

    const premiums = (policiesResult.data || []).reduce(
      (sum, policy) => sum + Number(policy.premium_amount || 0),
      0
    );
    const payouts = (payoutsResult.data || []).reduce(
      (sum, payout) => sum + Number(payout.amount || 0),
      0
    );
    const totalClaims = (claimsResult.data || []).length;
    const autoApprovedCount = (claimsResult.data || []).filter(claim =>
      ['auto_approved', 'paid'].includes(claim.status)
    ).length;
    const heldCount = (claimsResult.data || []).filter(claim =>
      ['soft_hold', 'hard_hold'].includes(claim.status)
    ).length;

    return res.json({
      success: true,
      data: {
        active_policies: Number(activePoliciesResult.count || 0),
        claims_this_week: totalClaims,
        total_premiums_collected: premiums,
        total_payouts_this_week: payouts,
        loss_ratio: premiums > 0 ? Number((payouts / premiums).toFixed(3)) : 0,
        liquidity_pool: Number((premiums - payouts).toFixed(2)),
        auto_approval_rate: totalClaims > 0 ? Number((autoApprovedCount / totalClaims).toFixed(3)) : 0,
        fraud_hold_rate: totalClaims > 0 ? Number((heldCount / totalClaims).toFixed(3)) : 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/claims', async (req, res, next) => {
  try {
    const { status, city, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    let workerIds = null;

    if (city) {
      const workerResult = await supabase.from('workers').select('id').eq('city', city);

      if (workerResult.error) {
        throw workerResult.error;
      }

      workerIds = (workerResult.data || []).map(worker => worker.id);

      if (!workerIds.length) {
        return res.json({
          success: true,
          data: {
            page: Number(page),
            limit: Number(limit),
            claims: [],
          },
        });
      }
    }

    let query = supabase
      .from('claims')
      .select('id, worker_id, status, payout_amount, fraud_score, ring_score, created_at')
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (workerIds) {
      query = query.in('worker_id', workerIds);
    }

    const { data: claims, error: claimsError } = await query;

    if (claimsError) {
      throw claimsError;
    }

    const resultWorkerIds = [...new Set((claims || []).map(claim => claim.worker_id))];
    const eventIds = [...new Set((claims || []).map(claim => claim.event_id).filter(Boolean))];
    let workers = [];
    let events = [];

    if (resultWorkerIds.length) {
      const workerResult = await supabase
        .from('workers')
        .select('id, name, zone, city, partner_id')
        .in('id', resultWorkerIds);

      if (workerResult.error) {
        throw workerResult.error;
      }

      workers = workerResult.data || [];
    }

    if (eventIds.length) {
      const eventResult = await supabase
        .from('disruption_events')
        .select('id, event_type')
        .in('id', eventIds);

      if (eventResult.error) {
        throw eventResult.error;
      }

      events = eventResult.data || [];
    }

    const workerMap = new Map(workers.map(worker => [worker.id, worker]));
    const eventMap = new Map(events.map(event => [event.id, event]));
    const formattedClaims = (claims || []).map(claim => {
      const worker = workerMap.get(claim.worker_id) || {};
      const event = eventMap.get(claim.event_id) || {};
      return {
        id: claim.id,
        event_id: claim.event_id,
        event_type: event.event_type || null,
        partner_id: worker.partner_id || null,
        status: claim.status,
        payout_amount: claim.payout_amount,
        fraud_score: claim.fraud_score,
        ring_score: claim.ring_score,
        created_at: claim.created_at,
        worker_name: worker.name || null,
        zone: worker.zone || null,
        city: worker.city || null,
      };
    });

    return res.json({
      success: true,
      data: {
        page: Number(page),
        limit: Number(limit),
        claims: formattedClaims,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/fraud/flagged', async (req, res, next) => {
  try {
    const { data: claims, error: claimsError } = await supabase
      .from('claims')
      .select('*')
      .in('status', ['soft_hold', 'hard_hold'])
      .order('created_at', { ascending: false });

    if (claimsError) {
      throw claimsError;
    }

    const workerIds = [...new Set((claims || []).map(claim => claim.worker_id))];
    let workers = [];

    if (workerIds.length) {
      const workerResult = await supabase
        .from('workers')
        .select('id, name, city, zone')
        .in('id', workerIds);

      if (workerResult.error) {
        throw workerResult.error;
      }

      workers = workerResult.data || [];
    }

    const workerMap = new Map(workers.map(worker => [worker.id, worker]));

    return res.json({
      success: true,
      data: {
        claims: (claims || []).map(claim => {
          const worker = workerMap.get(claim.worker_id) || {};
          const enrichedClaim = {
            ...claim,
            worker_name: worker.name || null,
            city: worker.city || null,
            zone: worker.zone || null,
          };

          return {
            ...enrichedClaim,
            fraud_signals: inferFraudSignals(enrichedClaim),
          };
        }),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/claims/:id/review', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { decision, reason } = req.body;

    if (!['approve', 'reject'].includes(decision)) {
      return res.status(400).json({
        success: false,
        error: 'decision must be approve or reject',
      });
    }

    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .select('*')
      .eq('id', id)
      .single();

    if (claimError) {
      throw claimError;
    }

    if (!claim) {
      return res.status(404).json({
        success: false,
        error: 'Claim not found',
      });
    }

    if (decision === 'approve') {
      const { error: updateClaimError } = await supabase
        .from('claims')
        .update({
          status: 'paid',
          payout_amount: claim.payout_amount || 0,
        })
        .eq('id', id);

      if (updateClaimError) {
        throw updateClaimError;
      }

      const { data: worker, error: workerError } = await supabase
        .from('workers')
        .select('upi_id')
        .eq('id', claim.worker_id)
        .single();

      if (workerError) {
        throw workerError;
      }

      const { data: existingPayout, error: payoutLookupError } = await supabase
        .from('payouts')
        .select('id')
        .eq('claim_id', id)
        .maybeSingle();

      if (payoutLookupError) {
        throw payoutLookupError;
      }

      if (existingPayout?.id) {
        const { error: payoutUpdateError } = await supabase
          .from('payouts')
          .update({
            amount: claim.payout_amount || 0,
            upi_id: worker.upi_id,
            status: 'paid',
            paid_at: new Date().toISOString(),
          })
          .eq('id', existingPayout.id);

        if (payoutUpdateError) {
          throw payoutUpdateError;
        }
      } else {
        const { error: payoutInsertError } = await supabase.from('payouts').insert({
          claim_id: id,
          worker_id: claim.worker_id,
          amount: claim.payout_amount || 0,
          upi_id: worker.upi_id,
          status: 'paid',
          paid_at: new Date().toISOString(),
        });

        if (payoutInsertError) {
          throw payoutInsertError;
        }
      }

      return res.json({
        success: true,
        data: {
          id,
          status: 'paid',
        },
      });
    }

    const { error: rejectError } = await supabase
      .from('claims')
      .update({
        status: 'rejected',
      })
      .eq('id', id);

    if (rejectError) {
      throw rejectError;
    }

    return res.json({
      success: true,
      data: {
        id,
        status: 'rejected',
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
