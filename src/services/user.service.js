const httpStatus = require('http-status');
const _ = require('lodash');
const mongoose = require('mongoose');
const { User, Employer } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Check if phone number is taken
 * @param {string} phoneNumber
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
const isPhoneNumberTaken = async (phoneNumber, excludeUserId) => {
  const user = await User.findOne({ phoneNumber, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  // if (userBody.email && (await User.isEmailTaken(userBody.email))) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  // }
  if (userBody.phoneNumber && (await isPhoneNumberTaken(userBody.phoneNumber))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Phone number already registered');
  }
  return User.create(userBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const queryFeedUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  let user = await User.findById(id);
  return user;
};


/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Get user by phone number
 * @param {string} phoneNumber
 * @returns {Promise<User>}
 */
const getUserByPhone = async (countryCode, phoneNumber) => {
  return User.findOne({ countryCode, phoneNumber });
};

/**
 * @param {string} name
 * @param {string} userId
 * @returns {Promise<User>}
 */
const getUsersByName = async (name, userId) => {
  const users = await User.aggregate([
    {
      $match: { name: { $regex: name, $options: 'i' }, _id: { $ne: mongoose.Types.ObjectId(userId) } },
    },
    {
      $project: {
        _id: 1,
        dob: 1,
        name: 1,
        about: 1,
        uid: 1,
        currentPlace: 1,
        permanentAddress: 1,
        interests: 1,
        languagesSpoken: 1,
        age: {
          $let: {
            vars: {
              age: {
                $divide: [{ $subtract: [{ $toLong: new Date() }, { $toLong: '$dob' }] }, 31536000000],
              },
            },
            in: { $floor: '$$age' },
          },
        },
        profilePhoto: {
          $arrayElemAt: [
            {
              $filter: {
                input: '$profilePhotos',
                as: 'photo',
                cond: { $eq: ['$$photo.isProfilePhoto', true] },
              },
            },
            0,
          ],
        },
      },
    },
    {
      $addFields: {
        profilePhoto: { $ifNull: ['$profilePhoto.url', null] },
      },
    },
  ]);
  return users.length > 0 ? users : [];
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  
  let user = await User.findById(userId); 
  Object.assign(user, updateBody);
  await user.save();
  return user;
};


/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};

const getFeedUsers = async (role) => {
  try {
    if (role === 'User' || role === 'user') {
      const employees = await User.find({ role: 'Employee' });
      return employees;
    } else if (role === 'Employee' || role === 'employee') {
      const users = await User.find({ role: 'User' });
      return users;
    } else {
      throw new Error('Invalid role provided');
    }
  } catch (error) {
    throw new Error('Failed to fetch users: ' + error.message);
  }
};


module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  getUserByPhone,
  isPhoneNumberTaken,
  updateUserById,
  deleteUserById,
  getUsersByName,
  queryFeedUsers,
  getFeedUsers
};
