const jwt = require('jsonwebtoken');

// Generate JWT token
exports.generateToken = (payload, secret, expiresIn) => {
  return jwt.sign(payload, secret, { expiresIn });
};

// Verify JWT token
exports.verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};

// Generate access token
exports.generateAccessToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
    companyId: user.companyId
  };
  
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Generate refresh token
exports.generateRefreshToken = (user) => {
  const payload = {
    id: user._id
  };
  
  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

// Generate token pair (access + refresh)
exports.generateTokenPair = (user) => {
  return {
    accessToken: exports.generateAccessToken(user),
    refreshToken: exports.generateRefreshToken(user)
  };
};

// Decode token without verification (for debugging)
exports.decodeToken = (token) => {
  return jwt.decode(token);
};
