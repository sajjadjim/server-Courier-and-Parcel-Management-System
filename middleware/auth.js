const admin = require('../config/firebase');

// 1. Verify Firebase Token
const verifyTokenFB = async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    return res.status(401).send({ message: 'Unauthorized access' });
  }

  const token = authorizationHeader.split(' ')[1];
  if (!token) {
    return res.status(401).send({ message: `Unauthorized access: No Token` });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.decoded = decoded;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).send({ message: 'Forbidden access' });
  }
};

// 2. Verify Admin Role
// Note: We wrap this so we can pass the usersCollection from index.js
const verifyAdmin = (usersCollection) => {
  return async (req, res, next) => {
    const email = req.decoded.email;
    const query = { email };
    const user = await usersCollection.findOne(query);
    if (!user || user.role !== 'admin') {
      return res.status(403).send({ message: 'Forbidden access' });
    }
    next();
  };
};

// CRITICAL: This line exports the functions so index.js can see them
module.exports = { verifyTokenFB, verifyAdmin };