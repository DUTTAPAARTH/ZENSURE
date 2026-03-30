const express = require('express');
const auth = require('../middleware/auth');
const supabase = require('../db/supabase');
const { getWeekWindow } = require('../utils/constants');

const router = express.Router();

router.get('/profile', auth, async (req, res, next) => {
  try {
    const { weekStart, weekEnd } = getWeekWindow();
    const today = new Date().toISOString().slice(0, 10);

    const [policyResult, claimResult] = await Promise.all([
      supabase
        .from('policies')
        .select('*')
        .eq('worker_id', req.worker.id)
        .eq('status', 'active')
        .lte('week_start', today)
        .gte('week_end', today)
        .order('created_at', { ascending: false })
        .limit(1),
      supabase
        .from('claims')
        .select('payout_amount, status, created_at')
        .eq('worker_id', req.worker.id)
        .gte('created_at', weekStart.toISOString())
        .lte('created_at', weekEnd.toISOString()),
    ]);

    if (policyResult.error) {
      throw policyResult.error;
    }

    if (claimResult.error) {
      throw claimResult.error;
    }

    const weekClaims = claimResult.data || [];
    const claimSummary = {
      total_claims: weekClaims.length,
      total_payout: weekClaims.reduce((sum, claim) => sum + Number(claim.payout_amount || 0), 0),
      approved_claims: weekClaims.filter(claim => ['auto_approved', 'paid'].includes(claim.status)).length,
    };

    return res.json({
      success: true,
      data: {
        worker: req.worker,
        active_policy: policyResult.data?.[0] || null,
        week_claim_summary: claimSummary,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.put('/profile', auth, async (req, res, next) => {
  try {
    const { language, zone, upi_id } = req.body;
    const updates = {};

    if (language !== undefined) {
      updates.language = language;
    }

    if (zone !== undefined) {
      updates.zone = zone;
    }

    if (upi_id !== undefined) {
      updates.upi_id = upi_id;
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({
        success: false,
        error: 'At least one of language, zone, upi_id must be provided',
      });
    }

    const { data: worker, error } = await supabase
      .from('workers')
      .update(updates)
      .eq('id', req.worker.id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    console.log(`Workers: updated profile ${req.worker.id}`);

    return res.json({
      success: true,
      data: {
        worker,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
