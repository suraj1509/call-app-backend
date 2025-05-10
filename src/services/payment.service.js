const Razorpay = require('razorpay');
const crypto = require('crypto');
const { Order } = require('../models');
const { User } = require('../models');
const config = require('../config/config');

const razorpay = new Razorpay({
  key_id: config.razorpay.keyId,
  key_secret: config.razorpay.keySecret,
});

const createOrder = async ({ userId, amount, currency = 'INR', receipt = 'receipt#1' }) => {
  const options = {
    amount: amount * 100, // convert to paise
    currency,
    receipt,
  };

  const razorpayOrder = await razorpay.orders.create(options);

  const order =  await Order.create({
    user: userId,
    razorpay_order_id: razorpayOrder.id,
    amount,
    currency,
    receipt,
    status: 'created',
  });

  await User.findByIdAndUpdate(userId, {
    $push: { orders: order._id },
  });

  return razorpayOrder;
};

const verifyPayment = async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  const isValid = expectedSignature === razorpay_signature;

  if (isValid) {
    await Order.findOneAndUpdate(
      { razorpay_order_id },
      {
        status: 'paid',
        razorpay_payment_id,
      }
    );
  }

  return isValid;
};

module.exports = {
  createOrder,
  verifyPayment,
};
