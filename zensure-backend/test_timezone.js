const storedStr = '2026-04-04 04:15:00';
// Simulating the DB return
const dbReturnedStr = storedStr.replace(' ', 'T'); 

const expiry = new Date(dbReturnedStr); // '2026-04-04T04:15:00'
const nowUTC = new Date('2026-04-04T04:05:00Z');
console.log("Expiry TZ:", expiry.toISOString());
console.log("Now UTC:", nowUTC.toISOString());
console.log("Is expired?", expiry < nowUTC);
