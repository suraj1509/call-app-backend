const httpStatus = require('http-status');
const mongoose = require('mongoose');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');
const firebaseAdmin = require('../utils/firebaseAdmin'); // Firebase Admin SDK setup
const { User } = require('../models');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getFeedUsers = catchAsync(async (req, res) => {
  const result = await userService.getFeedUsers(req.query.role);
  res.send(result);
});

// const getFeedUsers = catchAsync(async (req, res) => {
//   // const uid = req.user.uid;
//   const { isSwiping = true } = req.query;
//   const userId = req?.user?.id;

//   const pipeline = [
//     {
//       // Match the current user to retrieve their preferences
//       $match: { _id: mongoose.Types.ObjectId(userId) },
//     },
//     {
//       // Join preferences with other users in the collection
//       $lookup: {
//         from: 'users', // Assuming the collection is named "users"
//         let: {
//           currentUserId: '$_id',
//           currentGender: '$gender',
//           currentPreferences: '$preferences',
//           likedUsers: '$likedUsers',
//           rejectedUsers: '$rejectedUsers',
//           savedUsers: '$savedUsers',
//         },

//         pipeline: [
//           // Uncomment and use geoNear if you want to filter based on location

//           // {
//           //   $geoNear: {
//           //     near: { type: "Point", coordinates: [longitude, latitude] },
//           //     distanceField: "distance",
//           //     maxDistance: 1000*1000, // Make sure maxDistance is a valid number
//           //     spherical: true
//           //   }
//           // },
//           // Match gender preferences, age range, etc. (same as previous)
//           {
//             $match: {
//               $expr: {
//                 $and: [
//                   { $ne: ['$$currentUserId', '$_id'] },
//                   // ...(isSwiping ? [{ $not: { $in: ['$_id', '$$likedUsers'] } }] : []), // Exclude liked users
//                   ...(isSwiping ? [{ $not: { $in: ['$_id', '$$rejectedUsers'] } }] : []), // Exclude rejected users
//                   { $eq: ['$isOnboardingCompleted', true] },
//                   {
//                     $or: [
//                       { $eq: ['$gender', '$$currentPreferences.genderPreference'] },
//                       { $eq: ['$$currentPreferences.genderPreference', 'everyone'] },
//                     ],
//                   },
//                   // {
//                   //   $or: [
//                   //     { $eq: ["$preferences.genderPreference", "$$currentGender"] },
//                   //     { $eq: ["$preferences.genderPreference", "everyone"] },
//                   //   ],
//                   // },
//                   // {
//                   //   $let: {
//                   //     vars: {
//                   //       age: {
//                   //         $divide: [
//                   //           { $subtract: [{ $toLong: new Date() }, { $toLong: "$dob" }] },
//                   //           31536000000, // milliseconds in a year
//                   //         ],
//                   //       },
//                   //     },
//                   //     in: [
//                   //       { $gte: ["$$age", "$$currentPreferences.ageRange.min"] },
//                   //       { $lte: ["$$age", "$$currentPreferences.ageRange.max"] },
//                   //     ],
//                   //   },
//                   // },
//                 ],
//               },
//             },
//           },
//           {
//             $lookup: {
//               from: 'stories',
//               localField: '_id',
//               foreignField: 'user',
//               as: 'stories',
//             },
//           },
//           {
//             $addFields: {
//               stories: {
//                 $map: {
//                   input: '$stories',
//                   as: 'story',
//                   in: {
//                     id: '$$story._id', // Story ObjectId
//                     // chunks: { $slice: ['$$story.chunks', 1] }, // Keep only the first chunk
//                     url: { $arrayElemAt: ['$$story.chunks.chunkUrl', 0] },
//                     chunkDuration: { $arrayElemAt: ['$$story.chunks.chunkDuration', 0] },
//                     totalChunks: '$$story.totalChunks', // Extract chunkUrl of the first chunk
//                   },
//                 },
//               },
//             },
//           },
//           // Project only the relevant fields and filter profilePhotos
//           {
//             $project: {
//               _id: 1,
//               name: 1,
//               dob: 1,
//               uid: 1,
//               currentAddress: 1,
//               originalAddress: 1,
//               permanentAddress: 1,
//               interests: 1,
//               languagesSpoken: 1,
//               about: 1,
//               stories: 1,
//               gender: {
//                 $switch: {
//                   branches: [
//                     { case: { $eq: ['$gender', 0] }, then: 'Women' },
//                     { case: { $eq: ['$gender', 1] }, then: 'Men' },
//                     { case: { $eq: ['$gender', 2] }, then: 'Others' },
//                   ],
//                   default: 'Unknown',
//                 },
//               },
//               lookingFor: {
//                 $switch: {
//                   branches: [
//                     { case: { $eq: ['$preferences.lookingFor', 0] }, then: 'Long-term partner' },
//                     { case: { $eq: ['$preferences.lookingFor', 1] }, then: 'Long-term, open to short' },
//                     { case: { $eq: ['$preferences.lookingFor', 2] }, then: 'Short-term, open to long' },
//                     { case: { $eq: ['$preferences.lookingFor', 3] }, then: 'Short-term fun' },
//                     { case: { $eq: ['$preferences.lookingFor', 4] }, then: 'New friends' },
//                     { case: { $eq: ['$preferences.lookingFor', 5] }, then: 'Stil figuring it out' },
//                   ],
//                   default: 'Unknown',
//                 },
//               },
//               genderPreference: {
//                 $switch: {
//                   branches: [
//                     { case: { $eq: ['$preferences.genderPreference', 0] }, then: 'Women' },
//                     { case: { $eq: ['$preferences.genderPreference', 1] }, then: 'Men' },
//                     { case: { $eq: ['$preferences.genderPreference', 2] }, then: 'Others' },
//                   ],
//                   default: 'Unknown',
//                 },
//               },
//               lastActive: 1,
//               age: {
//                 $let: {
//                   vars: {
//                     age: {
//                       $divide: [
//                         { $subtract: [{ $toLong: new Date() }, { $toLong: '$dob' }] },
//                         31536000000, // milliseconds in a year
//                       ],
//                     },
//                   },
//                   in: { $floor: '$$age' }, // Round down to the nearest integer
//                 },
//               },
//               profilePhoto: {
//                 $let: {
//                   vars: {
//                     profilePhoto: {
//                       $arrayElemAt: [
//                         {
//                           $filter: {
//                             input: '$profilePhotos',
//                             as: 'photo',
//                             cond: { $eq: ['$$photo.isProfilePhoto', true] },
//                           },
//                         },
//                         0, // Get the first matching profile photo
//                       ],
//                     },
//                   },
//                   in: '$$profilePhoto.url', // Extract the URL from the profile photo
//                 },
//               },
//               profilePhotos: {
//                 $map: {
//                   input: '$profilePhotos',
//                   as: 'photo',
//                   in: '$$photo.url', // Extract all URLs from profilePhotos
//                 },
//               },
//             },
//           },
//           {
//             $addFields: {
//               savedUser: {
//                 $in: ['$_id', '$$savedUsers'],
//               },
//             },
//           },
//           {
//             $addFields: {
//               likedUser: {
//                 $in: ['$_id', '$$likedUsers'],
//               },
//             },
//           },
//           {
//             $match: {
//               likedUser: false, // Exclude saved users
//             },
//           },
//           // Sort by the last active date
//           { $sort: { lastActive: -1 } },
//           // Limit to 20 records
//           { $limit: 20 },
//         ],
//         as: 'matches',
//       },
//     },
//     {
//       // Project only the matches
//       $project: {
//         matches: 1,
//       },
//     },
//   ];

//   const results = await User.aggregate(pipeline);
//   const filteredUsers = results[0]?.matches || [];
//   res.send(filteredUsers);
// });

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.user.id);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  res.send(user);
});

const getUsersByName = catchAsync(async (req, res) => {
  const { name } = req.query;
  const userId = req?.user?.id;
  const users = await userService.getUsersByName(name, userId);
  res.send(users);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const updateMe = catchAsync(async (req, res) => {
  if (req.user.id && req.user.onboardingStage && !req.user.isOnboardingCompleted) {
    await firebaseAdmin.setCustomClaims(req.user?.uid, {
      id: req.user.id,
      isOnboardingCompleted: req.body.onboardingStage >= 2,
      onboardingStage: req.body.onboardingStage,
    });
  }
  if (req.body.onboardingStage >= 2) {
    req.body.isOnboardingCompleted = true;
  }
  if (req?.body?.phoneNumber) {
    const existingUser = await User.findOne({ phoneNumber: req?.body?.phoneNumber });
    // const userPhoneNumberExists = await User.findOne({ _id: req.user.id, phoneNumber: { $exists: true } });
    if (existingUser) {
      return res.send({
        message: 'Phone number already registered',
        status: 'error',
        statusCode: 400,
      });
    }
  }
  if (req?.body?.email) {
    const existingUser = await User.findOne({ email: req?.body?.email });
    // const userEmailExists = await User.findOne({ _id: req.user.id, email: { $exists: true } });
    if (existingUser) {
      return res.send({
        message: 'Email already registered',
        status: 'error',
        statusCode: 400,
      });
    }
  }
  // if (req.body.profileStatusToAdd) {
  //   await User.updateOne(
  //     { _id: req.user.id },
  //     { $addToSet: { profileStatus: { $each: req.body.profileStatusToAdd } } }
  //   );
  // }

  // if (req.body.profileStatusToRemove) {
  //   await User.updateOne({ _id: req.user.id }, { $pull: { profileStatus: { $in: req.body.profileStatusToRemove } } });
  // }

  const user = await userService.updateUserById(req.user.id, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await firebaseAdmin.deleteFirebaseUser(req?.user?.uid);
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUsersByName,
  updateMe,
  getFeedUsers,
};
