const { firebaseAdmin } = require('../utils/firebaseAdmin');

const createFcmMessage = async (data) => {
  const { fcmToken, title, body } = data;
  const message = {
    token: fcmToken,
    notification: {
      title,
      body,
    },
    data: {
      customData: 'Some custom data here',
    },
  };

  try {
    await firebaseAdmin.messaging().send(message);
    return;
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

module.exports = { createFcmMessage };
