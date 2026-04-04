const axios = require('axios');

async function test() {
  const api = axios.create({ baseURL: 'https://jubilant-charm-production-f9ec.up.railway.app' });
  const mobile = '8888777766';
  
  console.log('Registering worker...');
  try {
    await api.post('/api/auth/register', {
      partner_id: `PT-${Date.now()}`,
      name: 'Test Worker',
      mobile,
      city: 'Delhi',
      zone: 'North',
      upi_id: 'test@upi',
      language: 'en'
    });
    console.log('Worker registered.');
  } catch (err) {
    if (err.response?.status === 409) {
      console.log('Worker already registered.');
    } else {
      console.error('Registration Error:', err.response?.status, err.response?.data);
      return;
    }
  }

  console.log('\nSending OTP...');
  let demoOtp;
  try {
    const res1 = await api.post('/api/auth/otp/send', { mobile });
    console.log('Send OTP Response:', res1.data);
    demoOtp = res1.data.data.otp;
  } catch (err) {
    console.error('Send OTP Error:', err.response?.status, err.response?.data);
    return;
  }

  console.log(`\nVerifying OTP: ${demoOtp}...`);
  try {
    const res2 = await api.post('/api/auth/otp/verify', { mobile, otp: demoOtp });
    console.log('Verify OTP Response:', res2.data);
  } catch (err) {
    console.error('Verify OTP Error:', err.response?.status, err.response?.data);
  }
}

test();
