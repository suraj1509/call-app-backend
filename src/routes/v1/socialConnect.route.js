const express = require('express');
const auth = require('../../middlewares/auth');
const {socialConnectController} = require('../../controllers');

const router = express.Router();

router
  .route('/')
  .post(auth('manageUsers'), socialConnectController.createConnect)

module.exports = router;

