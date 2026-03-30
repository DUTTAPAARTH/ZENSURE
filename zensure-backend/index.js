require('dotenv').config();

const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/auth');
const workerRoutes = require('./src/routes/workers');
const policyRoutes = require('./src/routes/policies');
const claimRoutes = require('./src/routes/claims');
const disruptionRoutes = require('./src/routes/disruptions');
const insurerRoutes = require('./src/routes/insurer');
const errorHandler = require('./src/middleware/errorHandler');
const { startTriggerEngine } = require('./src/services/triggerEngine');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

console.log('Connected to Supabase ✅');

app.get('/health', async (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/disruptions', disruptionRoutes);
app.use('/api/insurer', insurerRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Zensure API running on port ${PORT}`);
  startTriggerEngine();
});
