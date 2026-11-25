const { createHmac, timingSafeEqual } = require('node:crypto');

// The storefront gateway signs the identity headers. Untrusted callers cannot choose a role.
function authenticate(req, res, next) {
  const userId = req.get('x-user-id');
  const role = req.get('x-user-role');
  const timestamp = req.get('x-gateway-timestamp');
  const signature = req.get('x-gateway-signature');
  const secret = process.env.ORDER_DESK_GATEWAY_SECRET;
  const issuedAt = Number(timestamp);
  if (!secret || Buffer.byteLength(secret) < 32
    || !/^[A-Za-z0-9_-]{1,64}$/.test(userId || '')
    || !['customer', 'support', 'warehouse'].includes(role)
    || !/^\d{13}$/.test(timestamp || '')
    || !Number.isSafeInteger(issuedAt)
    || Math.abs(Date.now() - issuedAt) > 300_000
    || !/^[a-f0-9]{64}$/i.test(signature || '')) {
    return res.status(401).json({ error: 'authentication required' });
  }

  const expected = createHmac('sha256', secret).update(`${timestamp}\n${userId}\n${role}`).digest();
  if (!timingSafeEqual(Buffer.from(signature, 'hex'), expected)) {
    return res.status(401).json({ error: 'authentication required' });
  }
  req.user = { id: userId, role };
  return next();
}

module.exports = { authenticate };
