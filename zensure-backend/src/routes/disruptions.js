const express = require('express');
const supabase = require('../db/supabase');
const { detectFraud } = require('../services/fraudDetector');

const router = express.Router();

router.get('/active', async (req, res, next) => {
  try {
    const { city, zone } = req.query;

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    let query = supabase
      .from('disruption_events')
      .select('*')
      .gte('triggered_at', since)
      .order('triggered_at', { ascending: false });

    if (city) {
      query = query.eq('city', city);
    }

    if (zone) {
      query = query.eq('zone', zone);
    }

    const { data: disruptions, error } = await query;

    if (error) {
      throw error;
    }

    const maxSeverity = (disruptions || []).reduce(
      (max, item) => Math.max(max, Number(item.severity || 0)),
      0
    );
    let zoneStatus = 'green';

    if (maxSeverity >= 0.75) {
      zoneStatus = 'red';
    } else if (maxSeverity >= 0.4) {
      zoneStatus = 'amber';
    }

    return res.json({
      success: true,
      data: {
        disruptions: disruptions || [],
        zone_status: zoneStatus,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/simulate', async (req, res, next) => {
  try {
    const { event_type, city, zone, severity } = req.body;

    if (!event_type || !city || !zone || severity === undefined) {
      return res.status(400).json({
        success: false,
        error: 'event_type, city, zone and severity are required',
      });
    }

    const normalizedSeverity = Number(severity) > 1 ? Number(severity) / 100 : Number(severity);
    const { data: event, error: eventError } = await supabase
      .from('disruption_events')
      .insert({
        event_type,
        city,
        zone,
        severity: normalizedSeverity,
        data_source: 'manual_demo',
        raw_data: {
          source: 'simulate_endpoint',
          simulated_at: new Date().toISOString(),
        },
      })
      .select('*')
      .single();

    if (eventError) {
      throw eventError;
    }

    const { data: workers, error: workerError } = await supabase
      .from('workers')
      .select('id, upi_id')
      .eq('city', city)
      .eq('zone', zone)
      .eq('status', 'active');

    if (workerError) {
      throw workerError;
    }

    const workerIds = (workers || []).map(worker => worker.id);
    const today = new Date().toISOString().slice(0, 10);
    let policies = [];

    if (workerIds.length) {
      const policyResult = await supabase
        .from('policies')
        .select('*')
        .eq('status', 'active')
        .in('worker_id', workerIds)
        .lte('week_start', today)
        .gte('week_end', today);

      if (policyResult.error) {
        throw policyResult.error;
      }

      policies = policyResult.data || [];
    }

    let claimsCreated = 0;
    let autoApproved = 0;
    let held = 0;

    for (const policy of policies) {
      const gpsDelta = Math.floor(Math.random() * 650);
      const platformActive = Math.random() > 0.86;
      const ringScore = Number((Math.random() * 0.55).toFixed(3));
      const fraudResult = detectFraud({
        gps_delta: gpsDelta,
        motion_variance: Math.random(),
        platform_active: platformActive,
        claim_velocity: Math.floor(Math.random() * 20),
        is_new_policy: Math.random() > 0.7,
      });

      const payoutAmount =
        fraudResult.status === 'auto_approved'
          ? Number((Number(policy.max_payout) * normalizedSeverity).toFixed(2))
          : null;

      const { error: claimError } = await supabase.from('claims').insert({
        worker_id: policy.worker_id,
        policy_id: policy.id,
        event_id: event.id,
        payout_amount: payoutAmount,
        fraud_score: fraudResult.fraud_score,
        ring_score: ringScore,
        status: fraudResult.status,
        gps_delta: gpsDelta,
        platform_activity_flag: platformActive,
      });

      if (claimError) {
        throw claimError;
      }

      claimsCreated += 1;
      if (fraudResult.status === 'auto_approved') {
        autoApproved += 1;
      } else {
        held += 1;
      }
    }

    console.log(`Disruptions: simulated ${event_type} for ${city}/${zone}`);

    return res.status(201).json({
      success: true,
      data: {
        event_id: event.id,
        claims_created: claimsCreated,
        auto_approved: autoApproved,
        held,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
