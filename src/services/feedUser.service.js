const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { User } = require('../models');

const createReview = async (targetUserId, newReview) => {
    const user = await User.findById(targetUserId);
    if (!user) throw new Error('User not found');
  
    const existingIndex = user.reviews.findIndex(
      (review) => review.id.toString() === newReview.id.toString()
    );
  
    if (existingIndex !== -1) {
      user.reviews[existingIndex] = newReview;
    } else {
      user.reviews.push(newReview);
    }
  
    await user.save();

    const reviewer = await User.findById(newReview?.id);
    if (!reviewer) throw new Error('Reviewer user not found');
  
    const alreadyReviewed = reviewer.reviewed.some(
      (id) => id.toString() === targetUserId.toString()
    );
  
    if (!alreadyReviewed) {
      reviewer.reviewed.push(targetUserId); 
      await reviewer.save();
    }

    return user.reviews;
};

const blockUser = async (targetUserId, targetedUserId) => {
  console.log('targetUserId', targetUserId);
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) throw new Error('Target user not found');

  const targetedUser = await User.findById(targetedUserId);
  if (!targetedUser) throw new Error('Targeted user not found');

  // Initialize blockedUsers if it doesn't exist
  if (!Array.isArray(targetedUser.blockedUsers)) {
    targetedUser.blockedUsers = [];
  }

  // Add only if not already blocked
  if (!targetedUser.blockedUsers.includes(targetUserId)) {
    targetedUser.blockedUsers.push(targetUserId);
    await targetedUser.save();
  }

  return targetedUser.blockedUsers;
};


const reportUser = async (targetUserId, targettedUserId) => {
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) throw new Error('Target user not found');

  const reportingUser = await User.findById(targettedUserId);
  if (!reportingUser) throw new Error('Reporting user not found');

  // Initialize reportedUsers if it doesn't exist
  if (!Array.isArray(reportingUser.reportedUsers)) {
    reportingUser.reportedUsers = [];
  }

  // Add only if not already reported
  if (!reportingUser.reportedUsers.includes(targetUserId)) {
    reportingUser.reportedUsers.push(targetUserId);
    await reportingUser.save();
  }

  return reportingUser.reportedUsers;
};


module.exports = {
  createReview,
  blockUser,
  reportUser
};