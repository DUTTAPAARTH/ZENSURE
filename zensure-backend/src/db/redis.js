const { createClient } = require('redis');

const redisUrl = process.env.REDIS_URL;
let client = null;

if (redisUrl) {
  client = createClient({
    url: redisUrl,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          console.warn('Redis: Max retries reached. Continuing without Redis.');
          return false;
        }
        return Math.min(retries * 100, 3000);
      }
    }
  });

  client.on('error', (err) => console.error('Redis Client Error', err));
  client.on('connect', () => console.log('Redis: Connected ✅'));

  // Non-blocking connect
  client.connect().catch(err => {
    console.warn('Redis: Failed to connect initially. Check REDIS_URL.');
  });
} else {
  console.warn('Redis: REDIS_URL not set. Redis is disabled.');
}

module.exports = client;
