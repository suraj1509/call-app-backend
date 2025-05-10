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
router.route('/save/:userId').post(auth('manageUsers'), feedUserController.saveUser)
router.route('/unsave/:userId').post(auth('manageUsers'), feedUserController.unSaveUser)

module.exports = router;

