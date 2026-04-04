const supabase = require('./src/db/supabase');

async function test() {
  const { data, error } = await supabase.from('otp_store').select('*');
  console.log("OTP Data:", data);
  if (error) console.error("Error:", error);
}

test();
