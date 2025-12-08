const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { auth } = require('../utils/authMiddleware');

// Send SMS notification
router.post('/send-sms', auth, notificationController.sendSMS);

// Send Email notification
router.post('/send-email', auth, notificationController.sendEmail);

// Notify seller about new order
router.post('/notify-seller', auth, notificationController.notifySeller);

module.exports = router;
