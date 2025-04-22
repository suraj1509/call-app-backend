const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { roleRights } = require('../config/roles');
const admin = require('../utils/firebaseAdmin');

const verifyCallback = async (req, token, requiredRights) => {
  try {
    const user = await admin.verifyToken(token); // Decode and validate the token
    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
    }

    req.user = user;

    // if (requiredRights.length) {
    //   const userRights = roleRights.get(user.role);
    //   const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
    //   if (!hasRequiredRights && req.params.userId !== user.id) {
    //     throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
    //   }
    // }
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, error.message || 'Authentication failed');
  }
};

const auth = (...requiredRights) => async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Missing or invalid token');
    }
    await verifyCallback(req, token, requiredRights);

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = auth;
