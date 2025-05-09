const express = require('express');
const auth = require('../../middlewares/auth');
const {feedUserController} = require('../../controllers');

const router = express.Router();

router
  .route('/review/:userId')
  .post(auth('manageUsers'), feedUserController.createReview)
  
router.route('/block/:userId').post(auth('manageUsers'), feedUserController.blockUser)
router.route('/unblock/:userId').post(auth('manageUsers'), feedUserController.unBlockUser)
router.route('/report/:userId').post(auth('manageUsers'), feedUserController.reportUser)

module.exports = router;

