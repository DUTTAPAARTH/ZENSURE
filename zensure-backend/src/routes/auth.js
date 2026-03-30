const express = require('express');
const jwt = require('jsonwebtoken');
const supabase = require('../db/supabase');

const router = express.Router();

function formatLocalTimestamp(date) {
  const pad = value => String(value).padStart(2, '0');
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-') + ' ' + [
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join(':');
}

router.post('/register', async (req, res, next) => {
  try {
    const { partner_id, name, mobile, city, zone, upi_id, language } = req.body;

    if (!partner_id || !name || !mobile || !city || !zone || !upi_id || !language) {
      return res.status(400).json({
        success: false,
        error: 'All registration fields are required',
      });
    }

    const { data: existingPartner, error: existingError } = await supabase
      .from('workers')
      .select('id')
      .or(`partner_id.eq.${partner_id},mobile.eq.${mobile}`);

    if (existingError) {
      throw existingError;
    }

    if (existingPartner.length) {
      return res.status(409).json({
        success: false,
        error: 'Partner ID or mobile already registered',
      });
    }

    const { data: worker, error: insertError } = await supabase
      .from('workers')
      .insert({
        partner_id,
        name,
        mobile,
        city,
        zone,
        upi_id,
        language,
      })
      .select('id')
      .single();

    if (insertError) {
      throw insertError;
    }

    console.log(`Auth: registered worker ${partner_id}`);

    return res.status(201).json({
      success: true,
      data: {
        worker_id: worker.id,
        message: 'Worker registered successfully',
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/otp/send', async (req, res, next) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({
        success: false,
        error: 'Mobile is required',
      });
    }

    const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const { error } = await supabase.from('otp_store').upsert(
      {
        mobile,
        otp,
        expires_at: formatLocalTimestamp(expiresAt),
        created_at: formatLocalTimestamp(new Date()),
      },
      { onConflict: 'mobile' }
    );

    if (error) {
      throw error;
    }

    console.log(`Auth: OTP issued for ${mobile} -> ${otp}`);

    return res.json({
      success: true,
      data: {
        otp,
        message: 'OTP sent (demo mode)',
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/otp/verify', async (req, res, next) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Mobile and OTP are required',
      });
    }

    const { data: otpRecord, error: otpError } = await supabase
      .from('otp_store')
      .select('*')
      .eq('mobile', mobile)
      .maybeSingle();

    if (otpError) {
      throw otpError;
    }

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        error: 'OTP not found for mobile number',
      });
    }

    if (otp !== otpRecord.otp) {
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP',
      });
    }

    if (new Date(otpRecord.expires_at) < new Date()) {
      await supabase.from('otp_store').delete().eq('mobile', mobile);
      return res.status(400).json({
        success: false,
        error: 'OTP expired',
      });
    }

    const { error: deleteOtpError } = await supabase.from('otp_store').delete().eq('mobile', mobile);

    if (deleteOtpError) {
      throw deleteOtpError;
    }

    const { data: worker, error: workerError } = await supabase
      .from('workers')
      .select('*')
      .eq('mobile', mobile)
      .maybeSingle();

    if (workerError) {
      throw workerError;
    }

    if (!worker) {
      return res.status(404).json({
        success: false,
        error: 'Worker not found for mobile number',
      });
    }

    const token = jwt.sign(
      { worker_id: worker.id, mobile: worker.mobile },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`Auth: OTP verified for ${mobile}`);

    return res.json({
      success: true,
      data: {
        token,
        worker,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
