const cron = require('node-cron');
const axios = require('axios');

async function mockWeatherCheck() {
  try {
    await axios.get('https://example.com', { timeout: 1500 });
  } catch (error) {
    // Network failure is fine in demo mode.
  }

  const roll = Math.random();
  return {
    shouldTrigger: process.env.NODE_ENV === 'development' && roll > 0.92,
    severity: Number((0.65 + Math.random() * 0.3).toFixed(2)),
  };
}

function startTriggerEngine() {
  console.log('Trigger engine started');

  cron.schedule('*/15 * * * *', async () => {
    console.log('Trigger engine: checking zones...');

    const result = await mockWeatherCheck();

    if (result.shouldTrigger) {
      console.log(`Trigger engine: dev-mode simulated event candidate with severity ${result.severity}`);
    }
  });
}

module.exports = {
  startTriggerEngine,
};
