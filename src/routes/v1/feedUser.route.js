const express = require('express');
const auth = require('../../middlewares/auth');
const {feedUserController} = require('../../controllers');

const router = express.Router();

router
  .route('/review/:userId')
  .post(auth('manageUsers'), feedUserController.createReview)

module.exports = router;

