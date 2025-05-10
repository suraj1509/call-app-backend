const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
// const likedUserRoute = require('./likedUser.route');
// const rejectedUserRoute = require('./rejectedUser.route');
// const savedUserRoute = require('./savedUser.route');
// const blockedUserRoute = require('./blockedUser.route');
// const visitedUserRoute = require('./visitedUser.route');
// const chatRoom = require('./chat.route');
// const Message = require('./message.route');
// const Story = require('./story.route');
const SocialConnect = require('./socialConnect.route');
const Fcm = require('./fcm.route');
const docsRoute = require('./docs.route');
const FeedUser = require('./feedUser.route');
const Payment = require('./payment.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/fcm',
    route: Fcm,
  },
  {
    path: '/socialConnect',
    route: SocialConnect,
  },
  {
    path: '/feedUser',
    route: FeedUser,
  },
  {
    path: '/payment',
    route: Payment,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
