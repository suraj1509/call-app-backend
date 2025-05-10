const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  razorpay_order_id: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  currency: String,
  status: { type: String, default: 'created' }, // 'created', 'paid', 'failed'
  receipt: String,
  razorpay_payment_id: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);
