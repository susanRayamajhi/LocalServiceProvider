const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers["x-access-token"] || req.headers["authorization"];

  if (!token) {
    return res.status(403).send({
      message: "No token provided!"
    });
  }

  // Remove 'Bearer ' prefix if present
  const tokenValue = token.startsWith("Bearer ") ? token.slice(7, token.length) : token;

  jwt.verify(tokenValue, 'MyProject2026SecureKey', (err, decoded) => {
  if (err) {
    return res.status(401).send({
      message: "Unauthorized!"
    });
  }
  req.userId = decoded.id; // Attach user ID to the request
  req.role = decoded.role; // Attach role to the request
  next();
  });
  };

  const isAdmin = (req, res, next) => {
  if (req.role !== 'admin') {
  return res.status(403).send({
    message: "Require Admin Role!"
  });
  }
  next();
  };

  const authJwt = {
  verifyToken: verifyToken,
  isAdmin: isAdmin
  };

module.exports = authJwt;
