const express = require('express');
const { authUser, getUserProfile, updateUserProfile } = require('../controllers/authController.js');
const { protect } = require('../middleware/authMiddleware.js');

const router = express.Router();

// Only admin login is available (users login through admin login endpoint)
router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

module.exports = router;

