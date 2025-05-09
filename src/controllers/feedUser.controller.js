const httpStatus = require('http-status');
const { feedUserService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const createReview = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const newData = {...req.body, id: req.user.id};
    const response = await feedUserService.createReview(userId, newData);
    res.status(httpStatus.CREATED).send(response);
});

const blockUser = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const id =  req.user.id
    const response = await feedUserService.blockUser(userId, id);
    res.status(httpStatus.CREATED).send(response);
});

const unBlockUser = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const id =  req.user.id
    const response = await feedUserService.unBlockUser(userId, id);
    res.status(httpStatus.CREATED).send(response);
});

const reportUser = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const id =  req.user.id
    const response = await feedUserService.reportUser(userId, id);
    res.status(httpStatus.CREATED).send(response);
});

module.exports = { createReview, blockUser, reportUser, unBlockUser};
