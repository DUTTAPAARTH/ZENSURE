const axios = require('axios');

async function test() {
  const api = axios.create({ baseURL: 'https://jubilant-charm-production-f9ec.up.railway.app' });
  const mobile = '9999888877';

  // 1. Send OTP
  console.log('Sending OTP...');
  let demoOtp;
  try {
    const res1 = await api.post('/api/auth/otp/send', { mobile });
    console.log('Send OTP Response:', res1.data);
    demoOtp = res1.data.data.otp;
  } catch (err) {
    console.error('Send OTP Error:', err.response?.status, err.response?.data);
    return;
  }

  // 2. Verify OTP
  console.log(`\nVerifying OTP: ${demoOtp}...`);
  try {
    const res2 = await api.post('/api/auth/otp/verify', { mobile, otp: demoOtp });
    console.log('Verify OTP Response:', res2.data);
  } catch (err) {
    console.error('Verify OTP Error:', err.response?.status, err.response?.data);
  }
}

test();
