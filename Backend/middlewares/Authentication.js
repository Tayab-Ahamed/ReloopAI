const jwt = require('jsonwebtoken');

const normalizeRole = (role) => (role === 'Donar' ? 'Donor' : role);

const getBearerToken = (authorization) => {
  if (!authorization || typeof authorization !== 'string') return null;
  const [scheme, value] = authorization.trim().split(/\s+/, 2);
  return scheme.toLowerCase() === 'bearer' && value ? value : null;
};

const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies?.token || getBearerToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication is required',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.user?.id || !decoded?.user?.role) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token',
      });
    }

    req.user = {
      id: String(decoded.user.id),
      email: decoded.user.email,
      role: normalizeRole(decoded.user.role),
    };
    return next();
  } catch (_error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token',
    });
  }
};

const requireRoles = (...allowedRoles) => {
  const normalizedAllowedRoles = new Set(allowedRoles.map(normalizeRole));

  return (req, res, next) => {
    const role = normalizeRole(req.user?.role);
    if (!role || !normalizedAllowedRoles.has(role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
      });
    }
    return next();
  };
};

const isAdmin = requireRoles('Admin');

module.exports = { authMiddleware, requireRoles, isAdmin, normalizeRole };
