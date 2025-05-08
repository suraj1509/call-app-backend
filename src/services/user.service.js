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
  let user = await User.findById(id).populate('blockedUsers');
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
  const currentUser = await User.findById(userId).select('role blockedUsers reportedUsers');
  if (!currentUser) throw new Error('User not found');

  const targetRole = currentUser.role === 'User' ? 'Employee' : 'User';

  const users = await User.find({
    name: { $regex: name, $options: 'i' },
    _id: { $ne: userId },
    role: targetRole,
  }).select(
    '_id dob name about uid currentPlace permanentAddress interests languagesSpoken profilePhotos'
  );

  const blockedIds = new Set((currentUser.blockedUsers || []).map(id => id.toString()));
  const reportedIds = new Set((currentUser.reportedUsers || []).map(id => id.toString()));

  const filteredUsers = users.filter(user => {
    const idStr = user._id.toString();
    return !blockedIds.has(idStr) && !reportedIds.has(idStr);
  });

  const formattedUsers = filteredUsers.map((user) => {
    const profilePhotoObj = user.profilePhotos?.find((p) => p.isProfilePhoto);
    const profilePhoto = profilePhotoObj ? profilePhotoObj.url : null;

    const age = user.dob
      ? Math.floor((Date.now() - new Date(user.dob).getTime()) / 31536000000)
      : null;

    return {
      _id: user._id,
      name: user.name,
      dob: user.dob,
      about: user.about,
      uid: user.uid,
      currentPlace: user.currentPlace,
      permanentAddress: user.permanentAddress,
      interests: user.interests,
      languagesSpoken: user.languagesSpoken,
      profilePhoto,
      age,
    };
  });

  return formattedUsers;
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
  user.lastActive = Date.now();

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
