// Resolves the caller from the identity headers set by the storefront gateway.
function authenticate(req, res, next) {
  const userId = req.get('x-user-id');
  if (!userId) {
    return res.status(401).json({ error: 'authentication required' });
  }
  req.user = { id: userId, role: req.get('x-user-role') || 'customer' };
  return next();
}

module.exports = { authenticate };
