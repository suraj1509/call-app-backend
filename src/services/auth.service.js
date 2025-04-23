const httpStatus = require('http-status');
const tokenService = require('./token.service');
const userService = require('./user.service');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const { verifyOtp } = require('../utils/firebaseAdmin');
const { Token, User } = require('../models');
const firebaseAdmin = require('../utils/firebaseAdmin');
const { auth } = require('firebase-admin');

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await userService.getUserByEmail(email);
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  return user;
};

/**
 * Login with phone number and OTP
 * @param {string} phoneNumber
 * @param {string} otp
 * @returns {Promise<User>}
 */
const loginUserWithPhoneNumber = async (phoneNumber, otp) => {
  const user = await userService.getUserByPhone(phoneNumber);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Verify OTP using Firebase
  const isOtpValid = await verifyOtp(phoneNumber, otp);
  if (!isOtpValid) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid OTP');
  }

  // Return the user if OTP is valid
  return user;
};

/**
 * Login or register user with Google
 * @param {Object} googleData
 * @returns {Promise<User>}
 */
const loginOrRegisterWithGoogle = async (decodedUser, googleData) => {
  const { email, name } = googleData;
  let onBoardingStage = null;
  let user = null;
  if (!decodedUser?.id) {
    try {
      user = await userService.createUser({
        uid: decodedUser.uid,
        email,
        name,
        isEmailVerified: true,
        signInProvider: 'google',
        profileStatus: ['email'],
        lastActive: new Date(),
      });
    } catch (error) {
      console.log('error creating user using email', error);
      const userRecord = await auth().getUserByEmail(email);
      await auth().deleteUser(userRecord.uid);
      return;
    }
    if (user._id && !decodedUser?.id) {
      await firebaseAdmin.setCustomClaims(decodedUser?.uid, {
        id: user._id,
        isOnboardingCompleted: false,
        onboardingStage: 1,
      });
    }
    onBoardingStage = 1;
  } else {
    user = await userService.updateUserById(decodedUser?.id, {
      lastActive: new Date(),
    });
    onBoardingStage = 2;
  }
  return { user, onBoardingStage };
};

/**
 * Login or register user with Facebook
 * @param {Object} facebookData
 * @returns {Promise<User>}
 */
const loginOrRegisterWithFacebook = async (decodedUser, facebookData) => {
  const { email, name } = facebookData;
  let onBoardingStage = null;
  let user = null;
  if (!decodedUser?.id) {
    try {
      user = await userService.createUser({
        uid: decodedUser.uid,
        email,
        name,
        isEmailVerified: true,
        profileStatus: ['email'],
        lastActive: new Date(),
        authProvider: 'facebook',
      });
    } catch (error) {
      console.log('error creating user using email', error);
      const userRecord = await auth().getUserByEmail(email);
      await auth().deleteUser(userRecord.uid);
      return;
    }
    if (user._id && !decodedUser?.id) {
      await firebaseAdmin.setCustomClaims(decodedUser?.uid, {
        id: user._id,
        isOnboardingCompleted: false,
        onboardingStage: 1,
      });
    }
    onBoardingStage = 1;
  } else {
    user = await userService.updateUserById(decodedUser?.id, {
      lastActive: new Date(),
    });
    onBoardingStage = user.onboardingStage || 1;
  }
  return { user, onBoardingStage };
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await refreshTokenDoc.remove();
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await refreshTokenDoc.remove();
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
    const user = await userService.getUserById(resetPasswordTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await userService.updateUserById(user.id, { password: newPassword });
    await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  }
};

/**
 * Verify email
 * @param {string} verifyEmailToken
 * @returns {Promise}
 */
const verifyEmail = async (verifyEmailToken) => {
  try {
    const verifyEmailTokenDoc = await tokenService.verifyToken(verifyEmailToken, tokenTypes.VERIFY_EMAIL);
    const user = await userService.getUserById(verifyEmailTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await Token.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });
    await userService.updateUserById(user.id, { isEmailVerified: true });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
  }
};

/**
 * Authenticates a user and generates auth tokens
 * @param {User} user
 * @returns {Promise<Object>}
 */
const authenticateUser = async (user) => {
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication failed');
  }
  return tokenService.generateAuthTokens(user);
};

module.exports = {
  loginUserWithEmailAndPassword,
  loginUserWithPhoneNumber,
  loginOrRegisterWithGoogle,
  loginOrRegisterWithFacebook,
  logout,
  refreshAuth,
  resetPassword,
  verifyEmail,
  authenticateUser,
};
