const express = require('express');
const controllerServices = require('../../controllers');

const router = express.Router();

router.post('/', controllerServices?.fcmController?.createFcmMessage);

module.exports = router;
