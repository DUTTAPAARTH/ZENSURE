const jwt = require('jsonwebtoken');
const supabase = require('../db/supabase');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid Authorization header',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { data: worker, error } = await supabase
      .from('workers')
      .select('*')
      .eq('id', decoded.worker_id)
      .eq('status', 'active')
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!worker) {
      return res.status(401).json({
        success: false,
        error: 'Worker not found or inactive',
      });
    }

    req.worker = worker;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
}

module.exports = authMiddleware;
