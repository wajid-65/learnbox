const express = require('express');
const router = express.Router();
const { login, register, logout, getMe } = require('../controllers/authController');

router.post('/login',    login);
router.post('/register', register);
router.post('/logout',   logout);
router.get('/me',        getMe);

module.exports = router;
