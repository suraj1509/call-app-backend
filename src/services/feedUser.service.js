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

module.exports = {
  createReview,
};