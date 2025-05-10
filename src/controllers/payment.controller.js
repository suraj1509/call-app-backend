const httpStatus = require('http-status');
const { paymentService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const createOrder = catchAsync(async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, currency, receipt } = req.body;
        const response = await paymentService.createOrder({
            userId,
            amount,
            currency,
            receipt,
        });
        res.status(httpStatus.CREATED).send(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Order creation failed' });
    }
});

const verifyPayment = catchAsync(async (req, res) => {
    try {
        const isValid = await paymentService.verifyPayment(req.body);

        if (isValid) {
            return res.status(200).json({ success: true, message: 'Payment verified' });
        } else {
            return res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Verification error' });
    }
});


module.exports = { createOrder, verifyPayment };
