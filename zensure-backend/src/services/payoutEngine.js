const { v4: uuidv4 } = require('uuid');
const supabase = require('../db/supabase');

// Simulates a payout provider, inserts payout state, and marks the claim as paid.
async function processPayout(claimId, workerId, amount, upiId) {
  console.log(`Payout engine: processing payout for claim ${claimId}`);

  const { data: payout, error: insertError } = await supabase
    .from('payouts')
    .insert({
      claim_id: claimId,
      worker_id: workerId,
      amount,
      upi_id: upiId,
      status: 'pending',
    })
    .select('*')
    .single();

  if (insertError) {
    throw insertError;
  }

  await new Promise(resolve => setTimeout(resolve, 2000));

  const razorpayRef = `RZP_${uuidv4().replace(/-/g, '').slice(0, 18).toUpperCase()}`;
  const paidAt = new Date().toISOString();

  const { error: payoutUpdateError } = await supabase
    .from('payouts')
    .update({
      razorpay_ref: razorpayRef,
      status: 'paid',
      paid_at: paidAt,
    })
    .eq('id', payout.id);

  if (payoutUpdateError) {
    throw payoutUpdateError;
  }

  const { error: claimUpdateError } = await supabase
    .from('claims')
    .update({
      status: 'paid',
    })
    .eq('id', claimId);

  if (claimUpdateError) {
    throw claimUpdateError;
  }

  console.log(`Payout engine: paid ${amount} to ${upiId} (${razorpayRef})`);

  return {
    success: true,
    razorpay_ref: razorpayRef,
    paid_at: paidAt,
  };
}

module.exports = {
  processPayout,
};
