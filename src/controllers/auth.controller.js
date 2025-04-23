const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService } = require('../services');
const firebaseAdmin = require('../utils/firebaseAdmin'); // Firebase Admin SDK setup
const config = require('../config/config');
const ApiError = require('../utils/ApiError');

const googleClient = new OAuth2Client(config.oauth.googleClientId);

const verify = catchAsync(async (req, res) => {
  const { countryCode, phoneNumber } = req.body;
  const decodedUser = req.user;
  // Check if the user exists
  if (req.user.phone_number !== countryCode + phoneNumber) {
    throw new ApiError('Please enter a valid number');
  }
  let onBoardingStage = null;
  let user = null;
  if (!decodedUser?.id) {
    user = await userService.createUser({
      uid: decodedUser.uid,
      countryCode,
      phoneNumber,
      isPhoneVerified: true,
      signInProvider: 'phone',
      profileStatus: ['phone-number'],
      lastActive: new Date(),
    });
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

  res.status(httpStatus.OK).send({ user, onBoardingStage });
});

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

/**
 * Login or register with phone number using Firebase OTP
 */
const loginWithPhone = catchAsync(async (req, res) => {
  const {
    countryCode,
    phoneNumber,
    // firebaseOtp
  } = req.body;

  // Combine country code and phone number
  const fullPhoneNumber = `${countryCode}${phoneNumber}`;

  // Verify Firebase OTP
  // await firebaseAdmin.verifyOtp(phoneNumber, firebaseOtp);

  // Check if the user exists with the given phone number
  let user = await userService.getUserByPhone(fullPhoneNumber);

  // If the user does not exist, create a new user
  if (!user) {
    user = await userService.createUser({
      phoneNumber: fullPhoneNumber,
      isPhoneVerified: true,
      authProvider: 'firebase',
    });
  }

  // Generate authentication tokens
  let tokens;
  if (user) {
    tokens = await tokenService.generateAuthTokens(user);
  }
  res.send({ user, tokens });
});

const loginWithGoogle = catchAsync(async (req, res) => {
  const { token } = req.body;
  // Verify Google token
  const ticket = await googleClient.verifyIdToken({
    idToken: token,
    audience: config.oauth.googleClientId,
  });

  const payload = ticket.getPayload();
  const { email, name } = payload;

  // Proceed with login or registration
  const decodedUser = req.user;
  const user = await authService.loginOrRegisterWithGoogle(decodedUser, { email, name });
  // const tokens = await tokenService.generateAuthTokens(user);

  res.send(user);
});

const loginWithFacebook = catchAsync(async (req, res) => {
  const { token } = req.body;

  // Verify Facebook token using the debug_token endpoint
  // eslint-disable-next-line max-len
  const debugUrl = `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${config.oauth.facebookAppId}|${config.oauth.facebookAppSecret}`;
  const debugResponse = await axios.get(debugUrl);

  const { data } = debugResponse.data;
  if (!data || !data.is_valid || data.app_id !== config.oauth.facebookAppId) {
    return res.status(400).send({ message: 'Invalid Facebook token' });
  }

  // Fetch user information from Facebook
  const userUrl = `https://graph.facebook.com/me?access_token=${token}&fields=id,name,email`;
  const userResponse = await axios.get(userUrl);
  const { email, name } = userResponse.data;

  if (!email) {
    return res.status(400).send({ message: 'Email is required for Facebook login' });
  }
  const decodedUser = req.user;
  // Proceed with login or registration
  const user = await authService.loginOrRegisterWithFacebook(decodedUser, { email, name });
  // const tokens = await tokenService.generateAuthTokens(user);

  res.send(user);
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  verify,
  register,
  login,
  loginWithPhone,
  loginWithGoogle,
  loginWithFacebook,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
};
