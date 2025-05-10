const express = require('express');
const auth = require('../../middlewares/auth');
const {paymentController} = require('../../controllers');

const router = express.Router();

router.route('/create-order').post(auth('manageUsers'),paymentController.createOrder)
  
router.route('/verify-payment').post(auth('manageUsers'),paymentController.verifyPayment)

module.exports = router;

