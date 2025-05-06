const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    role: Joi.string().required().valid('user', 'admin'),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getFeedUsers = {
  query: Joi.object().keys({
    role: Joi.string(),
  }),
};

const likeUnlikeUser = {
  params: Joi.object().keys({
    isSwiping: Joi.boolean().default(false),
    longitude: Joi.number(),
    latitude: Joi.number(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const getUsersByName = {
  query: Joi.object().keys({
    name: Joi.string(),
  }),
};

const updateMe = {
  body: Joi.object()
    .keys({
      name: Joi.string(),
      dob: Joi.string(),
      email: Joi.string(),
      countryCode: Joi.string(),
      gender: Joi.string(),
      preferences: Joi.object().keys({
        genderPreference: Joi.number(),
        lookingFor: Joi.number(),
        ageRange: Joi.object().keys({
          min: Joi.number(),
          max: Joi.number(),
        }),
        maxDistance: Joi.number(),
      }),
      wallet: Joi.number(),
      location: Joi.object({
        type: Joi.string().valid('Point').required(),
        coordinates: Joi.array().items(Joi.number().required()).length(2).required(),
        // city: Joi.string().optional(),
        // country: Joi.string().optional(),
      }),
      profileStatusToAdd: Joi.array(),
      profileStatusToRemove: Joi.array(),
      interests: Joi.array().items(
        Joi.object({
          icon: Joi.string(),
          title: Joi.string(),
        })
      ),
      languagesSpoken: Joi.array(),
      permanentAddress: Joi.string(),
      language: Joi.string(),
      referralCode: Joi.optional(),
      currentAddress: Joi.string(),
      originalAddress: Joi.string(),
      profilePhotos: Joi.array(),
      onboardingStage: Joi.number().min(1).max(9),
      isOnboardingCompleted: Joi.boolean().optional(),
      phoneNumber: Joi.optional(),
      about: Joi.string().optional(),
      role: Joi.string().optional(),
      rate: Joi.number().optional(),
      vacationMode: Joi.boolean().optional(),
      notificationMode: Joi.boolean().optional(),
      state: Joi.string().optional(),
      timeSlots: Joi.array().optional(),
      history: Joi.array(),
      reviews: Joi.array(),
      reviewed: Joi.array(),
    })
    .min(1),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().optional(),
      dob: Joi.string().optional(),
      gender: Joi.string().valid('male', 'female', 'other').optional(),
      preferences: Joi.object()
        .keys({
          genderPreference: Joi.string().valid('male', 'female', 'everyone').optional(),
          lookingFor: Joi.string().optional(),
          ageRange: Joi.object()
            .keys({
              min: Joi.number(),
              max: Joi.number(),
            })
            .optional(),
          maxDistance: Joi.number().optional(),
        })
        .optional(),
      location: Joi.object()
        .keys({
          latitude: Joi.number().optional(),
          longitude: Joi.number().optional(),
          city: Joi.string().optional(),
          country: Joi.string().optional(),
        })
        .optional(),
      profilePhotos: Joi.array()
        .items(
          Joi.object({
            url: Joi.string().uri().required().messages({
              'string.base': 'Photo URL must be a string',
              'string.uri': 'Photo URL must be a valid URI',
              'any.required': 'Photo URL is required',
            }),
            isProfilePhoto: Joi.boolean().default(false).messages({
              'boolean.base': 'isProfilePhoto must be a boolean',
            }),
            order: Joi.number().optional(),
          })
        )
        .optional()
        .messages({
          'array.base': 'Profile photos must be an array',
        })
        .min(1),
      onBoarding: Joi.string().optional(),
    })
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUsersByName,
  updateMe,
  getFeedUsers,
  likeUnlikeUser,
};
