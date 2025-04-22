const admin = require('firebase-admin');
const path = require('path');

// Path to your Firebase service account key JSON file
// eslint-disable-next-line import/no-dynamic-require
const serviceAccount = require(path.resolve(__dirname, '../config/firebaseServiceAccountKey.json'));

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://datingapp-dev-39a8d-default-rtdb.firebaseio.com',
  storageBucket: 'datingapp-dev-39a8d.firebasestorage.app',
});

/**
 * Verifies a Firebase ID token.
 * @param {string} idToken - The ID token from the client.
 * @returns {Promise<Object>} - Decoded token containing user information.
 */
const verifyToken = async (idToken) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    throw new Error('Invalid Firebase ID token');
  }
};

const setCustomClaims = async (firebaseUid, claims) => {
  try {
    await admin.auth().setCustomUserClaims(firebaseUid, claims);
  } catch (error) {
    console.error('Error setting custom claims:', error);
  }
};

const deleteFirebaseUser = async (uid) => {
  try {
    await admin.auth().deleteUser(uid);
  } catch (error) {
    console.error('Error deleting firebase user:', error);
  }
};

const db = admin.database();
const firebaseAdmin = admin;

module.exports = {
  firebaseAdmin,
  verifyToken,
  setCustomClaims,
  deleteFirebaseUser,
  db,
};
