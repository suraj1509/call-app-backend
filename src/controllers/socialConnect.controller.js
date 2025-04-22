const httpStatus = require('http-status');
const { socialConnectService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const createConnect = catchAsync(async (req, res) => {
  const token = await socialConnectService.createConnect(req.body);
  res.status(httpStatus.CREATED).send(token);
});
module.exports = { createConnect};
