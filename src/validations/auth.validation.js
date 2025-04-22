const Joi = require('joi');
const { password } = require('./custom.validation');

const verify = {
  body: Joi.object().keys({
    phoneNumber: Joi.string()
      .pattern(/^\d{1,15}$/) // Ensures 1 to 15 numeric digits
      .required()
      .messages({
        'string.pattern.base': 'Phone number must contain only digits and be up to 15 characters long.',
        'any.required': 'Phone number is required.',
      }),
    countryCode: Joi.string().required().messages({
      'any.required': 'Country code is required.',
      'string.base': 'Country code must be a string.',
    }),
    idToken: Joi.string().required().messages({
      'any.required': 'Firebase ID token is required.',
      'string.base': 'Firebase ID token must be a string.',
    }),
  }),
};

const register = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    gender: Joi.string().valid('male', 'female', 'other').optional(),
    dob: Joi.date().optional(),
    onBoarding: Joi.boolean().optional(),
    isPhoneVerified: Joi.boolean().optional(),
    phoneNumber: Joi.string()
      .pattern(/^\+\d{1,15}$/)
      .optional(),
    orientation: Joi.string().optional(),
    preferences: Joi.object()
      .keys({
        genderPreference: Joi.string().valid('male', 'female', 'other').optional(),
        lookingFor: Joi.string().optional(),
      })
      .optional(),
    profilePhotos: Joi.array()
      .items(
        Joi.object().keys({
          url: Joi.string().uri().optional(),
          isProfilePhoto: Joi.boolean().optional(),
        })
      )
      .optional(),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};
const phoneNumberLogin = {
  body: Joi.object().keys({
    phoneNumber: Joi.string().required(),
    countryCode: Joi.string().required(),
    firebaseOtp: Joi.string().required(),
  }),
};

const googleLogin = Joi.object().keys({
  token: Joi.string().required(),
  // email: Joi.string().email().required(),
  // name: Joi.string().required(),
});

const facebookLogin = Joi.object().keys({
  token: Joi.string().required(),
  email: Joi.string().email().required(),
  name: Joi.string().required(),
});

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
  }),
};

const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

module.exports = {
  verify,
  register,
  login,
  phoneNumberLogin,
  googleLogin,
  facebookLogin,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail,
};
