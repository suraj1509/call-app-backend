const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { Notification } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a notification
 * @param {Object} notificationBody
 * @returns {Promise<Notification>}
 */
const createNotification = async (notificationBody) => {
  return Notification.create(notificationBody);
};

/**
 * Query for notifications
 * @param {Object} filter - MongoDB filter
 * @param {Object} options - Query options (e.g., sortBy, limit, page)
 * @returns {Promise<QueryResult>}
 */
const queryNotifications = async (filter, options) => {
  return Notification.paginate(filter, options);
};

/**
 * Get notification by ID
 * @param {ObjectId} id
 * @returns {Promise<Notification>}
 */
const getNotificationById = async (id) => {
  return Notification.findById(id);
};

/**
 * Get unread notifications for a user
 * @param {ObjectId} userId
 * @returns {Promise<Array<Notification>>}
 */
const getUnreadNotifications = async (userId) => {
  return Notification.find({ userId, isRead: false });
};

/**
 * Update notification by ID
 * @param {ObjectId} notificationId
 * @param {Object} updateBody
 * @returns {Promise<Notification>}
 */
const updateNotificationById = async (notificationId, updateBody) => {
  const notification = await getNotificationById(notificationId);
  if (!notification) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
  }
  Object.assign(notification, updateBody);
  await notification.save();
  return notification;
};

/**
 * Mark notification as read
 * @param {ObjectId} notificationId
 * @returns {Promise<Notification>}
 */
const markAsRead = async (notificationId) => {
  return updateNotificationById(notificationId, { isRead: true });
};

/**
 * Delete notification by ID
 * @param {ObjectId} notificationId
 * @returns {Promise<Notification>}
 */
const deleteNotificationById = async (notificationId) => {
  const notification = await getNotificationById(notificationId);
  if (!notification) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
  }
  await notification.remove();
  return notification;
};

module.exports = {
  createNotification,
  queryNotifications,
  getNotificationById,
  getUnreadNotifications,
  updateNotificationById,
  markAsRead,
  deleteNotificationById,
};
