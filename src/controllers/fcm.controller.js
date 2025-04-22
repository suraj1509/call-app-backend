const { fcmService } = require('../services');

const createFcmMessage = async (req, res) => {
  try {
    await fcmService.createFcmMessage(req?.body);
    res.status(201).send({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { createFcmMessage };
