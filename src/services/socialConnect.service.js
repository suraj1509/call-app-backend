const { db } = require('../utils/firebaseAdmin');
const { RtcTokenBuilder, RtcRole } = require("agora-token");

const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const config = require('../config/config');


const APP_ID = config.agora.appId
const APP_CERTIFICATE = config.agora.appCertificate;
const TOKEN_EXPIRATION = config.agora.tokenExpiration; 

const createConnect = async ({channelName, mode, uid, callerUid, callerName}) => {
  try {
    if (!mode) throw new ApiError(httpStatus.BAD_REQUEST, "Mode is required");

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + TOKEN_EXPIRATION;
    const token = await RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      0,
      RtcRole.PUBLISHER,
      privilegeExpiredTs
    );
    await db.ref(`connect/${uid}`).set({
      mode,         
      channelName,  
      callerUid,          
      token,
      callerName,        
      createdAt: Date.now(),
    });

    return token;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error');
  }
};

module.exports = {
  createConnect,
};